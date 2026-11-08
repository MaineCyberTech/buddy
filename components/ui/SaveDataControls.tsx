'use client';

import { useCallback, useEffect, useState } from 'react';
import { exportSave, getSaveMetadata, importSave } from '@/lib/storage/indexeddb';

interface SaveDataControlsProps {
  /** Called after a successful import; defaults to a full reload. */
  onImported?: () => void;
}

type SaveMetadata = Awaited<ReturnType<typeof getSaveMetadata>>;

function downloadName(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `buddy-save-${date}.txt`;
}

export function SaveDataControls({ onImported }: SaveDataControlsProps) {
  const [metadata, setMetadata] = useState<SaveMetadata>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshMetadata = useCallback(async () => {
    setMetadata(await getSaveMetadata());
  }, []);

  useEffect(() => {
    void refreshMetadata();
  }, [refreshMetadata]);

  const handleExport = async () => {
    setError('');
    setStatus('');
    setBusy(true);
    try {
      const payload = await exportSave();
      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName();
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus('Save exported.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    setStatus('');
    setError('');
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const payload = await selectedFile.text();
      const imported = await importSave(payload);
      if (!imported) {
        setError('Import failed — that file is not a valid Buddy save.');
        return;
      }
      setStatus('Save imported. Reloading…');
      setSelectedFile(null);
      await refreshMetadata();
      if (onImported) {
        onImported();
      } else {
        window.location.reload();
      }
    } catch {
      setError('Could not read that file. Choose a Buddy save export.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-3 text-xs">
      <p className="lcd-text-accent uppercase tracking-wider">Save data</p>

      <p className="lcd-text opacity-70" role="status" aria-live="polite">
        {metadata?.exists
          ? `Saved buddy: ${metadata.nickname ?? 'unknown'} the ${metadata.speciesName ?? 'unknown'}`
          : 'No saved game on this device yet.'}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={busy || !metadata?.exists}
          className="btn-device px-4 py-2 min-h-11 rounded-md focus-ring disabled:opacity-40"
        >
          EXPORT SAVE
        </button>
        <label
          className={`btn-device px-4 py-2 min-h-11 rounded-md focus-ring inline-flex items-center justify-center cursor-pointer ${busy ? 'opacity-40' : ''}`}
        >
          IMPORT SAVE
          <input
            type="file"
            accept=".txt,.json,text/plain,application/json"
            onChange={handleFileSelected}
            disabled={busy}
            className="sr-only"
            aria-label="Choose save file to import"
          />
        </label>
      </div>

      {status && (
        <p className="lcd-text-accent" role="status" aria-live="polite">
          {status}
        </p>
      )}
      {error && (
        <p className="lcd-text-danger" role="alert">
          {error}
        </p>
      )}

      {selectedFile && (
        <div
          className="space-y-2 rounded-md border border-[#2a2a4a] p-3"
          role="alertdialog"
          aria-label="Confirm save import"
        >
          <p className="lcd-text">
            Import <span className="lcd-text-accent">{selectedFile.name}</span> and replace
            the save on this device?
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleImport}
              disabled={busy}
              className="btn-device btn-primary px-3 py-2 min-h-11 rounded-md focus-ring disabled:opacity-40"
            >
              IMPORT &amp; RELOAD
            </button>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              disabled={busy}
              className="btn-device px-3 py-2 min-h-11 rounded-md focus-ring disabled:opacity-40"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <p className="lcd-text opacity-50">
        Exports contain your buddy and inventory. Keep the file private.
      </p>
    </div>
  );
}
