import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Package, PackageSearch, Star } from 'lucide-react';
import type { Order } from '@/context/AuthContext';
import { STATUS_STYLES, statusLabel, statusDetailLine, orderBucket, type OrderBucket } from './accountHelpers';
import { api, ApiError, type BackendReview, type BackendAwaitingReview } from '@/lib/api';
import { showToast } from '@/components/ToastContainer';

const PAGE_SIZE = 5;

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} fill={i < Math.round(rating) ? '#1A1A1A' : 'none'} stroke="#1A1A1A" />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}>
          <Star size={18} fill={i < value ? '#1A1A1A' : 'none'} stroke="#1A1A1A" />
        </button>
      ))}
    </div>
  );
}

function ItemReview({
  orderId, productId, reviews, awaiting, reload,
}: {
  orderId: string;
  productId: string;
  reviews: BackendReview[];
  awaiting: BackendAwaitingReview[];
  reload: () => void;
}) {
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const reviewed = reviews.find(r => r.productId?._id === productId);
  const canReview = awaiting.some(a => a.orderId === orderId && a.product._id === productId);

  const startWrite = () => {
    setWriting(true);
    setRating(reviewed?.rating ?? 5);
    setComment(reviewed?.comment ?? '');
  };

  const submit = async () => {
    setSaving(true);
    try {
      if (reviewed) {
        await api.updateReview(reviewed._id, { rating, comment });
        showToast('Review updated');
      } else {
        await api.createReview({ productId, orderId, rating, comment });
        showToast('Review submitted');
      }
      setWriting(false);
      reload();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to save review', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!reviewed && !canReview) return null;

  if (writing) {
    return (
      <div className="mt-2 pt-2 border-t border-[#E5E5E5] space-y-2">
        <StarPicker value={rating} onChange={setRating} />
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Share your thoughts about this product..." className="w-full border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#1A1A1A]" />
        <div className="flex gap-2">
          <button onClick={() => setWriting(false)} className="text-sm text-[#666] px-3 py-1.5">Cancel</button>
          <button onClick={submit} disabled={saving || !comment.trim()} className="bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-4 py-2 hover:bg-[#333] disabled:opacity-60">
            {saving ? 'Saving...' : reviewed ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </div>
    );
  }

  if (reviewed) {
    return (
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#F0F0F0]">
        <span className="flex items-center gap-2">
          <StarRow rating={reviewed.rating} />
          <span className="text-xs text-[#999]">(Your rating)</span>
        </span>
        <button onClick={startWrite} className="text-xs font-medium text-[#1A1A1A] hover:underline shrink-0">Edit Review</button>
      </div>
    );
  }

  const rateAndOpen = (stars: number) => {
    setRating(stars);
    setWriting(true);
    setComment('');
  };

  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#F0F0F0]">
      <div className="flex gap-1 text-[#CCC]">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => rateAndOpen(i + 1)} className="hover:text-[#1A1A1A]">
            <Star size={16} />
          </button>
        ))}
      </div>
      <span onClick={() => rateAndOpen(5)} className="text-xs font-medium text-[#1A1A1A] hover:underline cursor-pointer">
        Rate & Review Product
      </span>
    </div>
  );
}

const sortOptions = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Total', value: 'total-desc' },
  { label: 'Lowest Total', value: 'total-asc' },
];

