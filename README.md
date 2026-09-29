# Student Record Management System 🎓

A full-stack, enterprise-grade **Student Record Management System** designed for modern colleges and educational institutions. Built with **React.js, TypeScript, Tailwind CSS, Python (FastAPI), SQLAlchemy, and PostgreSQL/SQLite**.

---

## 🌟 Key Features

### 🔐 1. Role-Based Access Control (RBAC)
- **Admin**: Full system access (Manage Students, Departments, Courses, System Users, Analytics, Reports & Data Exports).
- **Faculty / Staff**: Manage student academic records, subject marks, attendance compliance, and generate reports.
- **Student**: View personal profile, academic mark sheets, attendance progress, and download official PDF student reports.

### 📊 2. Interactive Analytics Dashboard
- Key performance metric cards: Total Students, Active vs Graduated, Average CGPA, Average Attendance.
- Visual charts:
  - Students by Department (Bar Chart)
  - CGPA Performance Distribution (Histogram)
  - Cohort Strength by Academic Year
  - Campus Gender Demographics (Pie Chart)
- Automated Risk Alerts for Low Attendance (&lt;75%) and Academic Risk (&lt;6.0 CGPA).

### 📁 3. Student Management & Profile
- **Comprehensive Profiles**: Personal details, Academic enrollment, Parent/Guardian details, Skills, Certifications, Achievements.
- **Document Manager**: Upload ID Proofs, Mark Sheets, Bonafide Certificates, and Transfer Certificates with size & file type validation.
- **PDF Report Generator**: Client-side single-click generation of official student profile documents.
- **Advanced Filtering**: Live search by Register Number, Name, Email, Department, Academic Year, and Status with sorting & pagination.

### 🎓 4. Academic Records & Automated CGPA Engine
- Subject-wise internal and external mark management.
- Automated Grade & Grade Point calculation (O, A+, A, B+, B, C, F).
- Real-time student CGPA re-calculation on mark updates.

### 📋 5. Attendance Management
- Subject-wise class attendance tracking.
- Automated compliance percentage calculator.
- Warning badges for students failing mandatory 75% attendance limits.

### 📄 6. Reports & Data Export
- Filterable reports for Student Directory, Attendance Compliance, and Academic Performance.
- Export options in **PDF, Excel (.xlsx), and CSV** formats.

---

## 🚀 Recommended Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS v4, Lucide React Icons, Recharts, jsPDF |
| **Backend** | Python 3.11/3.14, FastAPI, Pydantic v2, PyJWT, Bcrypt Hashing |
| **Database** | SQLAlchemy ORM with SQLite (Default) or PostgreSQL |
| **DevOps** | Docker, Docker Compose, Uvicorn |

---

## 🔑 Demo Login Credentials

For quick evaluation, use the one-click demo login buttons on the login screen or enter the following credentials:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `admin123` | Full Access (All features & User management) |
| **Faculty** | `faculty@college.edu` | `faculty123` | Staff Access (Students, Marks, Attendance, Reports) |
| **Student** | `student@college.edu` | `student123` | Student View (Own Profile, Marks, Attendance) |

---

## 🛠️ Quick Start Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data (Departments, Courses, 20 Students, Marks, Accounts)
python -m app.seed

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API docs will be available at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install frontend packages
npm install

# Start Vite React development server
npm run dev -- --host 127.0.0.1 --port 3000
```

Open your browser at: **[http://127.0.0.1:3000/](http://127.0.0.1:3000/)**

---

## 🐳 Docker Setup

Run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📂 Project Structure

```
student-record-management/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── v1/ (auth, students, academic, attendance, departments, courses, documents, reports, dashboard, users)
│   │   ├── core/ (config.py, database.py, security.py)
│   │   ├── models/ (SQLAlchemy models)
│   │   ├── schemas/ (Pydantic models)
│   │   ├── main.py (FastAPI entrypoint)
│   │   └── seed.py (Database seeder)
│   ├── uploads/ (Static file storage for photos & documents)
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/ (Sidebar, Navbar, Layout, Modal, ConfirmDialog, StatCard, Toast)
│   │   ├── context/ (AuthContext, ThemeContext)
│   │   ├── pages/ (Login, Dashboard, Students, StudentDetail, AcademicRecords, Attendance, Departments, Courses, Documents, Reports, Users, Settings, Profile, Unauthorized)
│   │   ├── services/ (api.ts)
│   │   ├── types/ (index.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📄 License
MIT License. Built for Educational & Production Use.
