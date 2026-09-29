import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, Department, Course } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap, 
  Loader2,
  FileSpreadsheet,
  CheckSquare,
  Square
} from 'lucide-react';

interface StudentsProps {
  onNavigate: (path: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Students: React.FC<StudentsProps> = ({ onNavigate, showToast }) => {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const isAdmin = user?.role === 'ADMIN';

  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter & Pagination States
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getStudents({
        skip,
        limit,
        search: search || undefined,
        department_id: selectedDept,
        year: selectedYear,
        academic_status: selectedStatus,
      });
      setStudents(res.items);
      setTotal(res.total);
    } catch (err: any) {
      showToast(err.message || 'Error fetching students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [skip, search, selectedDept, selectedYear, selectedStatus]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [dList, cList] = await Promise.all([api.getDepartments(), api.getCourses()]);
        setDepartments(dList);
        setCourses(cList);
      } catch (err) {}
    };
    fetchMetadata();
  }, []);

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (currentStudent.id) {
        await api.updateStudent(currentStudent.id, currentStudent);
        showToast('Student updated successfully!', 'success');
        setIsEditModalOpen(false);
      } else {
        await api.createStudent(currentStudent);
        showToast('New student created successfully!', 'success');
        setIsAddModalOpen(false);
      }
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to save student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentStudent.id) return;
    setActionLoading(true);
    try {
      await api.deleteStudent(currentStudent.id);
      showToast('Student deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete student', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleExportCSV = () => {
    window.open(api.getExportDownloadUrl('students', 'csv'), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Student Directory & Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic profiles, course assignments, and personal records ({total} Records Total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          {isStaffOrAdmin && (
            <button
              onClick={() => {
                setCurrentStudent({
                  register_number: `REG${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
                  full_name: '',
                  email: '',
                  gender: 'Male',
                  year: 1,
                  semester: 1,
                  section: 'A',
                  admission_year: new Date().getFullYear(),
                  academic_status: 'ACTIVE',
                });
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, Reg No, Name, Email..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSkip(0);
            }}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept || ''}
          onChange={e => {
            setSelectedDept(e.target.value ? Number(e.target.value) : undefined);
            setSkip(0);
          }}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>

        {/* Year Filter */}
        <select
          value={selectedYear || ''}
          onChange={e => {
            setSelectedYear(e.target.value ? Number(e.target.value) : undefined);
            setSkip(0);
          }}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Academic Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus || ''}
          onChange={e => {
            setSelectedStatus(e.target.value || undefined);
            setSkip(0);
          }}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="GRADUATED">GRADUATED</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="ON_LEAVE">ON LEAVE</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Loading student directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No students found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                      {selectedIds.length === students.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Reg Number</th>
                  <th className="py-3.5 px-4">Department / Course</th>
                  <th className="py-3.5 px-4">Year & Sem</th>
                  <th className="py-3.5 px-4">CGPA</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <button onClick={() => toggleSelectOne(s.id)}>
                        {selectedIds.includes(s.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {s.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500">{s.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {s.register_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {s.department_name || 'N/A'}
                      </p>
                      <p className="text-[11px] text-slate-500">{s.course_name || 'N/A'}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      Yr {s.year} - Sem {s.semester} ({s.section})
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs ${
                          s.cgpa >= 8.0
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : s.cgpa >= 6.0
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {s.cgpa.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.academic_status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : s.academic_status === 'GRADUATED'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {s.academic_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => onNavigate(`/students/${s.id}`)}
                        title="View Full Student Profile"
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isStaffOrAdmin && (
                        <button
                          onClick={() => {
                            setCurrentStudent(s);
                            setIsEditModalOpen(true);
                          }}
                          title="Edit Record"
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setCurrentStudent(s);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete Student"
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs font-medium text-slate-500">
            Showing {skip + 1} to {Math.min(skip + limit, total)} of {total} Students
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={skip === 0}
              onClick={() => setSkip(prev => Math.max(0, prev - limit))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Page {Math.floor(skip / limit) + 1} of {Math.ceil(total / limit) || 1}
            </span>
            <button
              disabled={skip + limit >= total}
              onClick={() => setSkip(prev => prev + limit)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Register New Student' : 'Update Student Information'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Register Number *
              </label>
              <input
                type="text"
                required
                value={currentStudent.register_number || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, register_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={currentStudent.full_name || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={currentStudent.email || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={currentStudent.phone || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={currentStudent.department_id || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, department_id: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course
              </label>
              <select
                value={currentStudent.course_id || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, course_id: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <select
                value={currentStudent.year || 1}
                onChange={e => setCurrentStudent({ ...currentStudent, year: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={currentStudent.semester || 1}
                onChange={e => setCurrentStudent({ ...currentStudent, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={currentStudent.gender || 'Male'}
                onChange={e => setCurrentStudent({ ...currentStudent, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Status
              </label>
              <select
                value={currentStudent.academic_status || 'ACTIVE'}
                onChange={e => setCurrentStudent({ ...currentStudent, academic_status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="GRADUATED">GRADUATED</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="ON_LEAVE">ON LEAVE</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to permanently remove student "${currentStudent.full_name}" (${currentStudent.register_number})? This action cannot be undone.`}
        loading={actionLoading}
      />
    </div>
  );
};
