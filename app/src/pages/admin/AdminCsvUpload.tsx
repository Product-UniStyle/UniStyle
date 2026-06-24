import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, ApiError, type ImportSheetResult } from '@/lib/api';

interface Props {
  onImported: () => void;
}

export function AdminCsvUpload({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportSheetResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const result = await api.importProductsCsv(file, false);
      setPreview(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to read CSV');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      await api.importProductsCsv(file, true);
      onImported();
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to import CSV');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#666]">
        Upload the product database CSV. New slugs are created, existing matching slugs are updated.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setPreview(null);
        }}
        className="block w-full text-sm border border-[#E5E5E5] rounded-md p-2"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {preview && (
        <div className="border border-[#E5E5E5] rounded-md p-4 text-sm space-y-2 max-h-[240px] overflow-y-auto">
          <p><span className="font-semibold">{preview.validProducts}</span> of {preview.totalRows} rows are valid and ready to import ({preview.skipped} skipped).</p>
          {preview.warnings.length > 0 && (
            <div>
              <p className="font-medium text-amber-700">Warnings:</p>
              <ul className="list-disc pl-5 text-amber-700">
                {preview.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {!preview ? (
          <Button onClick={handlePreview} disabled={!file || busy} className="bg-[#1A1A1A] hover:bg-[#333]">
            {busy ? 'Reading...' : 'Preview'}
          </Button>
        ) : (
          <Button onClick={handleConfirm} disabled={busy || preview.validProducts === 0} className="bg-[#1A1A1A] hover:bg-[#333]">
            {busy ? 'Importing...' : `Import ${preview.validProducts} product(s)`}
          </Button>
        )}
      </div>
    </div>
  );
}
