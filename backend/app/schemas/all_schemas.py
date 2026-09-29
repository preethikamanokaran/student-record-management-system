from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# User
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "STUDENT"
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    student_id: Optional[int] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    student_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Department
class DepartmentBase(BaseModel):
    code: str
    name: str
    hod_name: Optional[str] = None
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    hod_name: Optional[str] = None
    description: Optional[str] = None

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Course
class CourseBase(BaseModel):
    code: str
    name: str
    department_id: int
    duration_years: int = 4
    total_semesters: int = 8
    description: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    department_id: Optional[int] = None
    duration_years: Optional[int] = None
    total_semesters: Optional[int] = None
    description: Optional[str] = None

class CourseOut(CourseBase):
    id: int
    created_at: datetime
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

# Subject
class SubjectBase(BaseModel):
    code: str
    name: str
    course_id: int
    semester: int = 1
    credits: int = 3

class SubjectCreate(SubjectBase):
    pass

class SubjectOut(SubjectBase):
    id: int
    course_name: Optional[str] = None

    class Config:
        from_attributes = True

# Student
class StudentBase(BaseModel):
    register_number: str
    full_name: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_photo: Optional[str] = None

    department_id: Optional[int] = None
    course_id: Optional[int] = None
    batch: Optional[str] = None
    year: int = 1
    semester: int = 1
    section: str = "A"
    admission_year: int = 2023
    cgpa: float = 0.0
    academic_status: str = "ACTIVE"

    parent_name: Optional[str] = None
    parent_relationship: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None
    parent_occupation: Optional[str] = None
    parent_address: Optional[str] = None

    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    achievements: Optional[str] = None
    extracurriculars: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    register_number: Optional[str] = None
    full_name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_photo: Optional[str] = None

    department_id: Optional[int] = None
    course_id: Optional[int] = None
    batch: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    section: Optional[str] = None
    admission_year: Optional[int] = None
    cgpa: Optional[float] = None
    academic_status: Optional[str] = None

    parent_name: Optional[str] = None
    parent_relationship: Optional[str] = None
    parent_phone: Optional[str] = None
    parent_email: Optional[str] = None
    parent_occupation: Optional[str] = None
    parent_address: Optional[str] = None

    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    achievements: Optional[str] = None
    extracurriculars: Optional[str] = None

class StudentOut(StudentBase):
    id: int
    department_name: Optional[str] = None
    course_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Academic Record
class AcademicRecordBase(BaseModel):
    student_id: int
    subject_id: int
    internal_marks: float = 0.0
    external_marks: float = 0.0
    semester: int = 1
    academic_year: str = "2023-2024"

class AcademicRecordCreate(AcademicRecordBase):
    pass

class AcademicRecordUpdate(BaseModel):
    internal_marks: Optional[float] = None
    external_marks: Optional[float] = None
    semester: Optional[int] = None
    academic_year: Optional[str] = None

class AcademicRecordOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    credits: Optional[int] = 3
    internal_marks: float
    external_marks: float
    total_marks: float
    grade: str
    grade_point: float
    semester: int
    academic_year: str
    created_at: datetime

    class Config:
        from_attributes = True

# Attendance
class AttendanceBase(BaseModel):
    student_id: int
    subject_id: int
    total_classes: int = 0
    classes_attended: int = 0
    month: Optional[str] = "Overall"
    academic_year: str = "2023-2024"

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    total_classes: Optional[int] = None
    classes_attended: Optional[int] = None
    month: Optional[str] = None
    academic_year: Optional[str] = None

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    total_classes: int
    classes_attended: int
    classes_absent: int
    attendance_percentage: float
    month: Optional[str] = None
    academic_year: str
    updated_at: datetime

    class Config:
        from_attributes = True

# Document
class DocumentOut(BaseModel):
    id: int
    student_id: int
    title: str
    doc_type: str
    file_path: str
    file_size: int
    file_type: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStats(BaseModel):
    total_students: int
    active_students: int
    graduated_students: int
    total_departments: int
    total_courses: int
    avg_cgpa: float
    avg_attendance: float
    low_attendance_count: int
    academic_risk_count: int
    students_by_department: List[dict]
    students_by_year: List[dict]
    gender_distribution: List[dict]
    cgpa_distribution: List[dict]
