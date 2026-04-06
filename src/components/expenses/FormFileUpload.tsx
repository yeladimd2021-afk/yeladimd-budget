'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { supabase } from '@/lib/supabase/client';
import { AttachmentFile } from '@/types';
import { formatFileSize, generateId } from '@/lib/utils';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/constants';
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Paperclip,
} from 'lucide-react';

const BUCKET = 'receipts';

interface FormFileUploadProps {
  /** Current list of attachments (controlled) */
  value: AttachmentFile[];
  /** Called whenever the list changes (upload, remove) */
  onChange: (files: AttachmentFile[]) => void;
  /** UID of the currently logged-in user */
  uploadedBy: string;
  /** Display name of the currently logged-in user */
  uploadedByName: string;
  /** Folder inside the bucket, e.g. "expenses/abc123" */
  folder?: string;
}

interface UploadingFile {
  name: string;
  progress: number;
}

export function FormFileUpload({
  value,
  onChange,
  uploadedBy,
  uploadedByName,
  folder = 'expenses',
}: FormFileUploadProps) {
  const [uploading, setUploading] = useState<UploadingFile | null>(null);
  const [uploadError, setUploadError] = useState('');

  // ─── Upload a single file to Supabase Storage ───────────────────────────────
  const uploadOne = async (file: File): Promise<AttachmentFile | null> => {
    setUploadError('');
    const ext = file.name.split('.').pop() ?? 'bin';
    const storagePath = `${folder}/${generateId()}.${ext}`;

    setUploading({ name: file.name, progress: 30 });

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (error) {
      setUploadError(`שגיאה בהעלאת "${file.name}": ${error.message}`);
      setUploading(null);
      return null;
    }

    setUploading({ name: file.name, progress: 90 });

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    setUploading(null);

    return {
      id: generateId(),
      name: file.name,
      url: data.publicUrl,
      storagePath,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      uploadedByName,
      size: file.size,
      type: file.type,
    };
  };

  // ─── Dropzone handler ────────────────────────────────────────────────────────
  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setUploadError('');

      if (rejected.length > 0) {
        const first = rejected[0];
        const tooLarge = first.errors.some(e => e.message.includes('large') || e.message.includes('size'));
        setUploadError(
          tooLarge
            ? `הקובץ גדול מדי. מקסימום ${MAX_FILE_SIZE_MB}MB`
            : `סוג קובץ לא נתמך. מותר: PDF, JPG, PNG`
        );
        return;
      }

      const results: AttachmentFile[] = [];
      for (const file of accepted) {
        const att = await uploadOne(file);
        if (att) results.push(att);
      }

      if (results.length > 0) {
        onChange([...value, ...results]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange, uploadedBy, uploadedByName, folder]
  );

  // ─── Remove an attachment (delete from storage + update list) ────────────────
  const handleRemove = async (att: AttachmentFile) => {
    // Best-effort delete from storage (non-blocking)
    supabase.storage.from(BUCKET).remove([att.storagePath]).catch(() => {});
    onChange(value.filter(f => f.id !== att.id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: uploading !== null,
    multiple: true,
  });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">קבצים מצורפים / קבלות</span>
        {value.length > 0 && (
          <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
            {value.length}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-primary-400 bg-primary-50 scale-[1.01]'
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50',
          uploading ? 'opacity-60 pointer-events-none' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} />

        {uploading ? (
          /* Upload progress */
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            <p className="text-sm font-medium text-slate-700">
              מעלה &ldquo;{uploading.name}&rdquo;…
            </p>
            <div className="w-48 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploading.progress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          /* Drag active hint */
          <div className="flex flex-col items-center gap-1.5">
            <Upload className="h-7 w-7 text-primary-500" />
            <p className="text-sm font-semibold text-primary-600">שחרר כאן להעלאה</p>
          </div>
        ) : (
          /* Default state */
          <div className="flex flex-col items-center gap-1.5">
            <Upload className="h-7 w-7 text-slate-400" />
            <p className="text-sm font-medium text-slate-600">
              גרור קבצים לכאן, או{' '}
              <span className="text-primary-600 underline underline-offset-2">לחץ לבחירה</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              PDF, JPG, PNG&ensp;•&ensp;מקסימום {MAX_FILE_SIZE_MB}MB לקובץ
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <span className="shrink-0">⚠</span>
          {uploadError}
        </p>
      )}

      {/* Attached files list */}
      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map(att => (
            <li
              key={att.id}
              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {/* Thumbnail or icon */}
              {att.type.startsWith('image/') ? (
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 hover:opacity-90 transition-opacity"
                  />
                </a>
              ) : (
                <div className="w-12 h-12 shrink-0 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center">
                  <FileText className="h-5 w-5 text-red-500" />
                  <span className="text-[10px] text-red-500 font-semibold uppercase mt-0.5">
                    {att.name.split('.').pop()}
                  </span>
                </div>
              )}

              {/* Name + size */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-slate-800 truncate"
                  title={att.name}
                >
                  {att.name}
                </p>
                <p className="text-xs text-slate-400">{formatFileSize(att.size)}</p>
              </div>

              {/* Open link */}
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                title="פתח קובץ"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              {/* Remove */}
              <button
                type="button"
                onClick={() => handleRemove(att)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="הסר קובץ"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
