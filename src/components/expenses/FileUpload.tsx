'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useStorage } from '@/hooks/useStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { AttachmentFile } from '@/types';
import { formatFileSize, generateId } from '@/lib/utils';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@/lib/constants';
import {
  Upload,
  File,
  FileText,
  Image,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface FileUploadProps {
  expenseId: string;
  attachments: AttachmentFile[];
  onAdd: (attachment: AttachmentFile) => Promise<void>;
  onRemove: (attachmentId: string) => Promise<void>;
  canUpload: boolean;
  canDelete: boolean;
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4 text-slate-500" />;
}

export function FileUpload({
  expenseId,
  attachments,
  onAdd,
  onRemove,
  canUpload,
  canDelete,
}: FileUploadProps) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { uploadFile, uploading, progress } = useStorage();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user || !profile) return;

      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          showToast(
            `הקובץ ${file.name} גדול מדי (מקסימום ${MAX_FILE_SIZE_MB}MB)`,
            'error'
          );
          continue;
        }

        try {
          const { url, storagePath } = await uploadFile(
            file,
            `expenses/${expenseId}`
          );

          const attachment: AttachmentFile = {
            id: generateId(),
            name: file.name,
            url,
            storagePath,
            uploadedAt: new Date().toISOString(), // ISO string — no Firebase Timestamp
            uploadedBy: user.id,
            uploadedByName: profile.displayName,
            size: file.size,
            type: file.type,
          };

          await onAdd(attachment);
          showToast(`הקובץ ${file.name} הועלה בהצלחה`, 'success');
        } catch {
          showToast(`שגיאה בהעלאת ${file.name}`, 'error');
        }
      }
    },
    [user, profile, expenseId, uploadFile, onAdd, showToast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: !canUpload || uploading,
  });

  const handleRemove = async (attachment: AttachmentFile) => {
    try {
      await onRemove(attachment.id);
      showToast('הקובץ נמחק', 'success');
    } catch {
      showToast('שגיאה במחיקת הקובץ', 'error');
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      {canUpload && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
              <p className="text-sm text-slate-600">מעלה... {progress}%</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                <div
                  className="bg-primary-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">
                {isDragActive ? 'שחרר כאן' : 'גרור קבצים או לחץ לבחירה'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, JPG, PNG • מקסימום {MAX_FILE_SIZE_MB}MB לקובץ
              </p>
            </>
          )}
        </div>
      )}

      {/* File list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(att => (
            <div
              key={att.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <FileIcon type={att.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{att.name}</p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(att.size)} • הועלה ע״י {att.uploadedByName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-primary-600 rounded transition-colors"
                  title="פתח"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                {canDelete && (
                  <button
                    onClick={() => handleRemove(att)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="מחק"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !canUpload && (
        <p className="text-sm text-slate-400 text-center py-3">אין קבצים מצורפים</p>
      )}
    </div>
  );
}
