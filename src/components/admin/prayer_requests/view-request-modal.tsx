'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, Users, Mail, Calendar, MessageSquare, Heart, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';
import { PrayerRequest, updatePrayerRequestStatus, getPrayerRequestById } from '@/lib/supabase/prayer-requests-admin';
import { useToast } from '@/hooks/use-toast';

interface ViewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
  requestId: string | null;
}

const statusOptions = [
  { value: 'unread', label: 'Unread', color: 'text-red-600 bg-red-100' },
  { value: 'in_progress', label: 'In Progress', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'prayed_for', label: 'Prayed For', color: 'text-blue-600 bg-blue-100' },
  { value: 'resolved', label: 'Resolved', color: 'text-green-600 bg-green-100' },
  { value: 'archived', label: 'Archived', color: 'text-gray-600 bg-gray-100' }
];

const prayerTypeIcons = {
  healing: { icon: Heart, color: 'text-red-500' },
  family: { icon: Users, color: 'text-blue-500' },
  financial: { icon: TrendingUp, color: 'text-green-500' },
  guidance: { icon: Lightbulb, color: 'text-purple-500' },
  thanksgiving: { icon: Sparkles, color: 'text-yellow-500' },
  general: { icon: MessageSquare, color: 'text-gray-500' },
  other: { icon: MessageSquare, color: 'text-gray-500' }
};

export default function ViewRequestModal({ isOpen, onClose, onStatusUpdated, requestId }: ViewRequestModalProps) {
  const [request, setRequest] = useState<PrayerRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && requestId) {
      loadRequest();
    }
  }, [isOpen, requestId]);

  const loadRequest = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    try {
      const prayerRequest = await getPrayerRequestById(requestId);
      setRequest(prayerRequest);
    } catch (error) {
      console.error('Error loading prayer request:', error);
      toast({
        title: "Error",
        description: "Failed to load prayer request details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: PrayerRequest['status']) => {
    if (!request) return;
    
    setIsUpdating(true);
    try {
      const result = await updatePrayerRequestStatus(request.id, newStatus);
      
      if (result.success) {
        setRequest(prev => prev ? { ...prev, status: newStatus } : null);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onStatusUpdated();
        }, 1500);
        
        toast({
          title: "Status Updated",
          description: `Prayer request marked as ${newStatus.replace('_', ' ')}`,
          variant: "default"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update prayer request status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setRequest(null);
    setIsSuccess(false);
    onClose();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'prayed_for':
        return 'secondary';
      case 'in_progress':
        return 'outline';
      case 'unread':
        return 'destructive';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!requestId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-card text-foreground border-accent/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center">
            Prayer Request Details
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            View and manage this prayer request
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
            <p className="text-muted-foreground">Loading prayer request...</p>
          </div>
        ) : !request ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Prayer request not found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Status updated successfully!</span>
                </div>
              </div>
            )}

            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Requester Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">
                        {request.is_anonymous ? 'Anonymous' : request.full_name}
                      </span>
                    </div>
                    {!request.is_anonymous && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{request.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Request Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prayer Type:</span>
                      <Badge variant="outline" className="capitalize">
                        {request.prayer_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Status:</span>
                      <Badge variant={getStatusVariant(request.status)} className="capitalize">
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Update Status</h3>
                  <Select 
                    value={request.status} 
                    onValueChange={(value: PrayerRequest['status']) => handleStatusChange(value)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="bg-background border-gray-700 focus:ring-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-gray-700">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[1]}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isUpdating && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Updating status...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prayer Request Content */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Prayer Request</h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">{request.subject}</h4>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {request.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-700 text-foreground hover:bg-muted"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
