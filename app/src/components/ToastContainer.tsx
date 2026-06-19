import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ message: string; type?: 'success' | 'error' | 'info' }>;
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, message: custom.detail.message, type: custom.detail.type || 'success' }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    window.addEventListener('show-toast' as any, handler);
    return () => window.removeEventListener('show-toast' as any, handler);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 text-white text-sm font-medium shadow-lg transform transition-all duration-300 translate-x-0 ${
            toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-blue-600' : 'bg-[#1A1A1A]'
          }`}
        >
          {toast.message}
          <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
}
