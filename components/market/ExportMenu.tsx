'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';

interface ExportMenuProps {
  onExport: (format: 'csv' | 'xlsx' | 'png') => void;
}

export default function ExportMenu({ onExport }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 hover:bg-gray-100"
          aria-label="Export data"
        >
          <Download className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onExport('csv')} className="text-right">
          CSV ייצא ל
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('xlsx')} className="text-right">
          Excel ייצא ל
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('png')} className="text-right">
          PNG ייצא ל
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}