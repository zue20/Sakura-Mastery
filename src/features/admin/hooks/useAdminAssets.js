import { useState, useCallback, useEffect } from 'react';
import { listAssets, uploadAsset, deleteAsset } from '../../../api/assetsService';

export default function useAdminAssets(bucketKey) {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await listAssets(bucketKey);
      setAssets(results);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [bucketKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const upload = useCallback(async (file) => {
    setIsUploading(true);
    try {
      await uploadAsset(bucketKey, file);
      await refresh();
    } finally {
      setIsUploading(false);
    }
  }, [bucketKey, refresh]);

  const remove = useCallback(async (fileName) => {
    await deleteAsset(bucketKey, fileName);
    await refresh();
  }, [bucketKey, refresh]);

  return { assets, isLoading, error, isUploading, upload, remove, refresh };
}