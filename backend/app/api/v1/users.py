from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.models.all_models import User
from app.schemas.all_schemas import UserCreate, UserUpdate, UserOut

router = APIRouter()

@router.get("", response_model=List[UserOut])
def read_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    return db.query(User).all()

@router.post("", response_model=UserOut)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    hashed_pwd = security.get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=user_in.role,
        is_active=user_in.is_active,
        student_id=user_in.student_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.email:
        user.email = user_in.email
    if user_in.full_name:
        user.full_name = user_in.full_name
    if user_in.role:
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.hashed_password = security.get_password_hash(user_in.password)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
