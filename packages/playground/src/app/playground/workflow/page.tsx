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
import { SAMPLE_B2C_ORDER } from '@/lib/sample-data';
import { AddSingleOrderRequestSchema } from '@agamya/bigship-sdk';
import type { HookEvent } from '@/lib/execute-stream';

type WorkflowState = 'idle' | 'created' | 'manifested' | 'finalized';

const STEPS: { key: WorkflowState; label: string }[] = [
  { key: 'idle', label: 'Idle' },
  { key: 'created', label: 'Created' },
  { key: 'manifested', label: 'Manifested' },
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
  const [courierId, setCourierId] = useState('5');

  const orderShape = useMemo(() => {
    const def = introspect(AddSingleOrderRequestSchema);
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
    const r = await run('addSingleOrder', [formValues]);
    if (r.result) {
      const res = r.result as any;
      const orderId = res?.data ?? res?.orderId ?? res?.order_id;
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

  const handleManifest = async () => {
    const r = await run('manifestSingle', [{ system_order_id: storedOrderId, courier_id: Number(courierId) }]);
    if (r.result) {
      setWorkflowState('manifested');
    } else {
      setErrorState('Failed to manifest shipment.');
    }
  };

  const handleFinalize = async () => {
    const r = await run('getShipmentDetails', [storedOrderId]);
    if (r.result) {
      setWorkflowState('finalized');
    } else {
      setErrorState('Failed to finalize shipment.');
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
          Step through the shipment lifecycle: Create → Manifest → Finalize.
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
                <CardTitle className="text-base">Step 1: Create Order</CardTitle>
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
            Create Order
          </Button>
        </div>
      )}

      {workflowState === 'created' && (
        <div className="space-y-4">
          <RiskBanner level="warning">
            Order created with ID: <code className="font-mono text-sm">{storedOrderId}</code>. Now manifest it with a courier.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Step 2: Manifest Shipment</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>System Order ID</Label>
                  <Input value={storedOrderId} onChange={e => setStoredOrderId(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Courier ID</Label>
                  <Input type="number" value={courierId} onChange={e => setCourierId(e.target.value)} placeholder="5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleManifest} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Manifest
          </Button>
        </div>
      )}

      {workflowState === 'manifested' && (
        <div className="space-y-4">
          <RiskBanner level="warning">
            Shipment manifested. Finalize by fetching shipment details.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Step 3: Finalize Shipment</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>System Order ID</Label>
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
            Shipment has been created, manifested, and finalized successfully.
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
