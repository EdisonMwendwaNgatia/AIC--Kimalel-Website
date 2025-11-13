'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Search, Trash2, Edit, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Story, StoryStats, getStories, getStoryStats, deleteStory } from "@/lib/supabase/stories-admin";
import AddStoryModal from "@/components/admin/stories/add-story-modal";
import EditStoryModal from "@/components/admin/stories/edit-story-modal";
import DeleteStoryModal from "@/components/admin/stories/delete-story-modal";
import { useToast } from "@/hooks/use-toast";

export default function StoriesAdminPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    const filtered = stories.filter(story =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.contributor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.excerpt && story.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredStories(filtered);
  }, [searchQuery, stories]);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const [storiesData, statsData] = await Promise.all([
        getStories(),
        getStoryStats()
      ]);
      setStories(storiesData);
      setFilteredStories(storiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (story: Story) => {
    setSelectedStoryId(story.id);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (story: Story) => {
    setStoryToDelete(story);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return;

    try {
      const result = await deleteStory(storyToDelete.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `"${storyToDelete.title}" has been deleted`,
          variant: "default"
        });
        loadStories(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive"
      });
    }
  };

  const handleStoryAdded = () => {
    toast({
      title: "Success",
      description: "Story added successfully",
      variant: "default"
    });
    loadStories(); // Refresh the list
  };

  const handleStoryUpdated = () => {
    toast({
      title: "Success",
      description: "Story updated successfully",
      variant: "default"
    });
    loadStories(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Stories</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all testimonials and stories here.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setIsAddModalOpen(true)}
        >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Story
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_stories}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.published_stories}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <div className="w-6 h-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft_stories}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Edit className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.featured_stories}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Story List</CardTitle>
                    <CardDescription>A list of all stories submitted.</CardDescription>
                </div>
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Search stories..." 
                      className="pl-10 bg-gray-100 dark:bg-gray-700 border-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Loading stories...</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No stories found matching your search.' : 'No stories found.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contributor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStories.map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {story.title}
                          {story.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {story.excerpt && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {story.excerpt}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{story.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{story.contributor_name}</div>
                          {story.contributor_email && (
                            <div className="text-sm text-gray-500">{story.contributor_email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(story.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(story.status)} className="capitalize">
                          {story.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => handleEditClick(story)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-red-600 cursor-pointer"
                              onClick={() => handleDeleteClick(story)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Story Modal */}
      <AddStoryModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStoryAdded={handleStoryAdded}
      />

      {/* Edit Story Modal */}
      <EditStoryModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onStoryUpdated={handleStoryUpdated}
        storyId={selectedStoryId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteStoryModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onStoryDeleted={handleStoryAdded}
        story={storyToDelete}
      />
    </div>
  );
}
