import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import { KeyRound, CheckCircle, AlertCircle, Shield } from 'lucide-react';

export default function Header({ title, subtitle }) {
  const { user, role, changePassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ error: '', success: '', loading: false });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '', loading: true });

    if (newPassword.length < 6) {
      setStatus({ error: 'New password must be at least 6 characters.', success: '', loading: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ error: 'New passwords do not match.', success: '', loading: false });
      return;
    }

    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setStatus({ error: '', success: 'Password changed successfully.', loading: false });
        setTimeout(() => {
          setShowPasswordModal(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setStatus({ error: '', success: '', loading: false });
        }, 1500);
      } else {
        setStatus({ error: res.message || 'Failed to update password.', success: '', loading: false });
      }
    } catch (err) {
      setStatus({ error: 'An unexpected error occurred.', success: '', loading: false });
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-100 shadow-sm px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setShowPasswordModal(true);
              setStatus({ error: '', success: '', loading: false });
            }}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
            title="Change Account Password"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-400">
                {role === 'teacher'
                  ? user?.designation || 'Faculty'
                  : `URN: ${user?.urn} · ${user?.course}`}
              </p>
            </div>
            <div
              onClick={() => setShowPasswordModal(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-md cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
              title="Click to manage account security"
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Security Settings · Change Password"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">
                {user?.name} ({role === 'teacher' ? user?.email : `URN: ${user?.urn}`})
              </p>
              <p className="text-slate-400">Update your confidential password for Room B2-105 system</p>
            </div>
          </div>

          {status.error && (
            <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          {status.success && (
            <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{status.success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status.loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {status.loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
