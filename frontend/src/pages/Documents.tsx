import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, Document as StudentDoc } from '../types';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, Trash2, Loader2, Search } from 'lucide-react';

interface DocumentsProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DocumentsPage: React.FC<DocumentsProps> = ({ showToast }) => {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [documents, setDocuments] = useState<StudentDoc[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudentsList = async () => {
      try {
        const res = await api.getStudents({ limit: 100 });
        setStudents(res.items);
        if (res.items.length > 0) {
          const firstId = user?.role === 'STUDENT' && user.student_id ? user.student_id : res.items[0].id;
          setSelectedStudentId(firstId);
        }
      } catch (err) {}
    };
    fetchStudentsList();
  }, [user]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const docs = await api.getStudentDocuments(selectedStudentId);
        setDocuments(docs);
      } catch (err: any) {
        showToast(err.message || 'Error fetching documents', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [selectedStudentId]);

  const handleDelete = async (docId: number) => {
    if (!selectedStudentId) return;
    try {
      await api.deleteDocument(docId);
      showToast('Document deleted', 'success');
      const docs = await api.getStudentDocuments(selectedStudentId);
      setDocuments(docs);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Student Document Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access ID proofs, academic certificates, mark sheets, bonafide & transfer certificates
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Select Student:
        </label>
        <select
          value={selectedStudentId || ''}
          onChange={e => setSelectedStudentId(Number(e.target.value))}
          className="w-full sm:w-80 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
        >
          {students.map(s => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.register_number})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            No uploaded documents found for this student.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map(d => (
              <div
                key={d.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{d.title}</p>
                    <p className="text-[10px] text-slate-400">{d.doc_type} &bull; {(d.file_size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={api.getDocumentDownloadUrl(d.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {isStaffOrAdmin && (
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
