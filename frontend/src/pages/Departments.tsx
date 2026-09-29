import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Department } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Building2, Plus, Edit3, Trash2, Loader2, BookOpen } from 'lucide-react';

interface DepartmentsProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Departments: React.FC<DepartmentsProps> = ({ showToast }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Partial<Department>>({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      showToast(err.message || 'Error loading departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingDept.id) {
        await api.updateDepartment(editingDept.id, editingDept);
        showToast('Department updated successfully', 'success');
      } else {
        await api.createDepartment(editingDept);
        showToast('Department created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      showToast(err.message || 'Failed to save department', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingDept.id) return;
    setActionLoading(true);
    try {
      await api.deleteDepartment(editingDept.id);
      showToast('Department deleted successfully', 'success');
      setIsDeleteOpen(false);
      fetchDepartments();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete department', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Academic Departments Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage college departments, Heads of Department (HODs), and academic structures
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingDept({ code: '', name: '', hod_name: '', description: '' });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Grid of Departments */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500">Loading departments...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(d => (
            <div
              key={d.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs">
                    {d.code}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingDept(d);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingDept(d);
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
                  {d.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {d.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>HOD: <strong className="text-slate-800 dark:text-slate-200">{d.hod_name || 'N/A'}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept.id ? 'Edit Department' : 'Add Department'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Department Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. CSE"
              value={editingDept.code || ''}
              onChange={e => setEditingDept({ ...editingDept, code: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science & Engineering"
              value={editingDept.name || ''}
              onChange={e => setEditingDept({ ...editingDept, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Head of Department (HOD)</label>
            <input
              type="text"
              placeholder="e.g. Dr. Alan Turing"
              value={editingDept.hod_name || ''}
              onChange={e => setEditingDept({ ...editingDept, hod_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              value={editingDept.description || ''}
              onChange={e => setEditingDept({ ...editingDept, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
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
              <span>Save Department</span>
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete department "${editingDept.name}"?`}
        loading={actionLoading}
      />
    </div>
  );
};
