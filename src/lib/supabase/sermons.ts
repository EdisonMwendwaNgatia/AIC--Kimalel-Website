import { createClient } from '@/utils/supabase/client';

export type Sermon = {
  id: string;
  title: string;
  preacher: string;
  date: string;
  description: string;
  media_url: string | null;
  tags: string[];
  type: string;
  published: boolean;
  day_held: string;
  created_at: string;
}

export async function getNextSermon(): Promise<Sermon | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .gte('date', new Date().toISOString()) // Only future sermons
    .eq('published', true)
    .order('date', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching next sermon:', error);
    return null;
  }

  return data;
}

// Fallback: Get the most recent past sermon if no future ones exist
export async function getLatestSermon(): Promise<Sermon | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching latest sermon:', error);
    return null;
  }

  return data;
}

export async function getLatestSermons(limit: number = 6): Promise<Sermon[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest sermons:', error);
    return [];
  }

  return data;
}

export async function getPreachers(): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sermons')
    .select('preacher')
    .eq('published', true)
    .order('preacher');

  if (error) {
    console.error('Error fetching preachers:', error);
    return [];
  }

  // Remove duplicates and return unique preachers
  const uniquePreachers = [...new Set(data.map(item => item.preacher))];
  return uniquePreachers;
}

export async function getSermonTags(): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sermons')
    .select('tags')
    .eq('published', true);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Flatten and get unique tags
  const allTags = data.flatMap(item => item.tags || []);
  const uniqueTags = [...new Set(allTags)];
  return uniqueTags;
}

// Add these functions to your existing sermons.ts file

export async function searchSermons(query: string, preacher?: string, tag?: string, limit: number = 6): Promise<Sermon[]> {
  const supabase = createClient();
  
  let queryBuilder = supabase
    .from('sermons')
    .select('*')
    .eq('published', true);

  // Add search query
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  // Add preacher filter
  if (preacher && preacher !== 'all') {
    queryBuilder = queryBuilder.eq('preacher', preacher);
  }

  // Add tag filter
  if (tag && tag !== 'all') {
    queryBuilder = queryBuilder.contains('tags', [tag]);
  }

  const { data, error } = await queryBuilder
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching sermons:', error);
    return [];
  }

  return data;
}
