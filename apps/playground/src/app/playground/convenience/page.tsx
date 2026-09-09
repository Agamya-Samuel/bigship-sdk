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
import { Loader2, Play, Zap } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export default function ConveniencePage() {
  const { executeMethod, isLoading, results } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [trackOrderId, setTrackOrderId] = useState('');
  const [detailOrderId, setDetailOrderId] = useState('');
  const [downloadOrderId, setDownloadOrderId] = useState('');
  const [documentType, setDocumentType] = useState<'invoice' | 'label' | 'ewaybill' | 'manifest'>('label');

  useEffect(() => {
    if (results.orderIds.length > 0) {
      const latest = results.orderIds[results.orderIds.length - 1];
      if (!trackOrderId) setTrackOrderId(latest);
      if (!detailOrderId) setDetailOrderId(latest);
      if (!downloadOrderId) setDownloadOrderId(latest);
    }
  }, [results.orderIds, trackOrderId, detailOrderId, downloadOrderId]);

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
          <Zap className="h-5 w-5" />
          Quick Operations
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Convenient methods for common operations.</p>
      </div>

      <Tabs defaultValue="track">
        <TabsList>
          <TabsTrigger value="track">Track Order</TabsTrigger>
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="download">Download Document</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="space-y-4">
          <RiskBanner level="safe">
            This is a read-only operation and will not modify any data.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Custom Global Order ID</Label>
                <Input value={trackOrderId} onChange={e => setTrackOrderId(e.target.value)} placeholder="Enter order ID" />
                {results.orderIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('trackOrder', [trackOrderId])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute trackOrder
          </Button>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <RiskBanner level="safe">
            This is a read-only operation and will not modify any data.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Master Custom Order ID</Label>
                <Input value={detailOrderId} onChange={e => setDetailOrderId(e.target.value)} placeholder="Enter order ID" />
                {results.orderIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('getOrderDetail', [detailOrderId])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getOrderDetail
          </Button>
        </TabsContent>

        <TabsContent value="download" className="space-y-4">
          <RiskBanner level="safe">
            This is a read-only operation and will not modify any data.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Custom Global Order ID</Label>
                  <Input value={downloadOrderId} onChange={e => setDownloadOrderId(e.target.value)} placeholder="Enter order ID" />
                  {results.orderIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Document Type</Label>
                  <Tabs value={documentType} onValueChange={(v) => setDocumentType(v as any)}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="label">Label</TabsTrigger>
                      <TabsTrigger value="invoice">Invoice</TabsTrigger>
                      <TabsTrigger value="ewaybill">E-Waybill</TabsTrigger>
                      <TabsTrigger value="manifest">Manifest</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('downloadDocument', [downloadOrderId, documentType])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute downloadDocument
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
