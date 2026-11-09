import { useEffect, useState } from 'react';
import { PackageSearch, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { api, type BackendProduct, type BackendStockLog } from '@/lib/api';

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (stock <= 10) return <Badge className="bg-amber-100 text-amber-700 border-transparent">Low Stock</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-transparent">In Stock</Badge>;
}

export function AdminInventoryTab() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [restocking, setRestocking] = useState<BackendProduct | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [logsOpen, setLogsOpen] = useState(false);
  const [logsProduct, setLogsProduct] = useState<BackendProduct | null>(null);
  const [logs, setLogs] = useState<BackendStockLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { products } = await api.getProducts({ search: search || undefined, limit: 100 });
      setProducts(products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openRestock = (p: BackendProduct) => {
    setRestocking(p);
    setQuantity('');
    setReason('');
    setFormError('');
  };

  const openLogs = async (product?: BackendProduct) => {
    setLogsProduct(product ?? null);
    setLogsOpen(true);
    setLogsLoading(true);
    try {
      const { logs } = await api.getStockLogs({ limit: 50, productId: product?._id });
      setLogs(logs);
    } finally {
      setLogsLoading(false);
    }
  };

  const parsedQty = Number(quantity);
  const previewNewStock = restocking && Number.isFinite(parsedQty) ? restocking.stock + parsedQty : null;

  const handleRestock = async () => {
    if (!restocking || !Number.isFinite(parsedQty) || parsedQty === 0) {
      setFormError('Enter a non-zero quantity');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await api.adjustStock({ productId: restocking._id, change: parsedQty, reason: reason || undefined });
      setRestocking(null);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-[320px]">
          <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => openLogs()}>
          <History className="size-4 mr-1.5" /> Stock Movement Logs
        </Button>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden">
        {loading ? (
          <p className="text-center py-10 text-[#999]">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-center py-10 text-[#999]">No products found</p>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p._id} className="bg-white border border-[#E5E5E5] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={p.images[0] ?? p.colors?.find(c => c.images?.length)?.images?.[0]} alt="" className="w-12 h-12 object-cover rounded bg-[#F5F5F5] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-[#1A1A1A] truncate">{p.name}</p>
                    <p className="text-xs text-[#666]">{p.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-[#1A1A1A]">Stock: {p.stock}</p>
                  <StockBadge stock={p.stock} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => openLogs(p)}>
                    <History className="size-4 mr-1.5" /> History
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => openRestock(p)}>+ Adjust Stock</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-[#999]">Loading...</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-[#999]">No products found</TableCell></TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={p.images[0] ?? p.colors?.find(c => c.images?.length)?.images?.[0]} alt="" className="w-10 h-10 object-cover rounded bg-[#F5F5F5]" />
                        <span className="font-medium text-[#1A1A1A]">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell><StockBadge stock={p.stock} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openLogs(p)} title="Stock history for this product">
                        <History className="size-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openRestock(p)}>Restock</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!restocking} onOpenChange={(open) => !open && setRestocking(null)}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Restock "{restocking?.name}"</DialogTitle>
            <DialogDescription>Adjust stock up or down and leave a note for the log.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity to add (use a minus sign to reduce)</Label>
              <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 15 or -5" />
            </div>
            {restocking && (
              <p className="text-sm text-[#666] bg-[#F5F5F5] rounded px-3 py-2">
                Current: <span className="font-medium text-[#1A1A1A]">{restocking.stock}</span>
                {' '}&rarr;{' '}Added: <span className="font-medium text-[#1A1A1A]">{Number.isFinite(parsedQty) ? (parsedQty >= 0 ? `+${parsedQty}` : parsedQty) : '—'}</span>
                {' '}&rarr;{' '}New Stock: <span className="font-medium text-[#1A1A1A]">{previewNewStock ?? '—'}</span>
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason / note (optional)</Label>
              <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Supplier Restock" />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setRestocking(null)}>Cancel</Button>
              <Button type="button" disabled={saving} className="flex-1 bg-[#1A1A1A] hover:bg-[#333]" onClick={handleRestock}>
                {saving ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{logsProduct ? `Stock History — "${logsProduct.name}"` : 'Stock Movement Logs'}</DialogTitle>
            <DialogDescription>
              {logsProduct ? 'All stock adjustments for this product, newest first.' : 'Recent stock adjustments across all products, newest first.'}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {!logsProduct && <TableHead>Product</TableHead>}
                  <TableHead>Change</TableHead>
                  <TableHead>Prev &rarr; New</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Staff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsLoading ? (
                  <TableRow><TableCell colSpan={logsProduct ? 5 : 6} className="text-center py-10 text-[#999]">Loading...</TableCell></TableRow>
                ) : logs.length === 0 ? (
                  <TableRow><TableCell colSpan={logsProduct ? 5 : 6} className="text-center py-10 text-[#999]">No stock adjustments yet</TableCell></TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="text-sm text-[#666] whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</TableCell>
                      {!logsProduct && <TableCell className="font-medium text-[#1A1A1A]">{log.productName}</TableCell>}
                      <TableCell className={log.change >= 0 ? 'text-green-700' : 'text-red-600'}>
                        {log.change >= 0 ? `+${log.change}` : log.change}
                      </TableCell>
                      <TableCell>{log.previousStock} &rarr; {log.newStock}</TableCell>
                      <TableCell className="text-[#666]">{log.reason || '—'}</TableCell>
                      <TableCell className="text-[#666]">{log.updatedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
