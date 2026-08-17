'use client';

import { useState, useEffect } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, MapPin } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export default function TrackingPage() {
  const { executeMethod, isLoading, results } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [trackingId, setTrackingId] = useState('');
  const [trackingType, setTrackingType] = useState('awb');

  useEffect(() => {
    if (results.awbNumbers.length > 0 && !trackingId) {
      setTrackingId(results.awbNumbers[results.awbNumbers.length - 1]);
    }
  }, [results.awbNumbers, trackingId]);

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Tracking
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Track shipment status by AWB or LR number.</p>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tracking ID</Label>
              <Input value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="Enter AWB or LR number" />
              {results.awbNumbers.length > 0 && (
                <p className="text-xs text-muted-foreground">Auto-filled from last manifested AWB</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Tracking Type</Label>
              <Select value={trackingType} onValueChange={(v) => v && setTrackingType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="awb">AWB</SelectItem>
                  <SelectItem value="lrn">LRN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => run('trackShipment', [trackingId, trackingType])} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
        Execute trackShipment
      </Button>

      {(response || error) && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <span className={response ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {response ? 'Success' : 'Error'}
            </span>
            {duration > 0 && <span className="text-muted-foreground">{duration}ms</span>}
          </div>
          {response && <ResponseViewer data={response} success />}
          {error && <ResponseViewer data={error} success={false} />}
          {codeSnippet && <CodeSnippet code={codeSnippet} />}
          {hooks.length > 0 && <HooksLog hooks={hooks} />}
        </div>
      )}
    </div>
  );
}
