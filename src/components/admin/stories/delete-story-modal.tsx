'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Story } from '@/lib/supabase/stories-admin';

interface DeleteStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryDeleted: () => void;
  story: Story | null;
}

export default function DeleteStoryModal({ 
  isOpen, 
  onClose, 
  onStoryDeleted, 
  story 
}: DeleteStoryModalProps) {
  
  const handleDelete = async () => {
    if (!story) return;

    try {
      const response = await fetch('/api/admin/stories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: story.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      onStoryDeleted();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      alert('There was an error deleting the story. Please try again.');
    }
  };

  if (!story) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Delete Story
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center">
          <p className="text-foreground mb-4">
            Are you sure you want to delete <strong>"{story.title}"</strong>?
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            This will permanently remove the story and all associated data.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700 text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              Delete Story
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
