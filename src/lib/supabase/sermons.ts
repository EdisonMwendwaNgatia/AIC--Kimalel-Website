import { createClient } from '@/utils/supabase/client';

export type Sermon = {
  id: string;
  title: string;
  tags: string[];
}

function normalizeTags(tags: any): string[] {
  if (Array.isArray(tags)) {
    return tags.filter(tag => tag !== null && tag !== undefined && tag !== '');
  }
  
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [tags];
    } catch {
      if (tags.startsWith('[') && tags.endsWith(']')) {
        return tags
          .slice(1, -1)
          .split(',')
          .map(tag => tag.replace(/"/g, '').trim())
          .filter(tag => tag !== '');
      }
      return [tags];
    }
  }
  
  return [];
}

export async function getNextSermon(): Promise<Sermon | null> {
  const supabase = createClient();
  
  try {
    // Since there's no date field in the new schema, we'll get a random sermon
    // or the first one as "next sermon"
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No sermons found');
        return null;
      }
      console.error('Error fetching sermon:', error);
      return null;
    }

    // Normalize tags before returning
    return data ? {
      ...data,
      tags: normalizeTags(data.tags)
    } : null;
  } catch (error) {
    console.error('Unexpected error in getNextSermon:', error);
    return null;
  }
}

export async function getLatestSermon(): Promise<Sermon | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest sermon:', error);
      return null;
    }

    // Normalize tags before returning
    return data ? {
      ...data,
      tags: normalizeTags(data.tags)
    } : null;
  } catch (error) {
    console.error('Unexpected error in getLatestSermon:', error);
    return null;
  }
}

export async function getLatestSermons(limit: number = 6): Promise<Sermon[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching latest sermons:', error);
      return [];
    }

    // Normalize tags for all sermons
    return data.map(sermon => ({
      ...sermon,
      tags: normalizeTags(sermon.tags)
    }));
  } catch (error) {
    console.error('Unexpected error in getLatestSermons:', error);
    return [];
  }
}

export async function getPreachers(): Promise<string[]> {
  const supabase = createClient();
  
  try {
    // Since there's no preacher field in the new schema, return empty array
    // or you might want to adapt this based on your new data structure
    console.warn('Preachers field not available in current schema');
    return [];
  } catch (error) {
    console.error('Unexpected error in getPreachers:', error);
    return [];
  }
}

export async function getSermonTags(): Promise<string[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('tags');

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    // Flatten and get unique tags with proper normalization
    const allTags = data.flatMap(item => normalizeTags(item.tags));
    const uniqueTags = [...new Set(allTags)].filter(Boolean);
    return uniqueTags;
  } catch (error) {
    console.error('Unexpected error in getSermonTags:', error);
    return [];
  }
}

export async function searchSermons(query: string, preacher?: string, tag?: string, limit: number = 6): Promise<Sermon[]> {
  const supabase = createClient();
  
  try {
    let queryBuilder = supabase
      .from('sermons')
      .select('*');

    // Add search query - only search in title since description field doesn't exist
    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    // Skip preacher filter since preacher field doesn't exist in new schema
    // Add tag filter
    if (tag && tag !== 'all') {
      queryBuilder = queryBuilder.contains('tags', [tag]);
    }

    const { data, error } = await queryBuilder
      .limit(limit);

    if (error) {
      console.error('Error searching sermons:', error);
      return [];
    }

    // Normalize tags for all sermons
    return data.map(sermon => ({
      ...sermon,
      tags: normalizeTags(sermon.tags)
    }));
  } catch (error) {
    console.error('Unexpected error in searchSermons:', error);
    return [];
  }
}

// Updated function to get all sermons (date range not applicable in new schema)
export async function getAllSermons(): Promise<Sermon[]> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*');

    if (error) {
      console.error('Error fetching all sermons:', error);
      return [];
    }

    // Normalize tags for all sermons
    return data.map(sermon => ({
      ...sermon,
      tags: normalizeTags(sermon.tags)
    }));
  } catch (error) {
    console.error('Unexpected error in getAllSermons:', error);
    return [];
  }
}
