from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.all_models import Student, Department, Course, Attendance, User
from app.schemas.all_schemas import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    total_students = db.query(Student).count()
    active_students = db.query(Student).filter(Student.academic_status == "ACTIVE").count()
    graduated_students = db.query(Student).filter(Student.academic_status == "GRADUATED").count()
    total_departments = db.query(Department).count()
    total_courses = db.query(Course).count()

    # Avg CGPA
    avg_cgpa_res = db.query(func.avg(Student.cgpa)).scalar()
    avg_cgpa = round(avg_cgpa_res, 2) if avg_cgpa_res else 0.0

    # Avg Attendance
    avg_att_res = db.query(func.avg(Attendance.attendance_percentage)).scalar()
    avg_attendance = round(avg_att_res, 2) if avg_att_res else 0.0

    # Low attendance count (< 75%)
    # Find distinct students having average attendance < 75%
    sub_att = db.query(
        Attendance.student_id,
        func.avg(Attendance.attendance_percentage).label("avg_pct")
    ).group_by(Attendance.student_id).subquery()
    low_attendance_count = db.query(sub_att).filter(sub_att.c.avg_pct < 75.0).count()

    # Academic risk count (CGPA < 6.0)
    academic_risk_count = db.query(Student).filter(Student.cgpa < 6.0).count()

    # Students by Department
    depts = db.query(Department).all()
    dept_dist = []
    for d in depts:
        c = db.query(Student).filter(Student.department_id == d.id).count()
        dept_dist.append({"name": d.name, "code": d.code, "count": c})

    # Students by Year
    year_dist = []
    for y in [1, 2, 3, 4]:
        c = db.query(Student).filter(Student.year == y).count()
        year_dist.append({"year": f"Year {y}", "count": c})

    # Gender distribution
    genders = ["Male", "Female", "Other"]
    gender_dist = []
    for g in genders:
        c = db.query(Student).filter(Student.gender == g).count()
        gender_dist.append({"gender": g, "count": c})

    # CGPA distribution
    ranges = [
        {"range": "< 6.0", "count": db.query(Student).filter(Student.cgpa < 6.0).count()},
        {"range": "6.0 - 6.99", "count": db.query(Student).filter(Student.cgpa >= 6.0, Student.cgpa < 7.0).count()},
        {"range": "7.0 - 7.99", "count": db.query(Student).filter(Student.cgpa >= 7.0, Student.cgpa < 8.0).count()},
        {"range": "8.0 - 8.99", "count": db.query(Student).filter(Student.cgpa >= 8.0, Student.cgpa < 9.0).count()},
        {"range": "9.0 - 10.0", "count": db.query(Student).filter(Student.cgpa >= 9.0).count()},
    ]

    return {
        "total_students": total_students,
        "active_students": active_students,
        "graduated_students": graduated_students,
        "total_departments": total_departments,
        "total_courses": total_courses,
        "avg_cgpa": avg_cgpa,
        "avg_attendance": avg_attendance,
        "low_attendance_count": low_attendance_count,
        "academic_risk_count": academic_risk_count,
        "students_by_department": dept_dist,
        "students_by_year": year_dist,
        "gender_distribution": gender_dist,
        "cgpa_distribution": ranges
    }
