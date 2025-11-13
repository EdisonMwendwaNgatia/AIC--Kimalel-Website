'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Ministry } from '@/lib/supabase/ministries-admin';

interface DeleteMinistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinistryDeleted: () => void;
  ministry: Ministry | null;
}

export default function DeleteMinistryModal({ 
  isOpen, 
  onClose, 
  onMinistryDeleted, 
  ministry 
}: DeleteMinistryModalProps) {
  
  const handleDelete = async () => {
    if (!ministry) return;

    try {
      const response = await fetch('/api/admin/ministries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: ministry.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete ministry');
      }

      onMinistryDeleted();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      alert('There was an error deleting the ministry. Please try again.');
    }
  };

  if (!ministry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Delete Ministry
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="text-center">
          <p className="text-foreground mb-4">
            Are you sure you want to delete <strong>"{ministry.name}"</strong>?
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            This will permanently remove the ministry from your church and all associated data.
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
              Delete Ministry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
