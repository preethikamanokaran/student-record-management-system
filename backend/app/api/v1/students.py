from typing import List, Optional
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.api import deps
from app.core import security, config
from app.models.all_models import Student, Department, Course, User
from app.schemas.all_schemas import StudentCreate, StudentUpdate, StudentOut

router = APIRouter()

def build_student_out(student: Student) -> StudentOut:
    s_dict = StudentOut.model_validate(student)
    if student.department:
        s_dict.department_name = student.department.name
    if student.course:
        s_dict.course_name = student.course.name
    return s_dict

@router.get("", response_model=dict)
def read_students(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    year: Optional[int] = None,
    academic_status: Optional[str] = None,
    gender: Optional[str] = None,
    sort_by: Optional[str] = "id",
    sort_dir: Optional[str] = "asc"
):
    query = db.query(Student)

    # If logged in user is a student, restrict to their record
    if current_user.role == "STUDENT":
        if not current_user.student_id:
            return {"items": [], "total": 0, "page": 1, "size": limit}
        query = query.filter(Student.id == current_user.student_id)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Student.register_number.ilike(search_pattern),
                Student.full_name.ilike(search_pattern),
                Student.email.ilike(search_pattern),
                Student.phone.ilike(search_pattern)
            )
        )

    if department_id:
        query = query.filter(Student.department_id == department_id)
    if course_id:
        query = query.filter(Student.course_id == course_id)
    if year:
        query = query.filter(Student.year == year)
    if academic_status:
        query = query.filter(Student.academic_status == academic_status)
    if gender:
        query = query.filter(Student.gender == gender)

    total = query.count()

    # Sorting
    sort_attr = getattr(Student, sort_by, Student.id)
    if sort_dir == "desc":
        query = query.order_by(desc(sort_attr))
    else:
        query = query.order_by(asc(sort_attr))

    students = query.offset(skip).limit(limit).all()
    
    items = [build_student_out(s) for s in students]
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("", response_model=StudentOut)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    # Check duplicate register_number or email
    existing_reg = db.query(Student).filter(Student.register_number == student_in.register_number).first()
    if existing_reg:
        raise HTTPException(status_code=400, detail="Student with this Register Number already exists")

    existing_email = db.query(Student).filter(Student.email == student_in.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Student with this Email already exists")

    student_data = student_in.model_dump()
    student = Student(**student_data)
    db.add(student)
    db.commit()
    db.refresh(student)

    # Create associated user account for student login if user doesn't exist
    user_account = db.query(User).filter(User.email == student.email).first()
    if not user_account:
        default_pwd = security.get_password_hash("student123")
        user_account = User(
            email=student.email,
            full_name=student.full_name,
            hashed_password=default_pwd,
            role="STUDENT",
            student_id=student.id
        )
        db.add(user_account)
        db.commit()

    return build_student_out(student)

@router.get("/{student_id}", response_model=StudentOut)
def read_student(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "STUDENT" and current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this student profile")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return build_student_out(student)

@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    student_in: StudentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    # Update associated user name or email if changed
    user_account = db.query(User).filter(User.student_id == student.id).first()
    if user_account:
        if student_in.full_name:
            user_account.full_name = student_in.full_name
        if student_in.email:
            user_account.email = student_in.email
        db.commit()

    return build_student_out(student)

@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Delete associated user account
    user_account = db.query(User).filter(User.student_id == student.id).first()
    if user_account:
        db.delete(user_account)

    db.delete(student)
    db.commit()
    return {"message": f"Student {student_id} deleted successfully"}

@router.post("/{student_id}/photo", response_model=StudentOut)
def upload_profile_photo(
    student_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    os.makedirs(config.settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"photo_{student_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(config.settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    student.profile_photo = f"/uploads/{unique_filename}"
    db.commit()
    db.refresh(student)

    return build_student_out(student)
