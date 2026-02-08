'use client';

export type Segment = 'alle' | 'actief' | 'inactief' | 'premium' | 'trial' | 'churned';

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'actief', label: 'Actief' },
  { value: 'inactief', label: 'Inactief' },
  { value: 'premium', label: 'Premium' },
  { value: 'trial', label: 'Trial' },
  { value: 'churned', label: 'Churned' },
];

interface SegmentFilterProps {
  active: Segment;
  onChange: (segment: Segment) => void;
}

export default function SegmentFilter({ active, onChange }: SegmentFilterProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
      {SEGMENTS.map((seg) => (
        <button
          key={seg.value}
          onClick={() => onChange(seg.value)}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
            active === seg.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
