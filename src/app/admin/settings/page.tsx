'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, LogOut, Save, Building2, Mail, User, MapPin, Clock } from "lucide-react";
import { SiteSettings, getSiteSettings, updateSiteSettings } from "@/lib/supabase/settings";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/utils/supabase/client';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const siteSettings = await getSiteSettings();
      setSettings(siteSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const result = await updateSiteSettings(settings);
      
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        
        toast({
          title: "Settings Saved",
          description: "Your site settings have been updated successfully",
          variant: "default"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        variant: "default"
      });
      
      // Redirect to login page
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your church website settings.</p>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Site Settings Form */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-accent" />
                Site Settings
              </CardTitle>
              <CardDescription>
                Configure your church website information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Settings saved successfully!</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Church Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Church Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site_name" className="text-foreground">
                      Church Name *
                    </Label>
                    <Input
                      id="site_name"
                      name="site_name"
                      value={settings?.site_name || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your church name"
                      className="bg-background border-gray-700 focus:ring-accent"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_description" className="text-foreground">
                      Church Description
                    </Label>
                    <Textarea
                      id="site_description"
                      name="site_description"
                      value={settings?.site_description || ''}
                      onChange={handleInputChange}
                      placeholder="Brief description of your church"
                      rows={3}
                      className="bg-background border-gray-700 focus:ring-accent resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pastor_name" className="text-foreground">
                      Pastor's Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="pastor_name"
                        name="pastor_name"
                        value={settings?.pastor_name || ''}
                        onChange={handleInputChange}
                        placeholder="Pastor's full name"
                        className="bg-background border-gray-700 focus:ring-accent pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-foreground">
                      Contact Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="contact_email"
                        name="contact_email"
                        type="email"
                        value={settings?.contact_email || ''}
                        onChange={handleInputChange}
                        required
                        placeholder="contact@church.org"
                        className="bg-background border-gray-700 focus:ring-accent pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="church_address" className="text-foreground">
                      Church Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="church_address"
                        name="church_address"
                        value={settings?.church_address || ''}
                        onChange={handleInputChange}
                        placeholder="Church street address"
                        className="bg-background border-gray-700 focus:ring-accent pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Times */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Service Times</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service_times" className="text-foreground">
                      Service Schedule
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Textarea
                        id="service_times"
                        name="service_times"
                        value={settings?.service_times || ''}
                        onChange={handleInputChange}
                        placeholder="Sunday: 9:00 AM & 11:00 AM&#10;Wednesday: 7:00 PM"
                        rows={4}
                        className="bg-background border-gray-700 focus:ring-accent resize-none pl-10"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Enter each service time on a new line
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('/admin', '_self')}
              >
                📊 View Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('/', '_blank')}
              >
                👀 View Live Site
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleLogout}
              >
                🚪 Log Out
              </Button>
            </CardContent>
          </Card>

          {/* Current Settings Preview */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
              <CardDescription>Preview of your current configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-500">Church:</span>
                <p className="text-foreground">{settings?.site_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Pastor:</span>
                <p className="text-foreground">{settings?.pastor_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Email:</span>
                <p className="text-foreground">{settings?.contact_email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">Services:</span>
                <div className="text-foreground whitespace-pre-line mt-1">
                  {settings?.service_times}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                If you need assistance with your settings or have any questions, please contact your website administrator.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{settings?.contact_email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
