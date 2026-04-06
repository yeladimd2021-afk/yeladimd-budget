'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { generateId } from '@/lib/utils';

// Default bucket for receipt files
export const RECEIPTS_BUCKET = 'receipts';

interface UploadResult {
  url: string;
  storagePath: string;
}

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(
    async (file: File, folder: string, bucket: string = RECEIPTS_BUCKET): Promise<UploadResult> => {
      setUploading(true);
      setProgress(0);
      setError(null);

      const ext = file.name.split('.').pop() ?? 'bin';
      const storagePath = `${folder}/${generateId()}.${ext}`;

      setProgress(30);
      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      if (uploadErr) {
        setError(new Error(uploadErr.message));
        setUploading(false);
        throw new Error(uploadErr.message);
      }

      setProgress(90);
      const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      setProgress(100);
      setUploading(false);

      return { url: data.publicUrl, storagePath };
    },
    []
  );

  const deleteFile = useCallback(
    async (storagePath: string, bucket: string = RECEIPTS_BUCKET): Promise<void> => {
      try {
        await supabase.storage.from(bucket).remove([storagePath]);
      } catch {
        // Non-critical — file may already be deleted
      }
    },
    []
  );

  return { uploading, progress, error, uploadFile, deleteFile };
}
