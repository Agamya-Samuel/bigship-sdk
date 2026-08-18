'use client';

import { useState, useEffect } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { RiskBanner } from '@/components/RiskBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, FileCheck } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export default function ManifestPage() {
  const { executeMethod, isLoading, results } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [singleOrderId, setSingleOrderId] = useState('');
  const [singleCourierId, setSingleCourierId] = useState('5');
  const [heavyOrderId, setHeavyOrderId] = useState('');
  const [heavyCourierId, setHeavyCourierId] = useState('5');
  const [heavyRiskType, setHeavyRiskType] = useState('');

  useEffect(() => {
    if (results.orderIds.length > 0) {
      const latest = results.orderIds[results.orderIds.length - 1];
      if (!singleOrderId) setSingleOrderId(latest);
      if (!heavyOrderId) setHeavyOrderId(latest);
    }
  }, [results.orderIds, singleOrderId, heavyOrderId]);

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
          <FileCheck className="h-5 w-5" />
          Manifest
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Generate manifest for single or heavy shipments.</p>
      </div>

      <RiskBanner level="warning">
        Manifest operations create real data on the courier side. Proceed with caution.
      </RiskBanner>

      <Tabs defaultValue="manifestSingle">
        <TabsList>
          <TabsTrigger value="manifestSingle">manifestSingle</TabsTrigger>
          <TabsTrigger value="manifestHeavy">manifestHeavy</TabsTrigger>
        </TabsList>

        <TabsContent value="manifestSingle" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>System Order ID</Label>
                  <Input value={singleOrderId} onChange={e => setSingleOrderId(e.target.value)} placeholder="Enter system order ID" />
                  {results.orderIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Courier ID</Label>
                  <Input type="number" value={singleCourierId} onChange={e => setSingleCourierId(e.target.value)} placeholder="5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('manifestSingle', [{ system_order_id: singleOrderId, courier_id: Number(singleCourierId) }])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute manifestSingle
          </Button>
        </TabsContent>

        <TabsContent value="manifestHeavy" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>System Order ID</Label>
                  <Input value={heavyOrderId} onChange={e => setHeavyOrderId(e.target.value)} placeholder="Enter system order ID" />
                  {results.orderIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Courier ID</Label>
                  <Input type="number" value={heavyCourierId} onChange={e => setHeavyCourierId(e.target.value)} placeholder="5" />
                </div>
                <div className="space-y-1.5">
                  <Label>Risk Type <span className="text-muted-foreground">(optional)</span></Label>
                  <Input value={heavyRiskType} onChange={e => setHeavyRiskType(e.target.value)} placeholder="e.g. fragile, hazardous" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => {
              const params: Record<string, unknown> = { system_order_id: heavyOrderId, courier_id: Number(heavyCourierId) };
              if (heavyRiskType) params.risk_type = heavyRiskType;
              run('manifestHeavy', [params]);
            }}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute manifestHeavy
          </Button>
        </TabsContent>
      </Tabs>

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
