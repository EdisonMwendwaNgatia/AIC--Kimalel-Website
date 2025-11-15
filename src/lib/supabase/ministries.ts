import { createClient } from '@/utils/supabase/client';
import { Users, HeartHandshake, Music, Baby, HandHeart } from 'lucide-react';

// Map icon names to actual components
const iconMap = {
  'Users': Users,
  'HeartHandshake': HeartHandshake,
  'Music': Music,
  'Baby': Baby,
  'HandHeart': HandHeart,
};

export type Ministry = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof iconMap;
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

  // Transform the data to include React components
  return data.map(ministry => ({
    ...ministry,
    icon: iconMap[ministry.icon as keyof typeof iconMap] || Users
  }));
}
