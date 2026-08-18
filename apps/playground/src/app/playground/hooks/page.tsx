'use client';

import { usePlayground } from '@/components/PlaygroundProvider';
import { HooksLog } from '@/components/HooksLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Send, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

const HOOK_TYPES = [
  {
    type: 'beforeRequest',
    icon: Send,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Fires before the HTTP request is sent to the BigShip API. Contains the endpoint URL and HTTP method.',
  },
  {
    type: 'response',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Fires after a successful API response is received. Contains the response duration and status.',
  },
  {
    type: 'error',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    description: 'Fires when an API request fails. Contains the error message and any status code information.',
  },
  {
    type: 'retry',
    icon: RotateCcw,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    description: 'Fires when the SDK retries a failed request (e.g., on rate limiting or transient errors). Contains the attempt number.',
  },
] as const;

export default function HooksPage() {
  const { hooksLog } = usePlayground();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Hooks
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          SDK lifecycle hooks provide observability into every HTTP request cycle.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hook Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {HOOK_TYPES.map(({ type, icon: Icon, color, description }) => (
              <div key={type} className="flex items-start gap-3 p-3 rounded-lg border">
                <Badge className={color} variant="secondary">
                  <Icon className="h-3 w-3 mr-1" />
                  {type}
                </Badge>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {hooksLog.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="h-8 w-8 mb-3 opacity-50" />
            <p className="text-sm font-medium">No hooks recorded yet</p>
            <p className="text-xs mt-1">Execute any SDK method on another page to see hooks fire here.</p>
          </CardContent>
        </Card>
      )}

      <HooksLog hooks={hooksLog} />
    </div>
  );
}
