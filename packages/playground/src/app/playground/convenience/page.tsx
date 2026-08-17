'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { RiskBanner } from '@/components/RiskBanner';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { ZodForm } from '@/components/ZodForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, Zap, Wand2 } from 'lucide-react';
import { introspect } from '@/lib/schema-introspect';
import { SAMPLE_B2C_ORDER } from '@/lib/sample-data';
import { AddSingleOrderRequestSchema } from '@agamya/bigship-sdk';
import type { HookEvent } from '@/lib/execute-stream';

function getDefaultForShape(shape: Record<string, any>): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(shape)) {
    switch ((field as any).kind) {
      case 'string': defaults[key] = ''; break;
      case 'number': defaults[key] = 0; break;
      case 'enum': defaults[key] = (field as any).values[0] || ''; break;
      case 'literal': defaults[key] = (field as any).value; break;
      case 'object': defaults[key] = getDefaultForShape((field as any).shape); break;
      case 'array': defaults[key] = []; break;
      default: defaults[key] = '';
    }
  }
  return defaults;
}

export default function ConveniencePage() {
  const { executeMethod, isLoading, results, addResult } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [manifestOrderId, setManifestOrderId] = useState('');
  const [manifestCourierId, setManifestCourierId] = useState('5');
  const [detailsOrderId, setDetailsOrderId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const orderShape = useMemo(() => {
    const def = introspect(AddSingleOrderRequestSchema);
    return def.kind === 'object' ? def.shape : {};
  }, []);

  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => getDefaultForShape(orderShape));
  const [finalizeCourierId, setFinalizeCourierId] = useState('5');

  useEffect(() => {
    if (results.orderIds.length > 0) {
      const latest = results.orderIds[results.orderIds.length - 1];
      if (!manifestOrderId) setManifestOrderId(latest);
      if (!detailsOrderId) setDetailsOrderId(latest);
    }
  }, [results.orderIds, manifestOrderId, detailsOrderId]);

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);

    if (r.result) {
      const res = r.result as Record<string, unknown>;
      const orderId = (res.data ?? res.system_order_id ?? res.orderId ?? res.order_id) as string | undefined;
      if (orderId) addResult('orderId', orderId);
      const awb = (res.awb ?? res.awb_number ?? res.master_awb) as string | undefined;
      if (awb) addResult('awb', awb);
    }
  };

  const handleCreateAndFinalize = () => {
    setConfirmOpen(false);
    run('createAndFinalizeShipment', [{ order: formValues, courierId: Number(finalizeCourierId) }]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Convenience Methods
        </h2>
        <p className="text-sm text-muted-foreground mt-1">High-level methods that combine multiple SDK operations.</p>
      </div>

      <Tabs defaultValue="manifestAndGetAWB">
        <TabsList>
          <TabsTrigger value="manifestAndGetAWB">manifestAndGetAWB</TabsTrigger>
          <TabsTrigger value="getShipmentDetails">getShipmentDetails</TabsTrigger>
          <TabsTrigger value="createAndFinalizeShipment">createAndFinalizeShipment</TabsTrigger>
        </TabsList>

        <TabsContent value="manifestAndGetAWB" className="space-y-4">
          <RiskBanner level="warning">
            This will manifest the shipment and generate an AWB number on the courier side.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Order ID</Label>
                  <Input value={manifestOrderId} onChange={e => setManifestOrderId(e.target.value)} placeholder="Enter order ID" />
                  {results.orderIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Courier ID</Label>
                  <Input type="number" value={manifestCourierId} onChange={e => setManifestCourierId(e.target.value)} placeholder="5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('manifestAndGetAWB', [manifestOrderId, Number(manifestCourierId)])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute manifestAndGetAWB
          </Button>
        </TabsContent>

        <TabsContent value="getShipmentDetails" className="space-y-4">
          <RiskBanner level="safe">
            This is a read-only operation and will not modify any data.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Order ID</Label>
                <Input value={detailsOrderId} onChange={e => setDetailsOrderId(e.target.value)} placeholder="Enter order ID" />
                {results.orderIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('getShipmentDetails', [detailsOrderId])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getShipmentDetails
          </Button>
        </TabsContent>

        <TabsContent value="createAndFinalizeShipment" className="space-y-4">
          <RiskBanner level="danger">
            This will create a real order AND finalize it in a single call. This is a destructive operation.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Order Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setFormValues(SAMPLE_B2C_ORDER as unknown as Record<string, unknown>)}>
                  <Wand2 className="h-3.5 w-3.5 mr-1" />
                  Fill Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ZodForm shape={orderShape} values={formValues} onChange={setFormValues} />
                <div className="space-y-1.5">
                  <Label>Courier ID</Label>
                  <Input type="number" value={finalizeCourierId} onChange={e => setFinalizeCourierId(e.target.value)} placeholder="5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setConfirmOpen(true)} disabled={isLoading} variant="destructive" className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute createAndFinalizeShipment
          </Button>

          <ConfirmationDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Create and Finalize Shipment?"
            description="This will create a real order and finalize it immediately. This action cannot be undone."
            confirmLabel="Yes, Create & Finalize"
            onConfirm={handleCreateAndFinalize}
            variant="destructive"
          />
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
