import React from 'react';
import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {fallback ? (
              <span className="text-sm font-medium text-muted-foreground">
                {fallback}
              </span>
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
