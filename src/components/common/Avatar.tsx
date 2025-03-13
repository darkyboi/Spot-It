
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  status = 'none',
  className 
}) => {
  // Size variations
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  // Status dot size variations based on avatar size
  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };
  
  // Status color variations
  const statusColorClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    none: 'hidden'
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn(
        "rounded-full overflow-hidden bg-secondary flex items-center justify-center border-2 border-white shadow-sm",
        sizeClasses[size]
      )}>
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-medium">
            {name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        )}
      </div>
      
      {status !== 'none' && (
        <span className={cn(
          "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
          statusSizeClasses[size],
          statusColorClasses[status]
        )} />
      )}
    </div>
  );
};

export default Avatar;
