from typing import Optional
import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd

from app.api import deps
from app.models.all_models import Student, Department, Course, Attendance, AcademicRecord, User

router = APIRouter()

@router.get("/students")
def get_students_report(
    department_id: Optional[int] = None,
    academic_status: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    query = db.query(Student)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if academic_status:
        query = query.filter(Student.academic_status == academic_status)

    students = query.all()
    res = []
    for s in students:
        res.append({
            "id": s.id,
            "register_number": s.register_number,
            "full_name": s.full_name,
            "email": s.email,
            "phone": s.phone,
            "department": s.department.name if s.department else "",
            "course": s.course.name if s.course else "",
            "year": s.year,
            "semester": s.semester,
            "cgpa": s.cgpa,
            "status": s.academic_status
        })
    return res

@router.get("/attendance")
def get_attendance_report(
    min_percentage: float = 0.0,
    max_percentage: float = 100.0,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    sub = db.query(
        Attendance.student_id,
        func.avg(Attendance.attendance_percentage).label("avg_pct"),
        func.sum(Attendance.total_classes).label("total_cls"),
        func.sum(Attendance.classes_attended).label("attended_cls")
    ).group_by(Attendance.student_id).subquery()

    results = db.query(Student, sub.c.avg_pct, sub.c.total_cls, sub.c.attended_cls)\
        .join(sub, Student.id == sub.c.student_id)\
        .filter(sub.c.avg_pct >= min_percentage, sub.c.avg_pct <= max_percentage)\
        .all()

    report = []
    for student, avg_pct, total_cls, attended_cls in results:
        report.append({
            "student_id": student.id,
            "register_number": student.register_number,
            "full_name": student.full_name,
            "department": student.department.name if student.department else "",
            "year": student.year,
            "total_classes": total_cls or 0,
            "classes_attended": attended_cls or 0,
            "attendance_percentage": round(avg_pct, 2) if avg_pct else 0.0,
            "is_low_attendance": (avg_pct < 75.0) if avg_pct else False
        })
    return report

@router.get("/academic")
def get_academic_report(
    max_cgpa: Optional[float] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    query = db.query(Student)
    if max_cgpa is not None:
        query = query.filter(Student.cgpa <= max_cgpa)

    students = query.order_by(Student.cgpa.asc()).all()
    report = []
    for s in students:
        report.append({
            "student_id": s.id,
            "register_number": s.register_number,
            "full_name": s.full_name,
            "department": s.department.name if s.department else "",
            "year": s.year,
            "cgpa": s.cgpa,
            "academic_status": s.academic_status,
            "is_at_risk": s.cgpa < 6.0
        })
    return report

@router.get("/export")
def export_report(
    report_type: str = "students",  # students, attendance, academic
    format: str = "csv",  # csv or excel
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    if report_type == "students":
        data = get_students_report(db=db, current_user=current_user)
    elif report_type == "attendance":
        data = get_attendance_report(db=db, current_user=current_user)
    elif report_type == "academic":
        data = get_academic_report(db=db, current_user=current_user)
    else:
        raise HTTPException(status_code=400, detail="Invalid report_type")

    df = pd.DataFrame(data)

    if format == "excel":
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name=report_type.capitalize())
        output.seek(0)
        filename = f"{report_type}_report.xlsx"
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return StreamingResponse(
            output,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    else:
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        filename = f"{report_type}_report.csv"
        media_type = "text/csv"
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
