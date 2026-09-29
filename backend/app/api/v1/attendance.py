from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.all_models import Attendance, Student, Subject, User
from app.schemas.all_schemas import AttendanceCreate, AttendanceUpdate, AttendanceOut

router = APIRouter()

def build_attendance_out(att: Attendance) -> AttendanceOut:
    out = AttendanceOut.model_validate(att)
    if att.subject:
        out.subject_code = att.subject.code
        out.subject_name = att.subject.name
    return out

@router.get("/students/{student_id}/attendance", response_model=List[AttendanceOut])
def get_student_attendance(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "STUDENT" and current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this attendance data")

    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    return [build_attendance_out(r) for r in records]

@router.post("/attendance", response_model=AttendanceOut)
def create_attendance(
    att_in: AttendanceCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    student = db.query(Student).filter(Student.id == att_in.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    subject = db.query(Subject).filter(Subject.id == att_in.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if att_in.classes_attended > att_in.total_classes:
        raise HTTPException(status_code=400, detail="Classes attended cannot exceed total classes")

    classes_absent = att_in.total_classes - att_in.classes_attended
    pct = round((att_in.classes_attended / att_in.total_classes * 100), 2) if att_in.total_classes > 0 else 0.0

    # Check existing attendance record for same student and subject and month
    existing = db.query(Attendance).filter(
        Attendance.student_id == att_in.student_id,
        Attendance.subject_id == att_in.subject_id,
        Attendance.month == att_in.month
    ).first()

    if existing:
        existing.total_classes = att_in.total_classes
        existing.classes_attended = att_in.classes_attended
        existing.classes_absent = classes_absent
        existing.attendance_percentage = pct
        existing.academic_year = att_in.academic_year
        db.commit()
        db.refresh(existing)
        return build_attendance_out(existing)

    att = Attendance(
        student_id=att_in.student_id,
        subject_id=att_in.subject_id,
        total_classes=att_in.total_classes,
        classes_attended=att_in.classes_attended,
        classes_absent=classes_absent,
        attendance_percentage=pct,
        month=att_in.month,
        academic_year=att_in.academic_year
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return build_attendance_out(att)

@router.put("/attendance/{attendance_id}", response_model=AttendanceOut)
def update_attendance(
    attendance_id: int,
    att_in: AttendanceUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    if att_in.total_classes is not None:
        att.total_classes = att_in.total_classes
    if att_in.classes_attended is not None:
        att.classes_attended = att_in.classes_attended
    if att_in.month is not None:
        att.month = att_in.month
    if att_in.academic_year is not None:
        att.academic_year = att_in.academic_year

    if att.classes_attended > att.total_classes:
        raise HTTPException(status_code=400, detail="Classes attended cannot exceed total classes")

    att.classes_absent = att.total_classes - att.classes_attended
    att.attendance_percentage = round((att.classes_attended / att.total_classes * 100), 2) if att.total_classes > 0 else 0.0

    db.commit()
    db.refresh(att)
    return build_attendance_out(att)

@router.delete("/attendance/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    db.delete(att)
    db.commit()
    return {"message": "Attendance record deleted successfully"}
