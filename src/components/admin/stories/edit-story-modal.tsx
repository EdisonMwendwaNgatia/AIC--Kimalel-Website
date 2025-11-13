'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, X, Tag } from 'lucide-react';
import { Story, updateStory, getStoryById } from '@/lib/supabase/stories-admin';

interface EditStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryUpdated: () => void;
  storyId: string | null;
}

const availableCategories = [
  'Testimony',
  'Community Impact',
  'Youth Story',
  'Family',
  'Mission Trip',
  'Answered Prayer',
  'Spiritual Growth',
  'Outreach',
  'Other'
];

export default function EditStoryModal({ isOpen, onClose, onStoryUpdated, storyId }: EditStoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    contributor_name: '',
    contributor_email: '',
    contributor_phone: '',
    image_url: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    tags: [] as string[]
  });

  useEffect(() => {
    if (isOpen && storyId) {
      loadStory();
    }
  }, [isOpen, storyId]);

  const loadStory = async () => {
    if (!storyId) return;
    
    setIsLoading(true);
    try {
      const story = await getStoryById(storyId);
      if (story) {
        setFormData({
          title: story.title,
          content: story.content,
          excerpt: story.excerpt || '',
          category: story.category,
          contributor_name: story.contributor_name,
          contributor_email: story.contributor_email || '',
          contributor_phone: story.contributor_phone || '',
          image_url: story.image_url || '',
          status: story.status,
          featured: story.featured,
          tags: story.tags || []
        });
      }
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyId) return;
    
    setIsSubmitting(true);

    try {
      const result = await updateStory(storyId, {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        category: formData.category,
        contributor_name: formData.contributor_name,
        contributor_email: formData.contributor_email || null,
        contributor_phone: formData.contributor_phone || null,
        image_url: formData.image_url || null,
        status: formData.status,
        featured: formData.featured,
        tags: formData.tags.length > 0 ? formData.tags : null
      });

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          resetForm();
          onStoryUpdated();
          onClose();
        }, 2000);
      } else {
        alert('There was an error updating the story. Please try again.');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('There was an error updating the story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      contributor_name: '',
      contributor_email: '',
      contributor_phone: '',
      image_url: '',
      status: 'draft',
      featured: false,
      tags: []
    });
    setTagInput('');
    setIsSuccess(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-card text-foreground border-accent/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center">
            Edit Story
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Update the story details and settings.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
            <p className="text-muted-foreground">Loading story...</p>
          </div>
        ) : isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Story Updated!</h3>
            <p className="text-muted-foreground">
              The story has been successfully updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Story Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a compelling title for the story"
                  className="bg-background border-gray-700 focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-foreground">
                  Short Excerpt
                </Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Brief summary of the story (appears in previews)"
                  rows={2}
                  className="bg-background border-gray-700 focus:ring-accent resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-foreground">
                  Story Content *
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Share the full story here..."
                  rows={6}
                  className="bg-background border-gray-700 focus:ring-accent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-foreground">
                    Category *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)} required>
                    <SelectTrigger className="bg-background border-gray-700 focus:ring-accent">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-gray-700">
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-foreground">
                    Image URL (Optional)
                  </Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="bg-background border-gray-700 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            {/* Contributor Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Contributor Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contributor_name" className="text-foreground">
                    Contributor Name *
                  </Label>
                  <Input
                    id="contributor_name"
                    name="contributor_name"
                    value={formData.contributor_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Full name of story contributor"
                    className="bg-background border-gray-700 focus:ring-accent"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contributor_email" className="text-foreground">
                    Contributor Email
                  </Label>
                  <Input
                    id="contributor_email"
                    name="contributor_email"
                    type="email"
                    value={formData.contributor_email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="bg-background border-gray-700 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributor_phone" className="text-foreground">
                  Contributor Phone
                </Label>
                <Input
                  id="contributor_phone"
                  name="contributor_phone"
                  value={formData.contributor_phone}
                  onChange={handleInputChange}
                  placeholder="Phone number (optional)"
                  className="bg-background border-gray-700 focus:ring-accent"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Story Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-foreground">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => handleSelectChange('status', value)}>
                    <SelectTrigger className="bg-background border-gray-700 focus:ring-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-gray-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between space-y-0 py-2">
                  <div>
                    <Label htmlFor="featured" className="text-foreground cursor-pointer">
                      Featured Story
                    </Label>
                    <p className="text-sm text-muted-foreground">Show this story prominently</p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-foreground">
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                    placeholder="Add tags (press Enter)"
                    className="bg-background border-gray-700 focus:ring-accent"
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-700 text-foreground hover:bg-muted"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Story'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
