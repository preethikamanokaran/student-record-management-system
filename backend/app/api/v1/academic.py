from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.all_models import AcademicRecord, Student, Subject, User
from app.schemas.all_schemas import AcademicRecordCreate, AcademicRecordUpdate, AcademicRecordOut

router = APIRouter()

def calculate_grade_and_point(total: float):
    if total >= 90:
        return "O", 10.0
    elif total >= 80:
        return "A+", 9.0
    elif total >= 70:
        return "A", 8.0
    elif total >= 60:
        return "B+", 7.0
    elif total >= 50:
        return "B", 6.0
    elif total >= 40:
        return "C", 5.0
    else:
        return "F", 0.0

def recalculate_student_cgpa(student_id: int, db: Session):
    records = db.query(AcademicRecord).filter(AcademicRecord.student_id == student_id).all()
    if not records:
        return
    
    total_weighted_points = 0.0
    total_credits = 0
    for r in records:
        credit = r.subject.credits if r.subject else 3
        total_weighted_points += r.grade_point * credit
        total_credits += credit

    cgpa = round(total_weighted_points / total_credits, 2) if total_credits > 0 else 0.0
    student = db.query(Student).filter(Student.id == student_id).first()
    if student:
        student.cgpa = cgpa
        db.commit()

def build_academic_out(rec: AcademicRecord) -> AcademicRecordOut:
    out = AcademicRecordOut.model_validate(rec)
    if rec.subject:
        out.subject_code = rec.subject.code
        out.subject_name = rec.subject.name
        out.credits = rec.subject.credits
    return out

@router.get("/students/{student_id}/academic", response_model=List[AcademicRecordOut])
def get_student_academic_records(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "STUDENT" and current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these academic records")

    records = db.query(AcademicRecord).filter(AcademicRecord.student_id == student_id).all()
    return [build_academic_out(r) for r in records]

@router.post("/students/{student_id}/academic", response_model=AcademicRecordOut)
def create_academic_record(
    student_id: int,
    record_in: AcademicRecordCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    subject = db.query(Subject).filter(Subject.id == record_in.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    total = record_in.internal_marks + record_in.external_marks
    if total > 100:
        raise HTTPException(status_code=400, detail="Total marks cannot exceed 100")

    grade, grade_point = calculate_grade_and_point(total)

    rec = AcademicRecord(
        student_id=student_id,
        subject_id=record_in.subject_id,
        internal_marks=record_in.internal_marks,
        external_marks=record_in.external_marks,
        total_marks=total,
        grade=grade,
        grade_point=grade_point,
        semester=record_in.semester,
        academic_year=record_in.academic_year
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    recalculate_student_cgpa(student_id, db)
    return build_academic_out(rec)

@router.put("/academic/{record_id}", response_model=AcademicRecordOut)
def update_academic_record(
    record_id: int,
    record_in: AcademicRecordUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    rec = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Academic record not found")

    if record_in.internal_marks is not None:
        rec.internal_marks = record_in.internal_marks
    if record_in.external_marks is not None:
        rec.external_marks = record_in.external_marks
    if record_in.semester is not None:
        rec.semester = record_in.semester
    if record_in.academic_year is not None:
        rec.academic_year = record_in.academic_year

    rec.total_marks = rec.internal_marks + rec.external_marks
    grade, grade_point = calculate_grade_and_point(rec.total_marks)
    rec.grade = grade
    rec.grade_point = grade_point

    db.commit()
    db.refresh(rec)

    recalculate_student_cgpa(rec.student_id, db)
    return build_academic_out(rec)

@router.delete("/academic/{record_id}")
def delete_academic_record(
    record_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    rec = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Academic record not found")

    student_id = rec.student_id
    db.delete(rec)
    db.commit()

    recalculate_student_cgpa(student_id, db)
    return {"message": "Academic record deleted successfully"}
