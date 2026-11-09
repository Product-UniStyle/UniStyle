import { useEffect, useMemo, useState } from 'react';
import { Search, Truck, BadgeCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api, ApiError, type BackendAdminOrder } from '@/lib/api';

type DeliveryStatus = BackendAdminOrder['status'];

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  PAID: 'bg-amber-100 text-amber-700',
  SHIPPED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const filterTabs: { id: 'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled'; label: string; statuses: DeliveryStatus[] }[] = [
  { id: 'all', label: 'All Orders', statuses: [] },
  { id: 'pending', label: 'Pending / Paid', statuses: ['PENDING', 'PAID'] },
  { id: 'shipped', label: 'Shipped / In Transit', statuses: ['SHIPPED'] },
  { id: 'delivered', label: 'Delivered', statuses: ['DELIVERED'] },
  { id: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
];

export function AdminDeliveryTab() {
  const [orders, setOrders] = useState<BackendAdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<typeof filterTabs[number]['id']>('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const [otpOrder, setOtpOrder] = useState<BackendAdminOrder | null>(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { orders } = await api.getAdminOrders();
      setOrders(orders);
    } catch {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const statuses = filterTabs.find(t => t.id === filter)?.statuses ?? [];
    let list = statuses.length ? orders.filter(o => statuses.includes(o.status)) : orders;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(o =>
        o._id.toLowerCase().includes(q) ||
        `${o.userId?.firstName ?? ''} ${o.userId?.lastName ?? ''}`.toLowerCase().includes(q) ||
        (o.shippingAddress.phone ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    filterTabs.forEach(t => { c[t.id] = t.statuses.length ? orders.filter(o => t.statuses.includes(o.status)).length : orders.length; });
    return c;
  }, [orders]);

  const updateStatus = async (order: BackendAdminOrder, status: DeliveryStatus) => {
    setUpdating(order._id);
    try {
      const { order: updated } = await api.updateOrderDeliveryStatus(order._id, status);
      setOrders(prev => prev.map(o => (o._id === updated._id ? updated : o)));
    } finally {
      setUpdating(null);
    }
  };

  const openVerify = async (order: BackendAdminOrder) => {
    setOtpOrder(order);
    setOtpValue('');
    setOtpError('');
    setOtpSent(false);
    setOtpSending(true);
    try {
      await api.sendDeliveryOtp(order._id);
      setOtpSent(true);
    } catch (err) {
      setOtpError(err instanceof ApiError ? err.message : 'Failed to send code');
    } finally {
      setOtpSending(false);
    }
  };

  const resendOtp = async () => {
    if (!otpOrder) return;
    setOtpError('');
    setOtpSending(true);
    try {
      await api.sendDeliveryOtp(otpOrder._id);
      setOtpSent(true);
    } catch (err) {
      setOtpError(err instanceof ApiError ? err.message : 'Failed to send code');
    } finally {
      setOtpSending(false);
    }
  };

  const confirmOtp = async () => {
    if (!otpOrder || otpValue.trim().length !== 6) {
      setOtpError('Enter the 6-digit code');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      const { order: updated } = await api.verifyDeliveryOtp(otpOrder._id, otpValue.trim());
      setOrders(prev => prev.map(o => (o._id === updated._id ? updated : o)));
      setOtpOrder(null);
    } catch (err) {
      setOtpError(err instanceof ApiError ? err.message : 'Verification failed');
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-5 border-b border-[#E5E5E5] sm:border-0 pb-2 sm:pb-0">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`text-sm font-medium pb-2 -mb-[9px] sm:mb-0 border-b-2 transition-colors ${
                filter === tab.id ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#666] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label} ({counts[tab.id] ?? 0})
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
          <Input placeholder="Order ID, name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-center py-10 text-[#999]">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-[#E5E5E5] rounded-lg">
          <Truck size={36} className="mx-auto text-[#CCC] mb-4" />
          <p className="text-[#666]">No orders in this view</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const customerName = order.userId
              ? `${order.userId.firstName ?? ''} ${order.userId.lastName ?? ''}`.trim() || order.userId.email
              : 'Deleted account';
            return (
              <div key={order._id} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Order #{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-[#999]">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {order.deliveryVerifiedAt && (
                      <BadgeCheck size={18} className="text-blue-500" aria-label="Delivery verified via OTP" />
                    )}
                    <Badge className={`${STATUS_STYLES[order.status]} border-transparent`}>{order.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-[#999] mb-1">Customer</p>
                    <p className="font-medium text-[#1A1A1A]">{customerName}</p>
                    <p className="text-[#666]">
                      {order.userId?.email ?? '—'}
                      {order.shippingAddress.phone && (
                        <> · <a href={`tel:${order.shippingAddress.phone}`} className="underline hover:text-[#1A1A1A]">{order.shippingAddress.phone}</a></>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#999] mb-1">Shipping Address</p>
                    <p className="text-[#666]">
                      {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.country}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-[#999] mb-1">Items</p>
                  <p className="text-sm text-[#666]">
                    {order.items.map(it => `${it.productId?.name ?? 'Deleted product'}${it.size ? ` (${it.size})` : ''} x${it.quantity}`).join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0F0F0]">
                  <p className="font-bold">AED {(order.total / 100).toFixed(2)}</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      disabled={order.status === 'DELIVERED' || updating === order._id}
                      onChange={(e) => updateStatus(order, e.target.value as DeliveryStatus)}
                      className="text-sm border border-[#E5E5E5] rounded px-2 py-1.5 bg-white disabled:opacity-50 disabled:bg-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="CANCELLED">Cancelled</option>
                      {order.status === 'DELIVERED' && <option value="DELIVERED">Delivered</option>}
                    </select>
                    {order.status === 'SHIPPED' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => openVerify(order)}>
                        <ShieldCheck className="size-4 mr-1.5" /> Verify
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!otpOrder} onOpenChange={(open) => !open && setOtpOrder(null)}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Verify delivery</DialogTitle>
            <DialogDescription>
              {otpSending && !otpSent
                ? 'Sending a code to the customer...'
                : otpSent
                  ? "Ask the customer for the 6-digit code we just emailed them, then enter it below."
                  : 'Send a code to the customer to confirm delivery.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              inputMode="numeric"
              maxLength={6}
              disabled={!otpSent}
              className="text-center text-lg tracking-[0.3em]"
            />
            {otpError && <p className="text-sm text-red-600">{otpError}</p>}
            <div className="flex items-center justify-between">
              <button type="button" onClick={resendOtp} disabled={otpSending} className="text-xs underline text-[#666] hover:text-[#1A1A1A] disabled:opacity-50">
                {otpSending ? 'Sending...' : 'Resend code'}
              </button>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOtpOrder(null)}>Cancel</Button>
              <Button type="button" disabled={otpVerifying || !otpSent} className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={confirmOtp}>
                {otpVerifying ? 'Verifying...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
