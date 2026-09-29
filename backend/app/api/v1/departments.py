from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.all_models import Department, User
from app.schemas.all_schemas import DepartmentCreate, DepartmentUpdate, DepartmentOut

router = APIRouter()

@router.get("", response_model=List[DepartmentOut])
def read_departments(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    return db.query(Department).all()

@router.get("/{department_id}", response_model=DepartmentOut)
def read_department(
    department_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept

@router.post("", response_model=DepartmentOut)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    existing = db.query(Department).filter(Department.code == dept_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department code already exists")

    dept = Department(**dept_in.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.put("/{department_id}", response_model=DepartmentOut)
def update_department(
    department_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    update_data = dept_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(dept, field, val)

    db.commit()
    db.refresh(dept)
    return dept

@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    db.delete(dept)
    db.commit()
    return {"message": "Department deleted successfully"}
