'use client';

import { useState, useMemo } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { RiskBanner } from '@/components/RiskBanner';
import { ZodForm } from '@/components/ZodForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, Wand2 } from 'lucide-react';
import { introspect } from '@/lib/schema-introspect';
import { SAMPLE_B2C_ORDER, SAMPLE_B2B_ORDER } from '@/lib/sample-data';
import { DomesticB2COrderRequestSchema, DomesticB2BOrderRequestSchema } from '@agamya/bigship-sdk';
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

export default function OrdersPage() {
  const { executeMethod, isLoading, addResult } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const b2cShape = useMemo(() => {
    const def = introspect(DomesticB2COrderRequestSchema);
    return def.kind === 'object' ? def.shape : {};
  }, []);

  const b2bShape = useMemo(() => {
    const def = introspect(DomesticB2BOrderRequestSchema);
    return def.kind === 'object' ? def.shape : {};
  }, []);

  const [b2cValues, setB2cValues] = useState<Record<string, unknown>>(() => getDefaultForShape(b2cShape));
  const [b2bValues, setB2bValues] = useState<Record<string, unknown>>(() => getDefaultForShape(b2bShape));

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);

    if (r.result) {
      const res = r.result as any;
      const orderId = res?.data?.CustomGlobalOrderId ?? res?.data ?? res?.system_order_id ?? res?.orderId ?? res?.order_id;
      if (orderId && typeof orderId === 'string') addResult('orderId', orderId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Play className="h-5 w-5" />
          Orders
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create B2C or B2B draft orders on BigShip.</p>
      </div>

      <Tabs defaultValue="b2c">
        <TabsList>
          <TabsTrigger value="b2c">B2C Order</TabsTrigger>
          <TabsTrigger value="b2b">B2B Order</TabsTrigger>
        </TabsList>

        <TabsContent value="b2c" className="space-y-4">
          <RiskBanner level="warning">
            This will create a real draft order on your BigShip account. Proceed with caution.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">B2C Order Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setB2cValues(SAMPLE_B2C_ORDER as unknown as Record<string, unknown>)}>
                  <Wand2 className="h-3.5 w-3.5 mr-1" />
                  Fill Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZodForm shape={b2cShape} values={b2cValues} onChange={setB2cValues} />
            </CardContent>
          </Card>

          <Button onClick={() => run('createOrder', [b2cValues])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute createOrder
          </Button>
        </TabsContent>

        <TabsContent value="b2b" className="space-y-4">
          <RiskBanner level="warning">
            This will create a real draft heavy/B2B order on your BigShip account. Proceed with caution.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">B2B Order Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setB2bValues(SAMPLE_B2B_ORDER as unknown as Record<string, unknown>)}>
                  <Wand2 className="h-3.5 w-3.5 mr-1" />
                  Fill Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZodForm shape={b2bShape} values={b2bValues} onChange={setB2bValues} />
            </CardContent>
          </Card>

          <Button onClick={() => run('createOrder', [b2bValues])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute createOrder
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
