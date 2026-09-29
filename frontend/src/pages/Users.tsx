import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UserCog, Plus, Edit3, Trash2, Loader2, Shield } from 'lucide-react';

interface UsersProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const UsersPage: React.FC<UsersProps> = ({ showToast }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string }>({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingUser.id) {
        await api.updateUser(editingUser.id, editingUser);
        showToast('User account updated', 'success');
      } else {
        await api.createUser(editingUser);
        showToast('New user created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to save user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingUser.id) return;
    setActionLoading(true);
    try {
      await api.deleteUser(editingUser.id);
      showToast('User account deleted', 'success');
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            System User & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, assign roles (ADMIN, FACULTY, STUDENT), and access credentials
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser({ email: '', full_name: '', role: 'FACULTY', is_active: true, password: 'password123' });
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Loading user accounts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold flex items-center justify-center">
                        {u.full_name.charAt(0)}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' :
                        u.role === 'FACULTY' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.is_active ? (
                        <span className="text-emerald-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-slate-400 font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser.id ? 'Edit User Account' : 'Create User Account'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={editingUser.full_name || ''}
              onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={editingUser.email || ''}
              onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Password {editingUser.id ? '(Leave blank to keep unchanged)' : '*'}
            </label>
            <input
              type="password"
              required={!editingUser.id}
              value={editingUser.password || ''}
              onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Role *</label>
            <select
              value={editingUser.role || 'FACULTY'}
              onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            >
              <option value="ADMIN">ADMIN (Full Control)</option>
              <option value="FACULTY">FACULTY (Staff Access)</option>
              <option value="STUDENT">STUDENT (Student Access)</option>
            </select>
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
              <span>Save User</span>
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${editingUser.full_name}"?`}
        loading={actionLoading}
      />
    </div>
  );
};
