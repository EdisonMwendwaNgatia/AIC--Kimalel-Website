'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Subscriber } from "./types";

interface ExportButtonProps {
  subscribers: Subscriber[];
}

export default function ExportButton({ subscribers }: ExportButtonProps) {
  const exportToCSV = () => {
    const headers = ['Email', 'Date Subscribed', 'Status'];
    const csvData = subscribers.map(subscriber => [
      subscriber.email,
      new Date(subscriber.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      'Active'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button 
      onClick={exportToCSV}
      className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 rounded-full shadow-lg hover:shadow-xl transition-shadow"
    >
      <Download className="mr-2 h-5 w-5" />
      Export CSV
    </Button>
  );
}
