import { createClient } from '@/utils/supabase/client';

export type Ministry = {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_id: string;
  href: string;
  created_at: string;
}

export async function getMinistries(): Promise<Ministry[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching ministries:', error);
    return [];
  }

  return data || [];
}

export async function createMinistry(ministryData: Omit<Ministry, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('ministries')
    .insert([ministryData])
    .select()
    .single();

  if (error) {
    console.error('Error creating ministry:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateMinistry(id: string, ministryData: Partial<Ministry>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('ministries')
    .update(ministryData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ministry:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteMinistry(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('ministries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting ministry:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
