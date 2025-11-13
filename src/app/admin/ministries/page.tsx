'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { Ministry, getMinistries, deleteMinistry } from "@/lib/supabase/ministries-admin";
import AddMinistryModal from "@/components/admin/ministries/add-ministry-modal";
import DeleteMinistryModal from "@/components/admin/ministries/delete-ministry-modal";
import { useToast } from "@/hooks/use-toast";

// Map icon strings to actual components (you'll need to import the actual Lucide icons)
const iconMap: { [key: string]: string } = {
  'users': '👥',
  'heart-handshake': '🤝',
  'music': '🎵',
  'baby': '👶',
  'hand-heart': '❤️',
  'calendar': '📅',
  'book-open': '📖',
  'users-round': '👥',
  'church': '⛪',
  'cross': '✝️'
};

export default function MinistriesAdminPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [filteredMinistries, setFilteredMinistries] = useState<Ministry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ministryToDelete, setMinistryToDelete] = useState<Ministry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMinistries();
  }, []);

  useEffect(() => {
    const filtered = ministries.filter(ministry =>
      ministry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ministry.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMinistries(filtered);
  }, [searchQuery, ministries]);

  const loadMinistries = async () => {
    setIsLoading(true);
    try {
      const ministriesData = await getMinistries();
      setMinistries(ministriesData);
      setFilteredMinistries(ministriesData);
    } catch (error) {
      console.error('Error loading ministries:', error);
      toast({
        title: "Error",
        description: "Failed to load ministries",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (ministry: Ministry) => {
    setMinistryToDelete(ministry);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ministryToDelete) return;

    try {
      const result = await deleteMinistry(ministryToDelete.id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `"${ministryToDelete.name}" has been deleted`,
          variant: "default"
        });
        loadMinistries(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete ministry",
        variant: "destructive"
      });
    }
  };

  const handleMinistryAdded = () => {
    toast({
      title: "Success",
      description: "Ministry added successfully",
      variant: "default"
    });
    loadMinistries(); // Refresh the list
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ministries</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all church ministries here.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setIsAddModalOpen(true)}
        >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Ministry
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Ministry List</CardTitle>
                    <CardDescription>A list of all ministries in your church.</CardDescription>
                </div>
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Search ministries..." 
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
              <p className="text-gray-600 dark:text-gray-400">Loading ministries...</p>
            </div>
          ) : filteredMinistries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No ministries found matching your search.' : 'No ministries found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMinistries.map((ministry) => {
                const ministryImage = PlaceHolderImages.find(p => p.id === ministry.image_id);
                return (
                  <Card key={ministry.id} className="group overflow-hidden relative text-white text-center flex flex-col justify-between h-80 transition-all duration-300 ease-in-out hover:shadow-2xl dark:bg-gray-900">
                    {/* Background Image - behind everything */}
                    {ministryImage && (
                      <Image
                        src={ministryImage.imageUrl}
                        alt={ministry.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                        data-ai-hint={ministryImage.imageHint}
                      />
                    )}
                    
                    {/* Gradient Overlay - behind content but above image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                    
                    {/* Dropdown Menu - above everything and clickable */}
                    <div className="absolute top-2 right-2 z-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            aria-haspopup="true" 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          
                          <DropdownMenuItem 
                            className="flex items-center gap-2 text-red-600 cursor-pointer focus:text-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteClick(ministry);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Content - above gradient but below dropdown */}
                    <div className="relative p-4 flex flex-col items-center justify-end h-full w-full z-10">
                        <div className="transition-transform duration-500 group-hover:-translate-y-4">
                            <div className="text-3xl mb-2">
                              {iconMap[ministry.icon] || '👥'}
                            </div>
                            <h3 className="text-xl font-bold font-headline">{ministry.name}</h3>
                            <p className="text-sm text-gray-300 line-clamp-2 mt-2">
                              {ministry.description}
                            </p>
                        </div>
                        <div className="absolute bottom-4 px-4 w-full">
                            <Badge variant="default" className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 ease-in-out delay-100">
                              Active
                            </Badge>
                        </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Ministry Modal */}
      <AddMinistryModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMinistryAdded={handleMinistryAdded}
      />

      {/* Delete Confirmation Modal */}
      <DeleteMinistryModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onMinistryDeleted={handleMinistryAdded}
        ministry={ministryToDelete}
      />
    </div>
  );
}
