'use server';

import { createClient } from '@/utils/supabase/server';


export type Sermon = {
  id: string;
  title: string;
  tags: string[];
};

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

export async function getLatestSermonsForBuild(limit: number = 10): Promise<Sermon[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest sermons for build:', error);
      return [];
    }

    return data?.map(sermon => ({
      ...sermon,
      tags: normalizeTags(sermon.tags)
    })) || [];
  } catch (error) {
    console.error('Unexpected error in getLatestSermonsForBuild:', error);
    return [];
  }
}

export async function getSermonTagsForBuild(): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sermons')
      .select('tags')
      .eq('published', true)
      .limit(100);

    if (error) {
      console.error('Error fetching sermon tags for build:', error);
      return [];
    }

    const tagsSet = new Set<string>();
    data?.forEach(sermon => {
      const normalized = normalizeTags(sermon.tags);
      normalized.forEach(tag => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error('Unexpected error in getSermonTagsForBuild:', error);
    return [];
  }
}

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
};

export async function getUpcomingEventsForBuild(limit: number = 6): Promise<Event[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString())
      .eq('published', true)
      .order('date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming events for build:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getUpcomingEventsForBuild:', error);
    return [];
  }
}

export async function getPastEventsForBuild(limit: number = 6): Promise<Event[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('date', new Date().toISOString())
      .eq('published', true)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching past events for build:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getPastEventsForBuild:', error);
    return [];
  }
}

export type Ministry = {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_id: string;
  href: string;
  created_at: string;
};

export async function getMinistriesForBuild(): Promise<Ministry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching ministries for build:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getMinistriesForBuild:', error);
    return [];
  }
}
