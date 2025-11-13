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

export type MinistrySignup = {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  ministry: string;
  meta?: any;
  created_at?: string;
}

// Function to get ministries for the dropdown
export async function getMinistriesForSignup(): Promise<Ministry[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('ministries')
    .select('id, name, description')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching ministries for signup:', error);
    // Fallback to hardcoded ministries if database fails
    return getFallbackMinistries();
  }

  // If no ministries in database, use fallback
  if (!data || data.length === 0) {
    return getFallbackMinistries();
  }

  return data;
}

// Fallback ministries in case database is empty
function getFallbackMinistries(): Ministry[] {
  return [
    {
      id: '1',
      name: "Men's Fellowship",
      description: "Supporting and equipping men to be Christ-centered leaders",
      icon: 'Users',
      image_id: 'ministry-men',
      href: '/ministries/mens-fellowship',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: "Women's Fellowship",
      description: "Empowering women through prayer, fellowship, and service",
      icon: 'HeartHandshake',
      image_id: 'ministry-women',
      href: '/ministries/womens-fellowship',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: "Youth Fellowship",
      description: "Building a vibrant generation of young believers",
      icon: 'Users',
      image_id: 'ministry-youth',
      href: '/ministries/youth-fellowship',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: "Choir & Worship Team",
      description: "Leading the congregation in praise and worship through music",
      icon: 'Music',
      image_id: 'ministry-choir',
      href: '/ministries/choir',
      created_at: new Date().toISOString()
    },
    {
      id: '5',
      name: "Children's Ministry",
      description: "Teaching God's Word to children in engaging ways",
      icon: 'Baby',
      image_id: 'ministry-children',
      href: '/ministries/sunday-school',
      created_at: new Date().toISOString()
    },
    {
      id: '6',
      name: "Widows Ministry",
      description: "Providing support to widows in our church and community",
      icon: 'HandHeart',
      image_id: 'widows-hero',
      href: '/ministries/widows',
      created_at: new Date().toISOString()
    }
  ];
}

export async function submitMinistrySignup(signupData: Omit<MinistrySignup, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('ministry_signups')
    .insert([signupData])
    .select()
    .single();

  if (error) {
    console.error('Error submitting ministry signup:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
