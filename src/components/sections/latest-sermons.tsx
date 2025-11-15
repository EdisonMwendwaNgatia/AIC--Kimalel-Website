import { getLatestSermonsForBuild, getSermonTagsForBuild } from "@/lib/supabase/server-data";
import LatestSermonsClient from "./latest-sermons-client";

export default async function LatestSermons() {

  const [sermons, tags] = await Promise.all([
    getLatestSermonsForBuild(3),
    getSermonTagsForBuild()
  ]);


  if (!sermons.length) {
    return null;
  }

  return (
    <LatestSermonsClient 
      initialSermons={sermons}
      initialPreachers={[]} 
      initialTags={tags}
    />
  );
}
