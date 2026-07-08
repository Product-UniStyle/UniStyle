import { useEffect, useRef, useState } from 'react';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: 'uploading' | 'done' | 'error';
  error?: string;
}

interface PendingSlot {
  id: string;
  url: string | null;
}

export function ImageUploader({ images, onChange, onBusyChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Slots reserve each new file's final position (by selection order) up front,
  // so parallel uploads that finish out of order still land in the right spot —
  // and commits always merge from `baseImages`, never a stale `images` closure,
  // so two uploads finishing close together can't silently drop one another.
  const baseImagesRef = useRef<string[]>(images);
  const pendingSlotsRef = useRef<PendingSlot[]>([]);

  useEffect(() => {
    onBusyChange?.(uploading.some((u) => u.progress === 'uploading'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploading]);

  const commitSlots = () => {
    const resolved = pendingSlotsRef.current
      .map((s) => s.url)
      .filter((u): u is string => u !== null);
    onChange([...baseImagesRef.current, ...resolved]);

    if (pendingSlotsRef.current.every((s) => s.url !== null)) {
      baseImagesRef.current = [...baseImagesRef.current, ...resolved];
      pendingSlotsRef.current = [];
    }
  };

  const uploadFile = async (file: File, slotId: string) => {
    setUploading((prev) => [...prev, { id: slotId, name: file.name, progress: 'uploading' }]);

    try {
      const { uploadUrl, publicUrl } = await api.getUploadUrl(file.type, file.size);

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Upload to S3 failed (${putRes.status})`);
      }

      const slot = pendingSlotsRef.current.find((s) => s.id === slotId);
      if (slot) slot.url = publicUrl;
      commitSlots();

      setUploading((prev) => prev.map((u) => u.id === slotId ? { ...u, progress: 'done' } : u));
      setTimeout(() => setUploading((prev) => prev.filter((u) => u.id !== slotId)), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      pendingSlotsRef.current = pendingSlotsRef.current.filter((s) => s.id !== slotId);
      setUploading((prev) => prev.map((u) => u.id === slotId ? { ...u, progress: 'error', error: msg } : u));
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Only re-snapshot the base when nothing is currently in flight — otherwise
    // keep appending to the same batch so an earlier upload's result isn't lost.
    if (pendingSlotsRef.current.length === 0) {
      baseImagesRef.current = images;
    }

    Array.from(files).forEach((file) => {
      const slotId = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
      pendingSlotsRef.current = [...pendingSlotsRef.current, { id: slotId, url: null }];
      uploadFile(file, slotId);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (url: string) => {
    baseImagesRef.current = baseImagesRef.current.filter((img) => img !== url);
    onChange(images.filter((img) => img !== url));
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    baseImagesRef.current = next;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#E5E5E5] rounded-lg p-6 text-center cursor-pointer hover:border-[#999] transition-colors"
      >
        <Upload className="size-5 text-[#999] mx-auto mb-2" />
        <p className="text-sm text-[#666]">Click or drag images here</p>
        <p className="text-xs text-[#999] mt-1">JPEG, PNG, WebP, GIF — max 5 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-1.5">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-2 text-sm px-1">
              {u.progress === 'uploading' && <Loader2 className="size-4 animate-spin text-[#666]" />}
              {u.progress === 'done' && <span className="size-4 text-green-600">✓</span>}
              {u.progress === 'error' && <span className="size-4 text-red-500">✗</span>}
              <span className="truncate text-[#666] flex-1">{u.name}</span>
              {u.error && <span className="text-red-500 text-xs">{u.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Image previews — drag to reorder */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIndex !== null) reorder(dragIndex, i);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`relative group aspect-square cursor-grab active:cursor-grabbing ${dragIndex === i ? 'opacity-40' : ''}`}
              title="Drag to reorder"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover rounded border border-[#E5E5E5] bg-[#F5F5F5]"
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 bg-[#1A1A1A]/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
              <div className="absolute top-1 left-1 bg-white/90 border border-[#E5E5E5] rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="size-3 text-[#999]" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-white border border-[#E5E5E5] rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="size-3 text-[#666]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
