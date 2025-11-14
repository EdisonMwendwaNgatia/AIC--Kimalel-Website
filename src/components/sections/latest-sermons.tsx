import { getLatestSermons, getSermonTags } from "@/lib/supabase/sermons";
import LatestSermonsClient from "./latest-sermons-client";

export default async function LatestSermons() {
  // Fetch initial data from database - only get 3 sermons
  // Note: getPreachers() is removed since preacher field doesn't exist in new schema
  const [sermons, tags] = await Promise.all([
    getLatestSermons(3),
    getSermonTags()
  ]);

  // If no sermons found, don't render the section
  if (!sermons.length) {
    return null;
  }

  return (
    <LatestSermonsClient 
      initialSermons={sermons}
      initialPreachers={[]} // Empty array since preachers field doesn't exist
      initialTags={tags}
    />
  );
}
