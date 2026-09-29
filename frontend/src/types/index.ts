export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  student_id?: number | null;
  created_at: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  hod_name?: string;
  description?: string;
  created_at: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  department_id: number;
  department_name?: string;
  duration_years: number;
  total_semesters: number;
  description?: string;
  created_at: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  course_id: number;
  course_name?: string;
  semester: number;
  credits: number;
}

export interface Student {
  id: number;
  register_number: string;
  full_name: string;
  dob?: string;
  gender?: string;
  email: string;
  phone?: string;
  address?: string;
  profile_photo?: string;

  department_id?: number;
  department_name?: string;
  course_id?: number;
  course_name?: string;
  batch?: string;
  year: number;
  semester: number;
  section: string;
  admission_year: number;
  cgpa: number;
  academic_status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'ON_LEAVE';

  parent_name?: string;
  parent_relationship?: string;
  parent_phone?: string;
  parent_email?: string;
  parent_occupation?: string;
  parent_address?: string;

  blood_group?: string;
  emergency_contact?: string;
  skills?: string;
  certifications?: string;
  achievements?: string;
  extracurriculars?: string;

  created_at: string;
  updated_at: string;
}

export interface AcademicRecord {
  id: number;
  student_id: number;
  subject_id: number;
  subject_code?: string;
  subject_name?: string;
  credits?: number;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
  grade: string;
  grade_point: number;
  semester: number;
  academic_year: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  student_id: number;
  subject_id: number;
  subject_code?: string;
  subject_name?: string;
  total_classes: number;
  classes_attended: number;
  classes_absent: number;
  attendance_percentage: number;
  month?: string;
  academic_year: string;
  updated_at: string;
}

export interface Document {
  id: number;
  student_id: number;
  title: string;
  doc_type: 'ID_PROOF' | 'CERTIFICATE' | 'MARK_SHEET' | 'BONAFIDE' | 'TRANSFER' | 'OTHER';
  file_path: string;
  file_size: number;
  file_type?: string;
  uploaded_at: string;
}

export interface DashboardStats {
  total_students: number;
  active_students: number;
  graduated_students: number;
  total_departments: number;
  total_courses: number;
  avg_cgpa: number;
  avg_attendance: number;
  low_attendance_count: number;
  academic_risk_count: number;
  students_by_department: { name: string; code: string; count: number }[];
  students_by_year: { year: string; count: number }[];
  gender_distribution: { gender: string; count: number }[];
  cgpa_distribution: { range: string; count: number }[];
}
