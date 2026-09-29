from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="STUDENT")  # ADMIN, FACULTY, STUDENT
    is_active = Column(Boolean, default=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", foreign_keys=[student_id])

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hod_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    courses = relationship("Course", back_populates="department", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="department")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    duration_years = Column(Integer, default=4)
    total_semesters = Column(Integer, default=8)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="courses")
    students = relationship("Student", back_populates="course")
    subjects = relationship("Subject", back_populates="course", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    semester = Column(Integer, nullable=False, default=1)
    credits = Column(Integer, nullable=False, default=3)

    course = relationship("Course", back_populates="subjects")
    academic_records = relationship("AcademicRecord", back_populates="subject")
    attendance_records = relationship("Attendance", back_populates="subject")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    register_number = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    dob = Column(String(50), nullable=True)
    gender = Column(String(20), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    profile_photo = Column(String(500), nullable=True)

    # Academic info
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    batch = Column(String(50), nullable=True)
    year = Column(Integer, default=1)
    semester = Column(Integer, default=1)
    section = Column(String(10), default="A")
    admission_year = Column(Integer, default=2023)
    cgpa = Column(Float, default=0.0)
    academic_status = Column(String(50), default="ACTIVE")  # ACTIVE, GRADUATED, SUSPENDED, ON_LEAVE

    # Parent/Guardian
    parent_name = Column(String(255), nullable=True)
    parent_relationship = Column(String(100), nullable=True)
    parent_phone = Column(String(50), nullable=True)
    parent_email = Column(String(255), nullable=True)
    parent_occupation = Column(String(255), nullable=True)
    parent_address = Column(Text, nullable=True)

    # Additional
    blood_group = Column(String(20), nullable=True)
    emergency_contact = Column(String(50), nullable=True)
    skills = Column(Text, nullable=True)  # Comma separated
    certifications = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    extracurriculars = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="students")
    course = relationship("Course", back_populates="students")
    academic_records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="student", cascade="all, delete-orphan")

class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    internal_marks = Column(Float, default=0.0)
    external_marks = Column(Float, default=0.0)
    total_marks = Column(Float, default=0.0)
    grade = Column(String(10), default="F")
    grade_point = Column(Float, default=0.0)
    semester = Column(Integer, default=1)
    academic_year = Column(String(50), default="2023-2024")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="academic_records")
    subject = relationship("Subject", back_populates="academic_records")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    total_classes = Column(Integer, default=0)
    classes_attended = Column(Integer, default=0)
    classes_absent = Column(Integer, default=0)
    attendance_percentage = Column(Float, default=0.0)
    month = Column(String(50), nullable=True)
    academic_year = Column(String(50), default="2023-2024")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="attendance_records")
    subject = relationship("Subject", back_populates="attendance_records")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    title = Column(String(255), nullable=False)
    doc_type = Column(String(50), nullable=False)  # ID_PROOF, CERTIFICATE, MARK_SHEET, BONAFIDE, TRANSFER, OTHER
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    file_type = Column(String(100), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="documents")
