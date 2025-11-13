import { createClient } from '@/utils/supabase/client';

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  ministry: string | null;
  description: string;
  published: boolean;
  image_id: string;
  created_at: string;
}

export async function getUpcomingEvents(limit: number = 6): Promise<Event[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('date', new Date().toISOString()) // Only future events
    .eq('published', true)
    .order('date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }

  return data;
}

export async function getPastEvents(limit: number = 6): Promise<Event[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .lt('date', new Date().toISOString()) // Only past events
    .eq('published', true)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching past events:', error);
    return [];
  }

  return data;
}

export async function getEventImageIds(): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('events')
    .select('image_id')
    .eq('published', true)
    .limit(12);

  if (error) {
    console.error('Error fetching event image IDs:', error);
    return [];
  }

  // Return unique image IDs
  const imageIds = [...new Set(data.map(item => item.image_id))];
  return imageIds;
}

export type EventRSVP = {
  id?: string;
  full_name: string;
  email: string;
  event: string;
  created_at?: string;
}

export async function submitEventRSVP(rsvpData: Omit<EventRSVP, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('event_rsvps')
    .insert([rsvpData])
    .select()
    .single();

  if (error) {
    console.error('Error submitting event RSVP:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
