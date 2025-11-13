'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Ministry, submitMinistrySignup, getMinistriesForSignup } from '@/lib/supabase/ministries_sign';

interface MinistrySignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fallback ministries in case the API fails
const FALLBACK_MINISTRIES = [
  "Men's Fellowship",
  "Women's Fellowship", 
  "Youth Fellowship",
  "Choir & Worship Team",
  "Children's Ministry",
  "Widows Ministry"
];

export default function MinistrySignupModal({ isOpen, onClose }: MinistrySignupModalProps) {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    ministry: '',
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadMinistries();
    }
  }, [isOpen]);

  const loadMinistries = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const ministriesData = await getMinistriesForSignup();
      console.log('Loaded ministries:', ministriesData); // For debugging
      setMinistries(ministriesData);
      
      // If no ministries loaded, use fallback
      if (!ministriesData || ministriesData.length === 0) {
        setLoadError('Could not load ministries from database. Using default list.');
        // Create Ministry objects from fallback names
        const fallbackMinistries = FALLBACK_MINISTRIES.map((name, index) => ({
          id: `fallback-${index}`,
          name,
          description: '',
          icon: '',
          image_id: '',
          href: '',
          created_at: new Date().toISOString()
        }));
        setMinistries(fallbackMinistries);
      }
    } catch (error) {
      console.error('Error loading ministries:', error);
      setLoadError('Failed to load ministries. Using default list.');
      // Use fallback ministries
      const fallbackMinistries = FALLBACK_MINISTRIES.map((name, index) => ({
        id: `fallback-${index}`,
        name,
        description: '',
        icon: '',
        image_id: '',
        href: '',
        created_at: new Date().toISOString()
      }));
      setMinistries(fallbackMinistries);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMinistryChange = (value: string) => {
    setFormData(prev => ({ ...prev, ministry: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitMinistrySignup({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || undefined,
        ministry: formData.ministry,
        meta: {
          message: formData.message,
          submitted_at: new Date().toISOString()
        }
      });

      if (result.success) {
        setIsSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      } else {
        alert('There was an error submitting your form. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      ministry: '',
      message: ''
    });
    setIsSuccess(false);
    setLoadError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card text-foreground border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary text-center">
            Join a Ministry
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Fill out the form below to express your interest in joining one of our ministries.
          </DialogDescription>
        </DialogHeader>

        {loadError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <p className="text-yellow-700 text-sm">{loadError}</p>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              Your ministry signup has been received. We'll be in touch soon!
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

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="bg-background border-gray-700 focus:ring-accent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ministry" className="text-foreground">
                Ministry You'd Like to Join *
              </Label>
              <Select value={formData.ministry} onValueChange={handleMinistryChange} required>
                <SelectTrigger className="bg-background border-gray-700 focus:ring-accent">
                  <SelectValue placeholder={isLoading ? "Loading ministries..." : "Select a ministry"} />
                </SelectTrigger>
                <SelectContent className="bg-card border-gray-700">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading ministries...
                    </SelectItem>
                  ) : (
                    ministries.map((ministry) => (
                      <SelectItem key={ministry.id} value={ministry.name}>
                        {ministry.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">
                Additional Message (Optional)
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us why you're interested in this ministry or any questions you have..."
                rows={3}
                className="bg-background border-gray-700 focus:ring-accent resize-none"
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
                disabled={isSubmitting || ministries.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Join Ministry'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
