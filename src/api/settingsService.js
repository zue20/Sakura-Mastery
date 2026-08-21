import { supabase } from './supabaseClient';
import { logAction } from './activityService';

const SETTING_LABELS = {
  maintenance_mode: 'Maintenance Mode',
  announcement: 'Announcement Banner',
  xp_per_correct: 'XP per Correct Answer',
};

function describeChange(key, value) {
  const label = SETTING_LABELS[key] || key;

  if (key === 'maintenance_mode') return `turned Maintenance Mode ${value ? 'ON' : 'OFF'}`;
  if (key === 'announcement') return `${value?.enabled ? 'enabled' : 'disabled'} the Announcement Banner`;
  if (key === 'xp_per_correct') return `set XP per Correct Answer to ${value}`;
  return `changed ${label}`;
}

export async function getAllSettings() {
  const { data, error } = await supabase.from('app_settings').select('*');
  if (error) throw error;

  const settings = {};
  for (const row of data) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function updateSetting(key, value) {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;

  logAction({ action: 'setting_changed', targetType: 'setting', targetLabel: describeChange(key, value) });
}