'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Info, ExternalLink } from 'lucide-react';
import ExportMenu from './ExportMenu';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onApiClick?: () => void;
  onExport?: (format: 'csv' | 'xlsx' | 'png') => void;
  isLoading?: boolean;
  error?: string;
}

export default function ChartCard({ 
  title, 
  subtitle, 
  children, 
  onApiClick, 
  onExport,
  isLoading,
  error 
}: ChartCardProps) {
  return (
    <div className="chart-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {onExport && <ExportMenu onExport={onExport} />}
          {onApiClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onApiClick}
              className="p-1 hover:bg-gray-100 text-xs"
              aria-label="API Documentation"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <div className="text-right">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[320px]">
        {isLoading && (
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--brand-green)' }}></div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-80 text-red-600">
            <p>שגיאה בטעינת הנתונים: {error}</p>
          </div>
        )}
        
        {!isLoading && !error && children}
      </div>
    </div>
  );
}