const filterTabs: { id: 'all' | OrderBucket; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function OrdersTab({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<'all' | OrderBucket>('all');
  const [sort, setSort] = useState('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<BackendReview[]>([]);
  const [awaiting, setAwaiting] = useState<BackendAwaitingReview[]>([]);

  const loadReviews = () => {
    api.getMyReviews()
      .then(data => { setReviews(data.reviews); setAwaiting(data.awaiting); })
      .catch(() => { setReviews([]); setAwaiting([]); });
  };

  useEffect(() => { loadReviews(); }, []);

  const counts = useMemo(() => {
    const c: Record<'all' | OrderBucket, number> = { all: orders.length, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => { c[orderBucket(o)]++; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const list = filter === 'all' ? [...orders] : orders.filter(o => orderBucket(o) === filter);
    switch (sort) {
      case 'oldest': return list.reverse();
      case 'total-desc': return list.sort((a, b) => b.total - a.total);
      case 'total-asc': return list.sort((a, b) => a.total - b.total);
      default: return list;
    }
  }, [orders, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-[#E5E5E5]">
        <div className="flex flex-wrap gap-5">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); setPage(1); }}
              className={`text-sm font-medium pb-2 -mb-[13px] border-b-2 transition-colors ${
                filter === tab.id ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#666] hover:text-[#1A1A1A]'
              }`}
            >
              {tab.label} ({counts[tab.id]})
            </button>
          ))}
        </div>
        <div className="relative">
          <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 text-sm border border-[#E5E5E5] px-3 py-2 hover:border-[#1A1A1A] transition-colors">
            Sort by: {sortOptions.find(o => o.value === sort)?.label}
            <ChevronDown size={14} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E5E5] py-1 min-w-[180px] z-10">
              {sortOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => { setSort(o.value); setSortOpen(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#F5F5F5] ${sort === o.value ? 'font-medium' : 'text-[#666]'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-[#F5F5F5]">
          <Package size={36} className="mx-auto text-[#CCC] mb-4" />
          <p className="text-[#666]">No orders yet</p>
          <Link to="/shop" className="text-sm underline mt-2 inline-block">Start Shopping</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#F5F5F5]">
          <PackageSearch size={36} className="mx-auto text-[#CCC] mb-4" />
          <p className="text-[#666]">No orders in this category</p>
        </div>
      ) : (
        <div className="border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
          {pageItems.map(order => {
            const isOpen = expanded.has(order.id);
            const extraCount = Math.max(0, order.items.length - 3);
            return (
              <div key={order.id}>
                <button onClick={() => toggleExpanded(order.id)} className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-[#999] mb-3">{order.date} &middot; {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    <div className="flex items-center gap-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img key={i} src={item.image} alt={item.name} className="w-14 h-14 object-cover bg-[#F5F5F5]" />
                      ))}
                      {extraCount > 0 && (
                        <div className="w-14 h-14 bg-[#F5F5F5] flex items-center justify-center text-xs text-[#666] font-medium">+{extraCount}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center px-4 hidden sm:block">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block ${STATUS_STYLES[order.status]}`}>
                      {statusLabel(order.status)}
                    </span>
                    <p className="text-xs text-[#666] mt-2 max-w-[180px]">{statusDetailLine(order)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">AED {order.total.toFixed(2)}</p>
                    <ChevronRight size={16} className={`text-[#999] ml-auto mt-2 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                </button>
                {orderBucket(order) === 'delivered' && (
                  <div className="px-5 pb-4 -mt-1 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i}>
                        {order.items.length > 1 && <p className="text-xs text-[#999] mb-1 truncate">{item.name}</p>}
                        <ItemReview orderId={order.id} productId={item.productId} reviews={reviews} awaiting={awaiting} reload={loadReviews} />
                      </div>
                    ))}
                  </div>
                )}
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="bg-[#FAFAFA] p-4 space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i}>
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover bg-white" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-[#999]">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">AED {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t border-[#E5E5E5]">
                        <span className="text-sm text-[#666]">Shipping to</span>
                        <span className="text-sm font-medium text-right">
                          {order.shippingAddress.address1}, {order.shippingAddress.city}, {order.shippingAddress.country}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center border border-[#E5E5E5] disabled:opacity-40">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center text-sm ${p === page ? 'bg-[#1A1A1A] text-white' : 'border border-[#E5E5E5] hover:border-[#1A1A1A]'}`}
            >
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center border border-[#E5E5E5] disabled:opacity-40">
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 p-5 bg-[#F5F5F5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><Package size={18} /></div>
          <div>
            <p className="text-sm font-semibold">Can't find your order?</p>
            <p className="text-xs text-[#666]">If you have any questions about your order, our support team is here to help.</p>
          </div>
        </div>
        <a href="mailto:support@unistyle.com" className="text-sm font-medium border border-[#E5E5E5] bg-white px-4 py-2.5 shrink-0 hover:border-[#1A1A1A] transition-colors text-center">Contact Support</a>
      </div>
    </div>
  );
}
