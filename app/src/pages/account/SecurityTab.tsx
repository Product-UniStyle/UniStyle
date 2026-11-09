import { Smartphone, Monitor, ShieldCheck } from 'lucide-react';

export function SecurityTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Security</h2>
      <p className="text-sm text-[#666] mb-6">Manage your account security and keep your information safe.</p>

      <div className="border border-[#E5E5E5] divide-y divide-[#F0F0F0] mb-6">
        <div className="flex items-center justify-between p-5">
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Smartphone size={18} /></div>
            <span>
              <span className="block text-sm font-semibold">Two-Factor Authentication</span>
              <span className="block text-xs text-[#666]">Add an extra layer of security to your account.</span>
            </span>
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Coming soon</span>
        </div>
        <div className="flex items-center justify-between p-5">
          <span className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Monitor size={18} /></div>
            <span>
              <span className="block text-sm font-semibold">Login Sessions</span>
              <span className="block text-xs text-[#666]">Manage your active sessions across devices.</span>
            </span>
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Coming soon</span>
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-[#F5F5F5]">
        <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
        <div>
          <p className="text-sm font-semibold">Your security is our priority</p>
          <p className="text-xs text-[#666]">We use industry-standard encryption to protect your data and keep your account secure.</p>
        </div>
      </div>
    </div>
  );
}
