from fastapi import APIRouter

from app.api.v1 import (
    auth,
    students,
    academic,
    attendance,
    departments,
    courses,
    documents,
    reports,
    dashboard,
    users
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(academic.router, tags=["Academic Records"])
api_router.include_router(attendance.router, tags=["Attendance Management"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses & Subjects"])
api_router.include_router(documents.router, tags=["Student Documents"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Exports"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Statistics"])
api_router.include_router(users.router, prefix="/users", tags=["User Management"])
