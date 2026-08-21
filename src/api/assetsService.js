import { supabase } from './supabaseClient';
import { logAction } from './activityService';

export const ASSET_BUCKETS = {
  vocab: 'vocab-images',
  speaking: 'speaking-images',
};

export async function listAssets(bucketKey) {
  const bucket = ASSET_BUCKETS[bucketKey];
  const { data, error } = await supabase.storage.from(bucket).list('', {
    limit: 200,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) throw error;

  return (data || [])
    .filter((item) => item.id) // folders have no id
    .map((item) => ({
      name: item.name,
      size: item.metadata?.size ?? 0,
      createdAt: item.created_at,
      publicUrl: supabase.storage.from(bucket).getPublicUrl(item.name).data.publicUrl,
    }));
}

export async function uploadAsset(bucketKey, file) {
  const bucket = ASSET_BUCKETS[bucketKey];
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  logAction({ action: 'asset_uploaded', targetType: 'asset', targetLabel: safeName });
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function deleteAsset(bucketKey, fileName) {
  const bucket = ASSET_BUCKETS[bucketKey];
  const { error } = await supabase.storage.from(bucket).remove([fileName]);
  if (error) throw error;

  logAction({ action: 'asset_deleted', targetType: 'asset', targetLabel: fileName });
}