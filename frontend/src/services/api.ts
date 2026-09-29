import { User, Student, Department, Course, Subject, AcademicRecord, Attendance, Document, DashboardStats } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.detail || data.message || 'An error occurred while communicating with the server';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ access_token: string; token_type: string; user: User }>(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders(),
    });
    return handleResponse<DashboardStats>(res);
  },

  // Students
  getStudents: async (params: {
    skip?: number;
    limit?: number;
    search?: string;
    department_id?: number;
    course_id?: number;
    year?: number;
    academic_status?: string;
    gender?: string;
    sort_by?: string;
    sort_dir?: string;
  } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await fetch(`${API_BASE_URL}/students?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<{ items: Student[]; total: number; skip: number; limit: number }>(res);
  },

  getStudent: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<Student>(res);
  },

  createStudent: async (studentData: Partial<Student>) => {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse<Student>(res);
  },

  updateStudent: async (id: number, studentData: Partial<Student>) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse<Student>(res);
  },

  deleteStudent: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  uploadStudentPhoto: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/students/${id}/photo`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse<Student>(res);
  },

  // Academic Records
  getStudentAcademicRecords: async (studentId: number) => {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}/academic`, {
      headers: getHeaders(),
    });
    return handleResponse<AcademicRecord[]>(res);
  },

  createAcademicRecord: async (studentId: number, data: Partial<AcademicRecord>) => {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}/academic`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AcademicRecord>(res);
  },

  updateAcademicRecord: async (recordId: number, data: Partial<AcademicRecord>) => {
    const res = await fetch(`${API_BASE_URL}/academic/${recordId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AcademicRecord>(res);
  },

  deleteAcademicRecord: async (recordId: number) => {
    const res = await fetch(`${API_BASE_URL}/academic/${recordId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Attendance
  getStudentAttendance: async (studentId: number) => {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}/attendance`, {
      headers: getHeaders(),
    });
    return handleResponse<Attendance[]>(res);
  },

  createAttendance: async (data: Partial<Attendance>) => {
    const res = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Attendance>(res);
  },

  updateAttendance: async (attendanceId: number, data: Partial<Attendance>) => {
    const res = await fetch(`${API_BASE_URL}/attendance/${attendanceId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Attendance>(res);
  },

  deleteAttendance: async (attendanceId: number) => {
    const res = await fetch(`${API_BASE_URL}/attendance/${attendanceId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Departments
  getDepartments: async () => {
    const res = await fetch(`${API_BASE_URL}/departments`, {
      headers: getHeaders(),
    });
    return handleResponse<Department[]>(res);
  },

  createDepartment: async (dept: Partial<Department>) => {
    const res = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dept),
    });
    return handleResponse<Department>(res);
  },

  updateDepartment: async (id: number, dept: Partial<Department>) => {
    const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dept),
    });
    return handleResponse<Department>(res);
  },

  deleteDepartment: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Courses
  getCourses: async () => {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      headers: getHeaders(),
    });
    return handleResponse<Course[]>(res);
  },

  createCourse: async (course: Partial<Course>) => {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(course),
    });
    return handleResponse<Course>(res);
  },

  updateCourse: async (id: number, course: Partial<Course>) => {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(course),
    });
    return handleResponse<Course>(res);
  },

  deleteCourse: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  getCourseSubjects: async (courseId: number) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/subjects`, {
      headers: getHeaders(),
    });
    return handleResponse<Subject[]>(res);
  },

  createCourseSubject: async (courseId: number, subject: Partial<Subject>) => {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/subjects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subject),
    });
    return handleResponse<Subject>(res);
  },

  // Documents
  getStudentDocuments: async (studentId: number) => {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}/documents`, {
      headers: getHeaders(),
    });
    return handleResponse<Document[]>(res);
  },

  uploadStudentDocument: async (studentId: number, title: string, docType: string, file: File) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('doc_type', docType);
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/students/${studentId}/documents`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse<Document>(res);
  },

  deleteDocument: async (docId: number) => {
    const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  getDocumentDownloadUrl: (docId: number) => `${API_BASE_URL}/documents/${docId}/download`,

  // Reports
  getStudentsReport: async (params?: { department_id?: number; academic_status?: string }) => {
    const query = new URLSearchParams();
    if (params?.department_id) query.append('department_id', String(params.department_id));
    if (params?.academic_status) query.append('academic_status', params.academic_status);
    const res = await fetch(`${API_BASE_URL}/reports/students?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  getAttendanceReport: async (params?: { min_percentage?: number; max_percentage?: number }) => {
    const query = new URLSearchParams();
    if (params?.min_percentage !== undefined) query.append('min_percentage', String(params.min_percentage));
    if (params?.max_percentage !== undefined) query.append('max_percentage', String(params.max_percentage));
    const res = await fetch(`${API_BASE_URL}/reports/attendance?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  getAcademicReport: async (maxCgpa?: number) => {
    const query = new URLSearchParams();
    if (maxCgpa !== undefined) query.append('max_cgpa', String(maxCgpa));
    const res = await fetch(`${API_BASE_URL}/reports/academic?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse<any[]>(res);
  },

  getExportDownloadUrl: (reportType: string, format: 'csv' | 'excel') => {
    return `${API_BASE_URL}/reports/export?report_type=${reportType}&format=${format}`;
  },

  // Users Management
  getUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  createUser: async (userData: any) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(res);
  },

  updateUser: async (id: number, userData: any) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<User>(res);
  },

  deleteUser: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};
