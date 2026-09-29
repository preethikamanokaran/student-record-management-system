import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, AcademicRecord, Course, Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Loader2, 
  Award,
  BookOpen
} from 'lucide-react';

interface AcademicRecordsProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AcademicRecords: React.FC<AcademicRecordsProps> = ({ showToast }) => {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<AcademicRecord>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const sRes = await api.getStudents({ limit: 100 });
        setStudents(sRes.items);
        if (sRes.items.length > 0) {
          const firstId = user?.role === 'STUDENT' && user.student_id ? user.student_id : sRes.items[0].id;
          setSelectedStudentId(firstId);
        }
      } catch (err) {}
    };
    initData();
  }, [user]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const loadRecords = async () => {
      try {
        setLoading(true);
        const recs = await api.getStudentAcademicRecords(selectedStudentId);
        setAcademicRecords(recs);

        // Fetch subjects for course
        const st = students.find(s => s.id === selectedStudentId);
        if (st && st.course_id) {
          const subs = await api.getCourseSubjects(st.course_id);
          setSubjects(subs);
        }
      } catch (err: any) {
        showToast(err.message || 'Error loading records', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, [selectedStudentId, students]);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !editingRecord.subject_id) {
      showToast('Please select a subject', 'error');
      return;
    }
    setActionLoading(true);
    try {
      if (editingRecord.id) {
        await api.updateAcademicRecord(editingRecord.id, editingRecord);
        showToast('Academic record updated', 'success');
      } else {
        await api.createAcademicRecord(selectedStudentId, editingRecord);
        showToast('Academic record added successfully', 'success');
      }
      setIsModalOpen(false);
      const recs = await api.getStudentAcademicRecords(selectedStudentId);
      setAcademicRecords(recs);
    } catch (err: any) {
      showToast(err.message || 'Failed to save record', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!selectedStudentId) return;
    try {
      await api.deleteAcademicRecord(id);
      showToast('Academic record deleted', 'success');
      const recs = await api.getStudentAcademicRecords(selectedStudentId);
      setAcademicRecords(recs);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Academic Records & Marks Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Subject-wise internal, external marks, grades, and CGPA calculation engine
          </p>
        </div>

        {isStaffOrAdmin && selectedStudentId && (
          <button
            onClick={() => {
              setEditingRecord({
                internal_marks: 30,
                external_marks: 50,
                semester: selectedStudent?.semester || 1,
                academic_year: '2023-2024',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Marks Record</span>
          </button>
        )}
      </div>

      {/* Student Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Select Student:
          </label>
          <select
            value={selectedStudentId || ''}
            onChange={e => setSelectedStudentId(Number(e.target.value))}
            className="w-full sm:w-80 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.register_number})
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-500">Current CGPA:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/20 text-sm">
              {selectedStudent.cgpa.toFixed(2)} / 10.0
            </span>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Fetching academic marks...</p>
          </div>
        ) : academicRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            No academic marks recorded for this student yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase">
                  <th className="py-3.5 px-4">Subject Code & Name</th>
                  <th className="py-3.5 px-4">Credits</th>
                  <th className="py-3.5 px-4">Internal Marks</th>
                  <th className="py-3.5 px-4">External Marks</th>
                  <th className="py-3.5 px-4">Total Marks</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Grade Point</th>
                  {isStaffOrAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {academicRecords.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{r.subject_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.subject_code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{r.credits || 3}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{r.internal_marks}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{r.external_marks}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{r.total_marks}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold">{r.grade_point}</td>
                    {isStaffOrAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingRecord(r);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Academic Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord.id ? 'Edit Academic Marks' : 'Record Subject Marks'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveRecord} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Subject *</label>
            <select
              required
              disabled={!!editingRecord.id}
              value={editingRecord.subject_id || ''}
              onChange={e => setEditingRecord({ ...editingRecord, subject_id: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code}) - {s.credits} Credits
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Internal Marks (Max 50)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                required
                value={editingRecord.internal_marks ?? 30}
                onChange={e => setEditingRecord({ ...editingRecord, internal_marks: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">External Marks (Max 50)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                required
                value={editingRecord.external_marks ?? 50}
                onChange={e => setEditingRecord({ ...editingRecord, external_marks: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-medium">
            Calculated Total Marks: {(editingRecord.internal_marks || 0) + (editingRecord.external_marks || 0)} / 100
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
              <span>Save Marks</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
