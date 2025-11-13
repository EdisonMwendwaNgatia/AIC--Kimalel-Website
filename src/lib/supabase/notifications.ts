import { createClient } from '@/utils/supabase/client';

export type NotificationItem = {
  id: string;
  type: 'sermon' | 'event' | 'donation' | 'prayer_request' | 'story' | 'subscriber';
  title: string;
  description: string;
  created_at: string;
  is_read: boolean;
  link: string;
}

export type NotificationStats = {
  total_unread: number;
  recent_items: NotificationItem[];
}

// Function to get recent activities from all tables
export async function getRecentActivities(): Promise<NotificationStats> {
  const supabase = createClient();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Get recent sermons (last 7 days)
  const { data: sermons } = await supabase
    .from('sermons')
    .select('id, title, created_at')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent events (upcoming events in next 7 days)
  const { data: events } = await supabase
    .from('events')
    .select('id, title, date, created_at')
    .gte('date', new Date().toISOString())
    .lte('date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('date', { ascending: true })
    .limit(5);

  // Get recent donations (last 7 days)
  const { data: donations } = await supabase
    .from('donations')
    .select('id, full_name, amount, created_at')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  // Get unread prayer requests
  const { data: prayerRequests } = await supabase
    .from('prayer_requests')
    .select('id, full_name, subject, created_at, status')
    .eq('status', 'unread')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent stories (last 7 days)
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, created_at')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent subscribers (last 7 days)
  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('id, email, created_at')
    .gte('created_at', oneWeekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  // Transform data into notification items
  const recentItems: NotificationItem[] = [];

  // Add sermons
  sermons?.forEach(sermon => {
    recentItems.push({
      id: `sermon-${sermon.id}`,
      type: 'sermon',
      title: 'New Sermon Added',
      description: sermon.title,
      created_at: sermon.created_at,
      is_read: false,
      link: '/admin/sermons'
    });
  });

  // Add upcoming events
  events?.forEach(event => {
    recentItems.push({
      id: `event-${event.id}`,
      type: 'event',
      title: 'Upcoming Event',
      description: event.title,
      created_at: event.created_at,
      is_read: false,
      link: '/admin/events'
    });
  });

  // Add recent donations
  donations?.forEach(donation => {
    recentItems.push({
      id: `donation-${donation.id}`,
      type: 'donation',
      title: 'New Donation',
      description: `${donation.full_name} donated Ksh ${donation.amount}`,
      created_at: donation.created_at,
      is_read: false,
      link: '/admin/donations'
    });
  });

  // Add unread prayer requests
  prayerRequests?.forEach(request => {
    recentItems.push({
      id: `prayer-${request.id}`,
      type: 'prayer_request',
      title: 'New Prayer Request',
      description: `${request.full_name}: ${request.subject}`,
      created_at: request.created_at,
      is_read: false,
      link: '/admin/requests'
    });
  });

  // Add recent stories
  stories?.forEach(story => {
    recentItems.push({
      id: `story-${story.id}`,
      type: 'story',
      title: 'New Story Added',
      description: story.title,
      created_at: story.created_at,
      is_read: false,
      link: '/admin/stories'
    });
  });

  // Add recent subscribers
  subscribers?.forEach(subscriber => {
    recentItems.push({
      id: `subscriber-${subscriber.id}`,
      type: 'subscriber',
      title: 'New Subscriber',
      description: subscriber.email,
      created_at: subscriber.created_at,
      is_read: false,
      link: '/admin/subscriptions'
    });
  });

  // Sort by creation date (newest first) and take top 10
  const sortedItems = recentItems
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return {
    total_unread: sortedItems.length,
    recent_items: sortedItems
  };
}

// Function to mark notifications as read
export async function markNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
  // In a real app, you'd update a notifications table
  // For now, we'll just return success since we're using local storage for read state
  return { success: true };
}
