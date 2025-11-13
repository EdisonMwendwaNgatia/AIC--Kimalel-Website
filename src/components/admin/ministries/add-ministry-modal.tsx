'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle } from 'lucide-react';
import { createMinistry } from '@/lib/supabase/ministries-admin';

interface AddMinistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinistryAdded: () => void;
}

// Available Lucide React icons for ministries
const availableIcons = [
  { value: 'users', label: 'Users' },
  { value: 'heart-handshake', label: 'Heart Handshake' },
  { value: 'music', label: 'Music' },
  { value: 'baby', label: 'Baby' },
  { value: 'hand-heart', label: 'Hand Heart' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'book-open', label: 'Book Open' },
  { value: 'users-round', label: 'Users Round' },
  { value: 'church', label: 'Church' },
  { value: 'cross', label: 'Cross' }
];

// Available image IDs from your placeholder images
const availableImages = [
  { value: 'ministry-men', label: 'Men\'s Ministry' },
  { value: 'ministry-women', label: 'Women\'s Ministry' },
  { value: 'ministry-youth', label: 'Youth Ministry' },
  { value: 'ministry-choir', label: 'Choir Ministry' },
  { value: 'ministry-children', label: 'Children\'s Ministry' },
  { value: 'widows-hero', label: 'Widows Ministry' },
  { value: 'event-1', label: 'Event Image 1' },
  { value: 'event-2', label: 'Event Image 2' },
  { value: 'event-3', label: 'Event Image 3' }
];

export default function AddMinistryModal({ isOpen, onClose, onMinistryAdded }: AddMinistryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    image_id: '',
    href: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateHref = (name: string) => {
    return `/ministries/${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Auto-generate href if not provided
      const href = formData.href || generateHref(formData.name);

      const result = await createMinistry({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        image_id: formData.image_id,
        href: href
      });

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          resetForm();
          onMinistryAdded();
          onClose();
        }, 2000);
      } else {
        alert('There was an error creating the ministry. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error creating the ministry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      image_id: '',
      href: ''
    });
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card text-foreground border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center">
            Add New Ministry
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Create a new ministry to add to your church.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Ministry Created!</h3>
            <p className="text-muted-foreground">
              The ministry has been successfully added to your church.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Ministry Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter ministry name (e.g., Men's Fellowship)"
                className="bg-background border-gray-700 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe the purpose and activities of this ministry..."
                rows={3}
                className="bg-background border-gray-700 focus:ring-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon" className="text-foreground">
                  Icon *
                </Label>
                <Select value={formData.icon} onValueChange={(value) => handleSelectChange('icon', value)} required>
                  <SelectTrigger className="bg-background border-gray-700 focus:ring-accent">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-gray-700">
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_id" className="text-foreground">
                  Background Image *
                </Label>
                <Select value={formData.image_id} onValueChange={(value) => handleSelectChange('image_id', value)} required>
                  <SelectTrigger className="bg-background border-gray-700 focus:ring-accent">
                    <SelectValue placeholder="Select an image" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-gray-700">
                    {availableImages.map((image) => (
                      <SelectItem key={image.value} value={image.value}>
                        {image.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="href" className="text-foreground">
                Page URL
              </Label>
              <Input
                id="href"
                name="href"
                value={formData.href}
                onChange={handleInputChange}
                placeholder="/ministries/ministry-name (auto-generated if empty)"
                className="bg-background border-gray-700 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated: {generateHref(formData.name)}
              </p>
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
                    Creating...
                  </>
                ) : (
                  'Create Ministry'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
