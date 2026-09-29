import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Course, Department, Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { BookOpen, Plus, Edit3, Trash2, Loader2, ListChecks } from 'lucide-react';

interface CoursesProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Courses: React.FC<CoursesProps> = ({ showToast }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Partial<Course>>({});
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<Subject[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // New subject inline
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(3);
  const [newSubSem, setNewSubSem] = useState(1);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [cData, dData] = await Promise.all([api.getCourses(), api.getDepartments()]);
      setCourses(cData);
      setDepartments(dData);
    } catch (err: any) {
      showToast(err.message || 'Error fetching courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse.department_id) {
      showToast('Please select a department', 'error');
      return;
    }
    setActionLoading(true);
    try {
      if (editingCourse.id) {
        await api.updateCourse(editingCourse.id, editingCourse);
        showToast('Course updated', 'success');
      } else {
        await api.createCourse(editingCourse);
        showToast('Course created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Failed to save course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!editingCourse.id) return;
    setActionLoading(true);
    try {
      await api.deleteCourse(editingCourse.id);
      showToast('Course deleted', 'success');
      setIsDeleteOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openSubjectsModal = async (c: Course) => {
    setEditingCourse(c);
    try {
      const subs = await api.getCourseSubjects(c.id);
      setSelectedCourseSubjects(subs);
      setIsSubjectsOpen(true);
    } catch (err) {}
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse.id || !newSubCode || !newSubName) return;
    try {
      await api.createCourseSubject(editingCourse.id, {
        code: newSubCode,
        name: newSubName,
        course_id: editingCourse.id,
        credits: newSubCredits,
        semester: newSubSem,
      });
      showToast('Subject added to course', 'success');
      setNewSubCode('');
      setNewSubName('');
      const subs = await api.getCourseSubjects(editingCourse.id);
      setSelectedCourseSubjects(subs);
    } catch (err: any) {
      showToast(err.message || 'Failed to add subject', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Courses & Curriculum Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Degree programs, duration, total semesters, and subject syllabus breakdown
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingCourse({
                code: '',
                name: '',
                department_id: departments[0]?.id || 1,
                duration_years: 4,
                total_semesters: 8,
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(c => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs">
                    {c.code}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCourse(c);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCourse(c);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Department: {c.department_name}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {c.description || 'No description available.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {c.duration_years} Years &bull; {c.total_semesters} Semesters
                </span>

                <button
                  onClick={() => openSubjectsModal(c)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Subjects</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse.id ? 'Edit Course' : 'Create Course'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Course Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. BTECH-CS"
              value={editingCourse.code || ''}
              onChange={e => setEditingCourse({ ...editingCourse, code: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Course Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. B.Tech Computer Science & Engg"
              value={editingCourse.name || ''}
              onChange={e => setEditingCourse({ ...editingCourse, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Department *</label>
            <select
              required
              value={editingCourse.department_id || ''}
              onChange={e => setEditingCourse({ ...editingCourse, department_id: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="6"
                value={editingCourse.duration_years || 4}
                onChange={e => setEditingCourse({ ...editingCourse, duration_years: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Total Semesters</label>
              <input
                type="number"
                min="1"
                max="12"
                value={editingCourse.total_semesters || 8}
                onChange={e => setEditingCourse({ ...editingCourse, total_semesters: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Course</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Course Subjects Modal */}
      <Modal
        isOpen={isSubjectsOpen}
        onClose={() => setIsSubjectsOpen(false)}
        title={`Subjects in ${editingCourse.name}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {isAdmin && (
            <form onSubmit={handleAddSubject} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border space-y-2">
              <span className="font-bold">Add Subject to Course</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Code (CS101)"
                  required
                  value={newSubCode}
                  onChange={e => setNewSubCode(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Name (Data Struct)"
                  required
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border bg-white dark:bg-slate-900"
                />
                <input
                  type="number"
                  placeholder="Credits"
                  value={newSubCredits}
                  onChange={e => setNewSubCredits(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-lg border bg-white dark:bg-slate-900"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Add Subject
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {selectedCourseSubjects.map(s => (
              <div key={s.id} className="p-3 rounded-xl border flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{s.code} &bull; Semester {s.semester}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                  {s.credits} Credits
                </span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteCourse}
        title="Delete Course"
        message={`Are you sure you want to delete course "${editingCourse.name}"?`}
        loading={actionLoading}
      />
    </div>
  );
};
