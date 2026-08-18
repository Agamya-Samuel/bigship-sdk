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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, Package } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export default function ShipmentPage() {
  const { executeMethod, isLoading, results } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [awbOrderId, setAwbOrderId] = useState('');
  const [fileShipmentDataId, setFileShipmentDataId] = useState('2');
  const [fileOrderId, setFileOrderId] = useState('');
  const [dataShipmentDataId, setDataShipmentDataId] = useState('1');
  const [dataOrderId, setDataOrderId] = useState('');

  useEffect(() => {
    if (results.orderIds.length > 0) {
      const latest = results.orderIds[results.orderIds.length - 1];
      if (!awbOrderId) setAwbOrderId(latest);
      if (!fileOrderId) setFileOrderId(latest);
      if (!dataOrderId) setDataOrderId(latest);
    }
  }, [results.orderIds, awbOrderId, fileOrderId, dataOrderId]);

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
          <Package className="h-5 w-5" />
          Shipment
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Get AWB numbers, shipment files, and shipment data for orders.</p>
      </div>

      <Tabs defaultValue="awb">
        <TabsList>
          <TabsTrigger value="awb">getAWB</TabsTrigger>
          <TabsTrigger value="file">getShipmentFile</TabsTrigger>
          <TabsTrigger value="data">getShipmentData</TabsTrigger>
        </TabsList>

        <TabsContent value="awb" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Order ID</Label>
                <Input value={awbOrderId} onChange={e => setAwbOrderId(e.target.value)} placeholder="Enter order ID" />
                {results.orderIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('getAWB', [awbOrderId])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getAWB
          </Button>
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Shipment Data ID</Label>
                  <Select value={fileShipmentDataId} onValueChange={(v) => v && setFileShipmentDataId(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 — Label</SelectItem>
                      <SelectItem value="3">3 — Manifest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Order ID</Label>
                  <Input value={fileOrderId} onChange={e => setFileOrderId(e.target.value)} placeholder="Enter order ID" />
                  {results.orderIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('getShipmentFile', [Number(fileShipmentDataId), fileOrderId])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getShipmentFile
          </Button>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Shipment Data ID</Label>
                  <Select value={dataShipmentDataId} onValueChange={(v) => v && setDataShipmentDataId(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 — AWB</SelectItem>
                      <SelectItem value="2">2 — Label</SelectItem>
                      <SelectItem value="3">3 — Manifest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Order ID</Label>
                  <Input value={dataOrderId} onChange={e => setDataOrderId(e.target.value)} placeholder="Enter order ID" />
                  {results.orderIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('getShipmentData', [Number(dataShipmentDataId), dataOrderId])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getShipmentData
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
