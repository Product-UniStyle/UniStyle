import { useMemo, useState, type FormEvent } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminProductInput, BackendProduct } from '@/lib/api';
import { ImageUploader } from './ImageUploader';

const NEW_CATEGORY = '__new__';

function toCommaList(values: string[]) {
  return values.join(', ');
}

function fromCommaList(text: string) {
  return text.split(',').map((v) => v.trim()).filter(Boolean);
}

interface ColorEntry {
  name: string;
  hex: string;
  images: string[];
}

interface Props {
  initial?: BackendProduct;
  categories: string[];
  onSubmit: (data: AdminProductInput) => Promise<void>;
  onCancel: () => void;
}

export function AdminProductForm({ initial, categories, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? (initial.price / 100).toString() : '');
  const [compareAt, setCompareAt] = useState(initial?.compareAt ? (initial.compareAt / 100).toString() : '');
  const categoryOptions = useMemo(() => {
    const set = new Set(categories);
    if (initial?.category) set.add(initial.category);
    return Array.from(set).sort();
  }, [categories, initial?.category]);
  const [category, setCategory] = useState(initial?.category ?? categoryOptions[0] ?? '');
  const [addingCategory, setAddingCategory] = useState(!initial && categoryOptions.length === 0);
  const [gender, setGender] = useState<('men' | 'women')[]>(initial?.gender ?? []);
  const toggleGender = (g: 'men' | 'women') =>
    setGender(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const [university, setUniversity] = useState(initial?.university ?? '');
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [sizes, setSizes] = useState(toCommaList(initial?.sizes ?? []));
  const [colorList, setColorList] = useState<ColorEntry[]>(
    initial?.colors?.map(c => ({ name: c.name, hex: c.hex, images: c.images ?? [] })) ?? []
  );
  const [stock, setStock] = useState(initial?.stock?.toString() ?? '0');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [badge, setBadge] = useState(initial?.badge ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [busyUploaders, setBusyUploaders] = useState<Set<string>>(new Set());
  const imagesUploading = busyUploaders.size > 0;

  const setUploaderBusy = (id: string, busy: boolean) =>
    setBusyUploaders((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id); else next.delete(id);
      return next;
    });

  const addColor = () =>
    setColorList(prev => [...prev, { name: '', hex: '#000000', images: [] }]);

  const removeColor = (i: number) =>
    setColorList(prev => prev.filter((_, idx) => idx !== i));

  const updateColorField = (i: number, field: 'name' | 'hex', value: string) =>
    setColorList(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const updateColorImages = (i: number, imgs: string[]) =>
    setColorList(prev => prev.map((c, idx) => idx === i ? { ...c, images: imgs } : c));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (imagesUploading) return;
    setError('');

    const unnamedWithImages = colorList.some(c => !c.name.trim() && c.images.length > 0);
    if (unnamedWithImages) {
      setError('One of your colors has uploaded images but no name — name it before saving, or its images will be lost.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name,
        description,
        price: Math.round(Number(price) * 100),
        compareAt: compareAt ? Math.round(Number(compareAt) * 100) : undefined,
        category,
        gender,
        university: university || undefined,
        images,
        sizes: fromCommaList(sizes),
        colors: colorList.filter(c => c.name.trim() && c.hex.trim()),
        stock: Number(stock) || 0,
        featured,
        badge: badge || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (AED)</Label>
          <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compareAt">Compare-at price (AED)</Label>
          <Input id="compareAt" type="number" step="0.01" min="0" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          {addingCategory ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Hoodies"
                required
              />
              {categoryOptions.length > 0 && (
                <Button type="button" variant="outline" onClick={() => { setAddingCategory(false); setCategory(categoryOptions[0]); }}>
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <Select
              value={category}
              onValueChange={(v) => {
                if (v === NEW_CATEGORY) {
                  setAddingCategory(true);
                  setCategory('');
                } else {
                  setCategory(v);
                }
              }}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                <SelectItem value={NEW_CATEGORY}>+ Add new category…</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <div className="flex gap-6 pt-1">
          {(['men', 'women'] as const).map(g => (
            <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={gender.includes(g)} onCheckedChange={() => toggleGender(g)} />
              {g === 'men' ? 'Men' : 'Women'}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">University</Label>
        <Input id="university" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g. University of Birmingham" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sizes">Sizes (comma separated)</Label>
          <Input id="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="badge">Badge</Label>
          <Input id="badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. New, Sale" />
        </div>
      </div>

      {/* Default Images — shown when no color is selected */}
      <div className="space-y-2">
        <Label>Default Images</Label>
        <p className="text-xs text-[#999]">Shown on product pages when no specific color is selected, or for products without color variants.</p>
        <ImageUploader images={images} onChange={setImages} onBusyChange={(busy) => setUploaderBusy('default', busy)} />
      </div>

      {/* Colors with per-color image uploaders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Colors & Images</Label>
            <p className="text-xs text-[#999] mt-0.5">Each color shows its own images when selected by the customer.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addColor} className="flex items-center gap-1.5 shrink-0">
            <Plus size={14} /> Add Color
          </Button>
        </div>

        {colorList.length === 0 && (
          <div className="border border-dashed border-[#E5E5E5] rounded-lg py-6 text-center text-sm text-[#999]">
            No colors added yet. Click "Add Color" to get started.
          </div>
        )}

        {colorList.map((color, i) => (
          <div key={i} className="border border-[#E5E5E5] rounded-lg overflow-hidden">
            {/* Color header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
              {/* Color swatch preview */}
              <div
                className="w-7 h-7 rounded-full border border-[#E5E5E5] shrink-0 shadow-sm"
                style={{ backgroundColor: color.hex }}
              />
              <Input
                placeholder="Color name (e.g. Black, White, Navy)"
                value={color.name}
                onChange={e => updateColorField(i, 'name', e.target.value)}
                className="flex-1 h-8 text-sm"
              />
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs text-[#666]">Hex</label>
                <input
                  type="color"
                  value={color.hex}
                  onChange={e => updateColorField(i, 'hex', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-[#E5E5E5] p-0.5 bg-white"
                  title="Pick color"
                />
                <Input
                  value={color.hex}
                  onChange={e => updateColorField(i, 'hex', e.target.value)}
                  className="w-24 h-8 text-xs font-mono"
                  placeholder="#000000"
                />
              </div>
              <button
                type="button"
                onClick={() => removeColor(i)}
                className="text-[#999] hover:text-red-500 transition-colors shrink-0"
                title="Remove color"
              >
                <X size={16} />
              </button>
            </div>

            {/* Per-color image uploader */}
            <div className="p-4 space-y-2">
              <p className="text-xs font-medium text-[#555]">
                Images for{' '}
                <span
                  className="inline-flex items-center gap-1.5 font-semibold"
                  style={{ color: color.hex === '#ffffff' || color.hex === '#FFFFFF' ? '#1A1A1A' : color.hex }}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full border border-[#E5E5E5]"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name || 'this color'}
                </span>
                {color.images.length > 0 && (
                  <span className="text-[#999] font-normal ml-1">({color.images.length} uploaded)</span>
                )}
              </p>
              <ImageUploader
                images={color.images}
                onChange={imgs => updateColorImages(i, imgs)}
                onBusyChange={(busy) => setUploaderBusy(`color-${i}`, busy)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="featured" checked={featured} onCheckedChange={(v) => setFeatured(v === true)} />
        <Label htmlFor="featured">Featured</Label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving || imagesUploading} className="bg-[#1A1A1A] hover:bg-[#333] flex items-center gap-2">
          {(saving || imagesUploading) && <Loader2 className="size-4 animate-spin" />}
          {imagesUploading ? 'Uploading images...' : saving ? 'Saving...' : initial ? 'Save changes' : 'Add product'}
        </Button>
      </div>
    </form>
  );
}
