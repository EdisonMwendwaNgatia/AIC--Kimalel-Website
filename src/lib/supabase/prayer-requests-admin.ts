import { createClient } from '@/utils/supabase/client';

export type PrayerRequest = {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  prayer_type: 'general' | 'healing' | 'family' | 'financial' | 'guidance' | 'thanksgiving' | 'other';
  is_anonymous: boolean;
  status: 'unread' | 'in_progress' | 'prayed_for' | 'resolved' | 'archived';
  created_at: string;
  updated_at: string;
}

export type PrayerRequestStats = {
  total_requests: number;
  unread_requests: number;
  in_progress_requests: number;
  resolved_requests: number;
  recent_requests: number;
}

export async function getPrayerRequests(): Promise<PrayerRequest[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prayer requests:', error);
    return [];
  }

  return data || [];
}

export async function getPrayerRequestStats(): Promise<PrayerRequestStats> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('status, created_at');

  if (error) {
    console.error('Error fetching prayer request stats:', error);
    return {
      total_requests: 0,
      unread_requests: 0,
      in_progress_requests: 0,
      resolved_requests: 0,
      recent_requests: 0
    };
  }

  const total_requests = data.length;
  const unread_requests = data.filter(req => req.status === 'unread').length;
  const in_progress_requests = data.filter(req => req.status === 'in_progress').length;
  const resolved_requests = data.filter(req => req.status === 'resolved').length;
  
  const recent_requests = data.filter(req => {
    const requestDate = new Date(req.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return requestDate > weekAgo;
  }).length;

  return {
    total_requests,
    unread_requests,
    in_progress_requests,
    resolved_requests,
    recent_requests
  };
}

export async function updatePrayerRequestStatus(id: string, status: PrayerRequest['status']): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('prayer_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating prayer request status:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getPrayerRequestById(id: string): Promise<PrayerRequest | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('prayer_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching prayer request:', error);
    return null;
  }

  return data;
}
