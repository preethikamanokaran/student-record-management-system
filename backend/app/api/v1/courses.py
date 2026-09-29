from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.all_models import Course, Subject, User
from app.schemas.all_schemas import CourseCreate, CourseUpdate, CourseOut, SubjectCreate, SubjectOut

router = APIRouter()

def build_course_out(c: Course) -> CourseOut:
    out = CourseOut.model_validate(c)
    if c.department:
        out.department_name = c.department.name
    return out

@router.get("", response_model=List[CourseOut])
def read_courses(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    courses = db.query(Course).all()
    return [build_course_out(c) for c in courses]

@router.get("/{course_id}", response_model=CourseOut)
def read_course(
    course_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return build_course_out(c)

@router.post("", response_model=CourseOut)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    existing = db.query(Course).filter(Course.code == course_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")

    course = Course(**course_in.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return build_course_out(course)

@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = course_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(c, field, val)

    db.commit()
    db.refresh(c)
    return build_course_out(c)

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(c)
    db.commit()
    return {"message": "Course deleted successfully"}

# Subjects management
@router.get("/{course_id}/subjects", response_model=List[SubjectOut])
def get_course_subjects(
    course_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    subjects = db.query(Subject).filter(Subject.course_id == course_id).all()
    res = []
    for s in subjects:
        s_out = SubjectOut.model_validate(s)
        if s.course:
            s_out.course_name = s.course.name
        res.append(s_out)
    return res

@router.post("/{course_id}/subjects", response_model=SubjectOut)
def create_course_subject(
    course_id: int,
    sub_in: SubjectCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    existing = db.query(Subject).filter(Subject.code == sub_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject code already exists")

    subject = Subject(**sub_in.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)

    s_out = SubjectOut.model_validate(subject)
    if subject.course:
        s_out.course_name = subject.course.name
    return s_out
