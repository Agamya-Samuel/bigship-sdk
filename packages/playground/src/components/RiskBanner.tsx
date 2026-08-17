import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

type RiskLevel = 'safe' | 'warning' | 'danger';

interface RiskBannerProps {
  level: RiskLevel;
  title?: string;
  children?: React.ReactNode;
}

const config: Record<RiskLevel, { icon: React.ElementType; className: string; defaultTitle: string }> = {
  safe: {
    icon: ShieldCheck,
    className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
    defaultTitle: 'Safe — Read-only operation',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
    defaultTitle: 'Warning — This will create/modify real data',
  },
  danger: {
    icon: ShieldAlert,
    className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
    defaultTitle: 'Danger — This will cancel/delete real data',
  },
};

export function RiskBanner({ level, title, children }: RiskBannerProps) {
  const { icon: Icon, className, defaultTitle } = config[level];

  return (
    <Alert className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title || defaultTitle}</AlertTitle>
      {children && <AlertDescription>{children}</AlertDescription>}
    </Alert>
  );
}
