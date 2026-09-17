import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { showToast } from '@/components/ToastContainer';

interface Props {
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

function PasswordField({ label, value, onChange, minLength }: { label: string; value: string; onChange: (v: string) => void; minLength?: number }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-[#666] mb-1 block">{label}</label>
      <div className="relative">
        <input
          required
          type={show ? 'text' : 'password'}
          minLength={minLength}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-[#E5E5E5] px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#1A1A1A]"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          tabIndex={-1}
          className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-[#999] hover:text-[#1A1A1A]"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function ChangePasswordTab({ changePassword }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('Password updated');
      setShowForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Change Password</h2>
      <p className="text-sm text-[#666] mb-6">Update your password to keep your account secure.</p>

      <div className="border border-[#E5E5E5]">
        <div className="flex items-center justify-between p-5">
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Lock size={18} /></div>
            <span>
              <span className="block text-sm font-semibold">Password</span>
              <span className="block text-xs text-[#666]">Keep your account secure with a strong password</span>
            </span>
          </span>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="text-sm font-medium border border-[#E5E5E5] px-4 py-2 hover:border-[#1A1A1A] transition-colors">
              Change Password
            </button>
          )}
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4 max-w-[420px]">
            <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} minLength={8} />
            <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} minLength={8} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="text-sm text-[#666] px-4 py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-6 py-2.5 hover:bg-[#333] transition-colors disabled:opacity-60">
                {saving ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
