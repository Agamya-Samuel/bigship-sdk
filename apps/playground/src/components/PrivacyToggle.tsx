'use client';

import { usePrivacyGuard } from '@/components/PrivacyGuard';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacyToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function PrivacyToggle({ className, variant = 'ghost', size = 'sm' }: PrivacyToggleProps) {
  const { privacyEnabled, togglePrivacy } = usePrivacyGuard();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={togglePrivacy}
      className={cn('gap-1.5', className)}
      title={privacyEnabled ? 'Show sensitive data' : 'Hide sensitive data'}
    >
      {privacyEnabled ? (
        <>
          <EyeOff className="h-3.5 w-3.5" />
          <span className="text-xs">Privacy On</span>
        </>
      ) : (
        <>
          <Eye className="h-3.5 w-3.5" />
          <span className="text-xs">Privacy Off</span>
        </>
      )}
    </Button>
  );
}
