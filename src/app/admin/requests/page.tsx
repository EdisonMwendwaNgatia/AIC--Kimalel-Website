'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Eye, Users, Heart, TrendingUp, Lightbulb, Sparkles, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PrayerRequest, PrayerRequestStats, getPrayerRequests, getPrayerRequestStats } from "@/lib/supabase/prayer-requests-admin";
import ViewRequestModal from "@/components/admin/prayer_requests/view-request-modal";
import { useToast } from "@/hooks/use-toast";

export default function PrayerRequestsAdminPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PrayerRequest[]>([]);
  const [stats, setStats] = useState<PrayerRequestStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPrayerRequests();
  }, []);

  useEffect(() => {
    const filtered = requests.filter(request =>
      request.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRequests(filtered);
  }, [searchQuery, requests]);

  const loadPrayerRequests = async () => {
    setIsLoading(true);
    try {
      const [requestsData, statsData] = await Promise.all([
        getPrayerRequests(),
        getPrayerRequestStats()
      ]);
      setRequests(requestsData);
      setFilteredRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading prayer requests:', error);
      toast({
        title: "Error",
        description: "Failed to load prayer requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewClick = (request: PrayerRequest) => {
    setSelectedRequestId(request.id);
    setIsViewModalOpen(true);
  };

  const handleStatusUpdated = () => {
    loadPrayerRequests(); // Refresh the list
  };

  const getPrayerTypeIcon = (type: string) => {
    const iconMap = {
      healing: Heart,
      family: Users,
      financial: TrendingUp,
      guidance: Lightbulb,
      thanksgiving: Sparkles,
      general: MessageSquare,
      other: MessageSquare
    };
    
    const IconComponent = iconMap[type as keyof typeof iconMap] || MessageSquare;
    const colorMap = {
      healing: 'text-red-500',
      family: 'text-blue-500',
      financial: 'text-green-500',
      guidance: 'text-purple-500',
      thanksgiving: 'text-yellow-500',
      general: 'text-gray-500',
      other: 'text-gray-500'
    };
    
    return <IconComponent className={`w-4 h-4 ${colorMap[type as keyof typeof colorMap]}`} />;
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getMessagePreview = (message: string) => {
    return message.length > 80 ? message.substring(0, 80) + '...' : message;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Prayer Requests</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all prayer requests from your congregation.</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_requests}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Needs Attention</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unread_requests}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <div className="w-6 h-6 bg-red-600 dark:bg-red-400 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.in_progress_requests}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <div className="w-6 h-6 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved_requests}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <div className="w-6 h-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
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
                    <CardTitle>Prayer Request Inbox</CardTitle>
                    <CardDescription>All prayer requests submitted by your congregation.</CardDescription>
                </div>
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Search by name or subject..." 
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
              <p className="text-gray-600 dark:text-gray-400">Loading prayer requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No prayer requests found matching your search.' : 'No prayer requests found.'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Prayer Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {request.is_anonymous ? (
                            <>
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>Anonymous</span>
                            </>
                          ) : (
                            <>
                              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                                {request.full_name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div>{request.full_name}</div>
                                <div className="text-xs text-gray-500">{request.email}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPrayerTypeIcon(request.prayer_type)}
                          <Badge variant="outline" className="capitalize">
                            {request.prayer_type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{request.subject}</div>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400 max-w-xs">
                        {getMessagePreview(request.message)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(request.status)} className="capitalize">
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => handleViewClick(request)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
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

          {/* Request Count */}
          {filteredRequests.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredRequests.length} prayer request{filteredRequests.length !== 1 ? 's' : ''}
                {stats && stats.recent_requests > 0 && ` • ${stats.recent_requests} new this week`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Request Modal */}
      <ViewRequestModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onStatusUpdated={handleStatusUpdated}
        requestId={selectedRequestId}
      />
    </div>
  );
}
