'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlayCircle, Search } from 'lucide-react';
import Image from 'next/image';
import { Sermon, searchSermons } from '@/lib/supabase/sermons';

interface SermonsGridProps {
  initialSermons: Sermon[];
  preachers: string[];
  tags: string[];
}

export default function SermonsGrid({ initialSermons, preachers, tags }: SermonsGridProps) {
  const [sermons, setSermons] = useState<Sermon[]>(initialSermons);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreacher, setSelectedPreacher] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedPreacher, selectedTag]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchSermons(searchQuery, selectedPreacher, selectedTag, 50);
      setSermons(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPreacher('all');
    setSelectedTag('all');
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-12 flex flex-col md:flex-row gap-4 justify-center items-end">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search sermons by title or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-gray-700 text-foreground focus:ring-accent" 
          />
        </div>
        <Select value={selectedPreacher} onValueChange={setSelectedPreacher}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-gray-700 text-foreground focus:ring-accent">
            <SelectValue placeholder="All Preachers" />
          </SelectTrigger>
          <SelectContent className="bg-card text-foreground border-gray-700">
            <SelectItem value="all">All Preachers</SelectItem>
            {preachers.map((preacher, index) => (
              <SelectItem key={index} value={preacher}>
                {preacher}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-full md:w-[200px] bg-card border-gray-700 text-foreground focus:ring-accent">
            <SelectValue placeholder="All Themes" />
          </SelectTrigger>
          <SelectContent className="bg-card text-foreground border-gray-700">
            <SelectItem value="all">All Themes</SelectItem>
            {tags.map((tag, index) => (
              <SelectItem key={index} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="border-gray-700 text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Clear Filters
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Searching sermons...</p>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && sermons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">No sermons found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={clearFilters}
            className="text-accent"
          >
            Clear filters and show all sermons
          </Button>
        </div>
      )}

      {/* Sermons Grid */}
      {!isLoading && sermons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sermons.map((sermon) => {
            const sermonImage = PlaceHolderImages.find(p => p.id === 'sermon-thumbnail');
            const sermonDate = new Date(sermon.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <Card key={sermon.id} className="overflow-hidden group bg-card border-accent/20 border backdrop-blur-sm text-foreground transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:shadow-accent/20">
                <div className="relative aspect-[16/9]">
                  {sermonImage && (
                    <Image
                      src={sermonImage.imageUrl}
                      alt={sermon.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-accent" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold font-headline text-xl text-accent mb-2 line-clamp-2">{sermon.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{sermon.preacher}</p>
                  <p className="text-xs text-muted-foreground mb-4">{sermonDate}</p>
                  <p className="text-foreground text-sm mb-4 line-clamp-3">{sermon.description}</p>
                  
                  {sermon.tags && sermon.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {sermon.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                          {tag}
                        </span>
                      ))}
                      {sermon.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                          +{sermon.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    variant="link" 
                    className="p-0 text-accent hover:text-accent/80"
                    asChild
                  >
                    {sermon.media_url ? (
                      <a href={sermon.media_url} target="_blank" rel="noopener noreferrer">
                        {sermon.media_url.includes('youtube') || sermon.media_url.includes('vimeo') ? 'Watch Now' : 'Listen Now'} &rarr;
                      </a>
                    ) : (
                      <span className="text-muted-foreground cursor-not-allowed">
                        Media Coming Soon
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sermons Count */}
      {!isLoading && sermons.length > 0 && (
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Showing {sermons.length} sermon{sermons.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
