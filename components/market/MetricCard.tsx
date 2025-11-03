'use client';

interface MetricCardProps {
  value: string | number;
  unit?: string;
  label: string;
  subtitle?: string;
  color?: string;
}

export default function MetricCard({ value, unit, label, subtitle, color }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="text-2xl font-bold mb-1" style={{ color: color || 'var(--color-text)' }}>
        {typeof value === 'number' ? value.toLocaleString('he-IL') : value}
        {unit && <span className="text-sm font-normal mr-1">{unit}</span>}
      </div>
      <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
        {label}
      </div>
      {subtitle && (
        <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}