from typing import List
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api import deps
from app.core import config
from app.models.all_models import Document, Student, User
from app.schemas.all_schemas import DocumentOut

router = APIRouter()

ALLOWED_TYPES = ["pdf", "jpg", "jpeg", "png", "doc", "docx"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.get("/students/{student_id}/documents", response_model=List[DocumentOut])
def get_student_documents(
    student_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role == "STUDENT" and current_user.student_id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these documents")

    return db.query(Document).filter(Document.student_id == student_id).all()

@router.post("/students/{student_id}/documents", response_model=DocumentOut)
def upload_student_document(
    student_id: int,
    title: str = Form(...),
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    ext = os.path.splitext(file.filename)[1].lstrip(".").lower()
    if ext not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_TYPES)}"
        )

    file_bytes = file.file.read()
    file_size = len(file_bytes)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    os.makedirs(config.settings.UPLOAD_DIR, exist_ok=True)
    unique_name = f"doc_{student_id}_{uuid.uuid4().hex[:8]}.{ext}"
    saved_path = os.path.join(config.settings.UPLOAD_DIR, unique_name)

    with open(saved_path, "wb") as f:
        f.write(file_bytes)

    doc = Document(
        student_id=student_id,
        title=title,
        doc_type=doc_type,
        file_path=saved_path,
        file_size=file_size,
        file_type=ext
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/documents/{doc_id}/download")
def download_document(
    doc_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if current_user.role == "STUDENT" and current_user.student_id != doc.student_id:
        raise HTTPException(status_code=403, detail="Not authorized to download this document")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File non-existent on server")

    return FileResponse(doc.file_path, filename=os.path.basename(doc.file_path))

@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_or_admin)
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
