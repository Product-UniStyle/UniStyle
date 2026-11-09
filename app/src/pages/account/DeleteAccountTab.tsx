import { useState } from 'react';
import { showToast } from '@/components/ToastContainer';

interface Props {
  firstName?: string;
  deleteAccount: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteAccountTab({ firstName, deleteAccount, onCancel }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      showToast('Account deleted');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-[480px]">
      <h2 className="text-2xl font-bold mb-1">Delete Account</h2>
      <p className="text-sm text-[#666] mb-8">{firstName ? `${firstName}, is` : 'Is'} this goodbye?</p>

      <p className="text-sm font-medium mb-6">Are you sure you don't want to reconsider?</p>

      <label className="flex items-start gap-2 text-sm text-[#666] mb-8">
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
        I agree to all the terms and conditions*
      </label>

      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={!agreed || deleting}
          className="flex-1 border border-[#DC2626] text-[#DC2626] text-sm font-semibold uppercase tracking-[0.08em] py-3 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {deleting ? 'Deleting...' : 'Delete Anyway'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-[#1A1A1A] text-white text-sm font-semibold uppercase tracking-[0.08em] py-3 hover:bg-[#333] transition-colors"
        >
          Keep Account
        </button>
      </div>
    </div>
  );
}
