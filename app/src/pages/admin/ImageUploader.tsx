import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: 'uploading' | 'done' | 'error';
  error?: string;
}

export function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);

  const uploadFile = async (file: File) => {
    const id = `${Date.now()}-${file.name}`;
    setUploading((prev) => [...prev, { id, name: file.name, progress: 'uploading' }]);

    try {
      const { uploadUrl, publicUrl } = await api.getUploadUrl(file.type, file.size);

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      onChange([...images, publicUrl]);
      setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: 'done' } : u));
      setTimeout(() => setUploading((prev) => prev.filter((u) => u.id !== id)), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: 'error', error: msg } : u));
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
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

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover rounded border border-[#E5E5E5] bg-[#F5F5F5]"
              />
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
