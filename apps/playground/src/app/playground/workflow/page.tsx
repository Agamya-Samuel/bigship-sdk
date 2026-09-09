'use client';

import { useState, useMemo } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { RiskBanner } from '@/components/RiskBanner';
import { ZodForm } from '@/components/ZodForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, GitBranch, CheckCircle2, Circle, ArrowRight, AlertCircle, Wand2 } from 'lucide-react';
import { introspect } from '@/lib/schema-introspect';
import { SAMPLE_B2C_ORDER, SAMPLE_SERVICEABLE_COURIERS, SAMPLE_PLACE_ORDER } from '@/lib/sample-data';
import { DomesticB2COrderRequestSchema } from '@agamya/bigship-sdk';
import type { HookEvent } from '@/lib/execute-stream';

type WorkflowState = 'idle' | 'created' | 'placed' | 'finalized';

const STEPS: { key: WorkflowState; label: string }[] = [
  { key: 'idle', label: 'Idle' },
  { key: 'created', label: 'Created' },
  { key: 'placed', label: 'Placed' },
  { key: 'finalized', label: 'Finalized' },
];

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

export default function WorkflowPage() {
  const { executeMethod, isLoading } = usePlayground();
  const [workflowState, setWorkflowState] = useState<WorkflowState>('idle');
  const [errorState, setErrorState] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);
  const [storedOrderId, setStoredOrderId] = useState('');

  const orderShape = useMemo(() => {
    const def = introspect(DomesticB2COrderRequestSchema);
    return def.kind === 'object' ? def.shape : {};
  }, []);

  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => getDefaultForShape(orderShape));

  const stateIndex = STEPS.findIndex(s => s.key === workflowState);

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null); setErrorState(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
    return r;
  };

  const handleCreateOrder = async () => {
    const r = await run('createOrder', [formValues]);
    if (r.result) {
      const res = r.result as any;
      const orderId = res?.data?.CustomGlobalOrderId ?? res?.data ?? res?.orderId;
      if (orderId && typeof orderId === 'string') {
        setStoredOrderId(orderId);
        setWorkflowState('created');
      } else {
        setErrorState('Order created but no order ID returned.');
      }
    } else {
      setErrorState('Failed to create order.');
    }
  };

  const handleGetCouriers = async () => {
    const r = await run('getServiceableCouriers', [storedOrderId]);
    if (r.result) {
      setWorkflowState('placed');
    } else {
      setErrorState('Failed to get serviceable couriers.');
    }
  };

  const handlePlaceOrder = async () => {
    const r = await run('placeOrder', [{ MasterCustomOrderId: storedOrderId, courierId: 1, riskTypeId: '2' }]);
    if (r.result) {
      setWorkflowState('placed');
    } else {
      setErrorState('Failed to place order.');
    }
  };

  const handleFinalize = async () => {
    const r = await run('getOrderDetail', [storedOrderId]);
    if (r.result) {
      setWorkflowState('finalized');
    } else {
      setErrorState('Failed to get order details.');
    }
  };

  const handleReset = () => {
    setWorkflowState('idle');
    setErrorState(null);
    setStoredOrderId('');
    setResponse(null);
    setError(null);
    setCodeSnippet('');
    setDuration(0);
    setHooks([]);
    setFormValues(getDefaultForShape(orderShape));
  };

  const getStepVariant = (index: number) => {
    if (index < stateIndex) return 'default';
    if (index === stateIndex) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Workflow
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Step through the shipment lifecycle: Create → Place → Finalize.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <Badge
              variant={getStepVariant(i)}
              className={
                i < stateIndex
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : i === stateIndex
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : ''
              }
            >
              {i < stateIndex ? (
                <CheckCircle2 className="h-3 w-3 mr-1" />
              ) : i === stateIndex ? (
                <Circle className="h-3 w-3 mr-1 fill-current" />
              ) : (
                <Circle className="h-3 w-3 mr-1" />
              )}
              {step.label}
            </Badge>
            {i < STEPS.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {errorState && (
        <RiskBanner level="danger" title="Workflow Error">
          {errorState}
        </RiskBanner>
      )}

      {workflowState === 'idle' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Step 1: Create Draft Order</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setFormValues(SAMPLE_B2C_ORDER as unknown as Record<string, unknown>)}>
                  <Wand2 className="h-3.5 w-3.5 mr-1" />
                  Fill Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ZodForm shape={orderShape} values={formValues} onChange={setFormValues} />
            </CardContent>
          </Card>

          <Button onClick={handleCreateOrder} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Create Draft Order
          </Button>
        </div>
      )}

      {workflowState === 'created' && (
        <div className="space-y-4">
          <RiskBanner level="warning">
            Draft order created with ID: <code className="font-mono text-sm">{storedOrderId}</code>. Now place it with a courier.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Step 2: Place Order</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Custom Global Order ID</Label>
                <Input value={storedOrderId} onChange={e => setStoredOrderId(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handlePlaceOrder} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Place Order
          </Button>
        </div>
      )}

      {workflowState === 'placed' && (
        <div className="space-y-4">
          <RiskBanner level="warning">
            Order placed. Finalize by fetching order details.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Step 3: Finalize</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Custom Global Order ID</Label>
                <Input value={storedOrderId} onChange={e => setStoredOrderId(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleFinalize} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Finalize
          </Button>
        </div>
      )}

      {workflowState === 'finalized' && (
        <div className="space-y-4">
          <RiskBanner level="safe" title="Workflow Complete">
            Order has been created, placed, and finalized successfully.
          </RiskBanner>

          <Button onClick={handleReset} variant="outline" className="w-full" size="lg">
            Start New Workflow
          </Button>
        </div>
      )}

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
