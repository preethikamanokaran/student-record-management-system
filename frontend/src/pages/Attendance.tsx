import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, Attendance as AttendanceType, Subject } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { 
  ClipboardCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface AttendanceProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AttendancePage: React.FC<AttendanceProps> = ({ showToast }) => {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtt, setEditingAtt] = useState<Partial<AttendanceType>>({});
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
    const loadAtt = async () => {
      try {
        setLoading(true);
        const records = await api.getStudentAttendance(selectedStudentId);
        setAttendanceRecords(records);

        const st = students.find(s => s.id === selectedStudentId);
        if (st && st.course_id) {
          const subs = await api.getCourseSubjects(st.course_id);
          setSubjects(subs);
        }
      } catch (err: any) {
        showToast(err.message || 'Error loading attendance', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadAtt();
  }, [selectedStudentId, students]);

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !editingAtt.subject_id) {
      showToast('Please select a subject', 'error');
      return;
    }
    setActionLoading(true);
    try {
      if (editingAtt.id) {
        await api.updateAttendance(editingAtt.id, editingAtt);
        showToast('Attendance record updated', 'success');
      } else {
        await api.createAttendance({
          ...editingAtt,
          student_id: selectedStudentId,
        });
        showToast('Attendance record logged successfully', 'success');
      }
      setIsModalOpen(false);
      const records = await api.getStudentAttendance(selectedStudentId);
      setAttendanceRecords(records);
    } catch (err: any) {
      showToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAtt = async (id: number) => {
    if (!selectedStudentId) return;
    try {
      await api.deleteAttendance(id);
      showToast('Attendance record deleted', 'success');
      const records = await api.getStudentAttendance(selectedStudentId);
      setAttendanceRecords(records);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Overall attendance calculation
  const totalClassesSum = attendanceRecords.reduce((acc, r) => acc + r.total_classes, 0);
  const attendedClassesSum = attendanceRecords.reduce((acc, r) => acc + r.classes_attended, 0);
  const overallPct = totalClassesSum > 0 ? (attendedClassesSum / totalClassesSum) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Attendance Management System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Subject-wise attendance tracking, threshold warnings (&lt;75%), and monthly compliance logs
          </p>
        </div>

        {isStaffOrAdmin && selectedStudentId && (
          <button
            onClick={() => {
              setEditingAtt({
                total_classes: 50,
                classes_attended: 45,
                month: 'Overall',
                academic_year: '2023-2024',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log Attendance</span>
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
            <span className="font-semibold text-slate-500">Overall Attendance:</span>
            <span
              className={`px-3 py-1 rounded-xl font-extrabold border text-sm ${
                overallPct >= 75
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}
            >
              {overallPct.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Warning banner if overall < 75% */}
      {overallPct > 0 && overallPct < 75 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
          <span>
            ATTENDANCE WARNING: Overall attendance for this student is below the mandatory 75.0% threshold. Immediate faculty counseling required.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Loading attendance data...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            No attendance records found for this student.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase">
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Total Classes</th>
                  <th className="py-3.5 px-4">Attended</th>
                  <th className="py-3.5 px-4">Absent</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4">Status Warning</th>
                  {isStaffOrAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceRecords.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{r.subject_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.subject_code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{r.total_classes}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {r.classes_attended}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-600 dark:text-rose-400">
                      {r.classes_absent}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-sm">{r.attendance_percentage.toFixed(1)}%</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.attendance_percentage >= 75 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Satisfactory
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low Attendance
                        </span>
                      )}
                    </td>
                    {isStaffOrAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingAtt(r);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAtt(r.id)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAtt.id ? 'Update Attendance Log' : 'Log Attendance'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Subject *</label>
            <select
              required
              disabled={!!editingAtt.id}
              value={editingAtt.subject_id || ''}
              onChange={e => setEditingAtt({ ...editingAtt, subject_id: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Total Classes Conducted</label>
              <input
                type="number"
                min="1"
                required
                value={editingAtt.total_classes ?? 50}
                onChange={e => setEditingAtt({ ...editingAtt, total_classes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Classes Attended</label>
              <input
                type="number"
                min="0"
                required
                value={editingAtt.classes_attended ?? 45}
                onChange={e => setEditingAtt({ ...editingAtt, classes_attended: Number(e.target.value) })}
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
              <span>Save Log</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
