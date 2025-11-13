import { createClient } from '@/utils/supabase/client';

export type Story = {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  contributor_name: string;
  contributor_email: string | null;
  contributor_phone: string | null;
  image_url: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export type StoryStats = {
  total_stories: number;
  published_stories: number;
  draft_stories: number;
  featured_stories: number;
}

export async function getStories(): Promise<Story[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  return data || [];
}

export async function getStoryStats(): Promise<StoryStats> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .select('status, featured');

  if (error) {
    console.error('Error fetching story stats:', error);
    return {
      total_stories: 0,
      published_stories: 0,
      draft_stories: 0,
      featured_stories: 0
    };
  }

  const total_stories = data.length;
  const published_stories = data.filter(story => story.status === 'published').length;
  const draft_stories = data.filter(story => story.status === 'draft').length;
  const featured_stories = data.filter(story => story.featured).length;

  return {
    total_stories,
    published_stories,
    draft_stories,
    featured_stories
  };
}

export async function createStory(storyData: Omit<Story, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .insert([storyData])
    .select()
    .single();

  if (error) {
    console.error('Error creating story:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateStory(id: string, storyData: Partial<Story>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .update(storyData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating story:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteStory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting story:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getStoryById(id: string): Promise<Story | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching story:', error);
    return null;
  }

  return data;
}
