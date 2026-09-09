'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Warehouse,
  Package,
  FileText,
  MapPin,
  X,
  Zap,
  GitBranch,
  Activity,
  AlertTriangle,
  Wrench,
  Calculator,
  CreditCard,
} from 'lucide-react';

const navItems = [
  { href: '/playground/profile', label: 'Profile', icon: User, group: 'Read' },
  { href: '/playground/warehouse', label: 'Warehouse', icon: Warehouse, group: 'Read' },
  { href: '/playground/rates', label: 'Rates', icon: Calculator, group: 'Read' },
  { href: '/playground/tracking', label: 'Tracking', icon: MapPin, group: 'Read' },
  { href: '/playground/shipment', label: 'Shipment', icon: Package, group: 'Read' },
  { href: '/playground/reference', label: 'Reference Data', icon: CreditCard, group: 'Read' },
  { href: '/playground/orders', label: 'Orders', icon: FileText, group: 'Write' },
  { href: '/playground/cancel', label: 'Cancel', icon: X, group: 'Write' },
  { href: '/playground/convenience', label: 'Convenience', icon: Zap, group: 'Advanced' },
  { href: '/playground/workflow', label: 'Workflow', icon: GitBranch, group: 'Advanced' },
  { href: '/playground/hooks', label: 'Hooks', icon: Activity, group: 'Advanced' },
  { href: '/playground/errors', label: 'Errors', icon: AlertTriangle, group: 'Advanced' },
  { href: '/playground/utils', label: 'Utilities', icon: Wrench, group: 'Advanced' },
];

const groups = ['Read', 'Write', 'Advanced'];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r bg-muted/20 flex-shrink-0 overflow-y-auto hidden md:block">
      <nav className="p-3 space-y-5">
        {groups.map(group => (
          <div key={group}>
            <h3 className="px-3 mb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group}
            </h3>
            <div className="space-y-0.5">
              {navItems
                .filter(item => item.group === group)
                .map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
