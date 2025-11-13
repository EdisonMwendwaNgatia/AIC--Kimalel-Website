'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { Event, submitEventRSVP } from '@/lib/supabase/events';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export default function RSVPModal({ isOpen, onClose, event }: RSVPModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    setIsSubmitting(true);

    try {
      const result = await submitEventRSVP({
        full_name: formData.full_name,
        email: formData.email,
        event: event.title
      });

      if (result.success) {
        setIsSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          resetForm();
          onClose();
        }, 3000);
      } else {
        alert('There was an error submitting your RSVP. Please try again.');
      }
    } catch (error) {
      console.error('RSVP submission error:', error);
      alert('There was an error submitting your RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: ''
    });
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!event) return null;

  const eventDate = new Date(event.date);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center">
            RSVP for Event
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Confirm your attendance for this event
          </DialogDescription>
        </DialogHeader>

        {/* Event Details */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-headline text-lg text-accent mb-3">{event.title}</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
              <span>
                {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent flex-shrink-0" />
              <span>
                {eventDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  hour12: true 
                })}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">RSVP Confirmed!</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for confirming your attendance. We look forward to seeing you at the event!
            </p>
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {formData.email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-foreground">
                Full Name *
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                className="bg-background border-gray-700 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter your email"
                className="bg-background border-gray-700 focus:ring-accent"
              />
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
                    Submitting...
                  </>
                ) : (
                  'Confirm RSVP'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
