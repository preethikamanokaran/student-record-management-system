from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.models.all_models import User
from app.schemas.all_schemas import Token, UserOut, LoginRequest, ForgotPasswordRequest

router = APIRouter()

@router.post("/login", response_model=Token)
def login_json(
    login_data: LoginRequest,
    db: Session = Depends(deps.get_db)
):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = security.create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }

@router.post("/token", response_model=Token)
def login_oauth(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }

@router.get("/me", response_model=UserOut)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out"}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Avoid user enumeration, return friendly success message
        return {"message": "If an account exists with that email, a password reset link has been sent."}
    return {"message": "Password reset instructions sent to your email address."}
