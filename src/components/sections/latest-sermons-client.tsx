'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { PlayCircle, Search } from "lucide-react";
import Link from "next/link";
import { Sermon, searchSermons, getPreachers, getSermonTags } from "@/lib/supabase/sermons";

interface LatestSermonsClientProps {
  initialSermons: Sermon[];
  initialPreachers: string[];
  initialTags: string[];
}

export default function LatestSermonsClient({ 
  initialSermons, 
  initialPreachers, 
  initialTags 
}: LatestSermonsClientProps) {
  const [sermons, setSermons] = useState<Sermon[]>(initialSermons);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreacher, setSelectedPreacher] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedPreacher, selectedTag]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchSermons(searchQuery, selectedPreacher, selectedTag, 3); // Limit to 3
      setSermons(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePreacherChange = (value: string) => {
    setSelectedPreacher(value);
  };

  const handleTagChange = (value: string) => {
    setSelectedTag(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPreacher('all');
    setSelectedTag('all');
  };

  // If no sermons found after search
  if (!sermons.length && !isLoading) {
    return (
      <section className="py-20 bg-secondary">
        <div className="section-divider mb-20"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">Latest Sermons</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              Be blessed by the Word of God, shared with passion and conviction.
            </p>
          </div>

          <div className="mb-12 flex flex-col md:flex-row gap-4 justify-center">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search sermons..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 bg-card border-gray-700 text-foreground focus:ring-accent" 
              />
            </div>
            <Select value={selectedPreacher} onValueChange={handlePreacherChange}>
              <SelectTrigger className="w-full md:w-[180px] bg-card border-gray-700 text-foreground focus:ring-accent">
                <SelectValue placeholder="Filter by Pastor" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-gray-700">
                <SelectItem value="all">All Preachers</SelectItem>
                {initialPreachers.map((preacher, index) => (
                  <SelectItem key={index} value={preacher}>
                    {preacher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={handleTagChange}>
              <SelectTrigger className="w-full md:w-[180px] bg-card border-gray-700 text-foreground focus:ring-accent">
                <SelectValue placeholder="Filter by Theme" />
              </SelectTrigger>
              <SelectContent className="bg-card text-foreground border-gray-700">
                <SelectItem value="all">All Themes</SelectItem>
                {initialTags.map((tag, index) => (
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

          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No sermons found matching your criteria.</p>
            <Button 
              variant="link" 
              onClick={clearFilters}
              className="text-accent mt-4"
            >
              Clear filters and show all sermons
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-secondary">
      <div className="section-divider mb-20"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">Latest Sermons</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Be blessed by the Word of God, shared with passion and conviction.
          </p>
        </div>

        <div className="mb-12 flex flex-col md:flex-row gap-4 justify-center items-end">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search sermons..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 bg-card border-gray-700 text-foreground focus:ring-accent" 
            />
          </div>
          <Select value={selectedPreacher} onValueChange={handlePreacherChange}>
            <SelectTrigger className="w-full md:w-[180px] bg-card border-gray-700 text-foreground focus:ring-accent">
              <SelectValue placeholder="Filter by Pastor" />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border-gray-700">
              <SelectItem value="all">All Preachers</SelectItem>
              {initialPreachers.map((preacher, index) => (
                <SelectItem key={index} value={preacher}>
                  {preacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTag} onValueChange={handleTagChange}>
            <SelectTrigger className="w-full md:w-[180px] bg-card border-gray-700 text-foreground focus:ring-accent">
              <SelectValue placeholder="Filter by Theme" />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border-gray-700">
              <SelectItem value="all">All Themes</SelectItem>
              {initialTags.map((tag, index) => (
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

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Searching sermons...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sermons.map((sermon) => {
            const sermonImage = PlaceHolderImages.find(p => p.id === 'sermon-thumbnail');
            const sermonDate = new Date(sermon.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
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
                      data-ai-hint={sermonImage.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-accent" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold font-headline text-xl text-accent mb-2 h-14 line-clamp-2">{sermon.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{sermon.preacher} &bull; {sermonDate}</p>
                  <p className="text-foreground text-sm mb-4 h-20 overflow-hidden line-clamp-3">{sermon.description}</p>
                  
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
                    asChild 
                    className="p-0 text-accent hover:text-accent/80"
                  >
                    {sermon.media_url ? (
                      <a href={sermon.media_url} target="_blank" rel="noopener noreferrer">
                        Watch Now &rarr;
                      </a>
                    ) : (
                      <Link href="#">
                        Listen Now &rarr;
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Show "View More" button if there are more sermons */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            asChild
          >
            <Link href="/sermons">
              View All Sermons
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
