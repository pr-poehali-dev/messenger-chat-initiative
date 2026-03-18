import React from 'react';

interface AvatarProps {
  initials: string;
  status?: 'online' | 'offline' | 'away';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  index?: number;
}

const gradients = [
  'from-violet-500 to-pink-500',
  'from-blue-500 to-violet-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-cyan-500',
  'from-orange-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-fuchsia-500 to-violet-500',
  'from-amber-500 to-orange-500',
];

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const statusSizes = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

const statusColors = {
  online: 'bg-emerald-400',
  offline: 'bg-gray-500',
  away: 'bg-amber-400',
};

export default function Avatar({ initials, status, size = 'md', index = 0 }: AvatarProps) {
  const grad = gradients[index % gradients.length];

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center font-semibold text-white shadow-lg`}>
        {initials}
      </div>
      {status && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} rounded-full ${statusColors[status]} border-2 border-[hsl(var(--background))]`} />
      )}
    </div>
  );
}
