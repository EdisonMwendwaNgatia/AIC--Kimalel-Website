import { createClient } from '@/utils/supabase/client';

export type SiteSettings = {
  id?: string;
  site_name: string;
  site_description: string;
  contact_email: string;
  pastor_name: string;
  church_address: string;
  service_times: string;
  created_at?: string;
  updated_at?: string;
}

// Default settings
export const defaultSettings: SiteSettings = {
  site_name: 'Our Church',
  site_description: 'A loving community of believers',
  contact_email: 'info@ourchurch.org',
  pastor_name: 'Pastor John Doe',
  church_address: '123 Church Street, City, State 12345',
  service_times: 'Sunday: 9:00 AM & 11:00 AM\nWednesday: 7:00 PM'
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error fetching site settings:', error);
    return defaultSettings;
  }

  return data;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // Check if settings exist
  const { data: existingSettings } = await supabase
    .from('site_settings')
    .select('id')
    .single();

  let result;
  
  if (existingSettings) {
    // Update existing settings
    result = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', existingSettings.id)
      .select()
      .single();
  } else {
    // Insert new settings
    result = await supabase
      .from('site_settings')
      .insert([{ ...defaultSettings, ...settings }])
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error updating site settings:', result.error);
    return { success: false, error: result.error.message };
  }

  return { success: true };
}
