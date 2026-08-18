'use client';

import { useState } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { RiskBanner } from '@/components/RiskBanner';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, XCircle, Plus, X } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export default function CancelPage() {
  const { executeMethod, isLoading, results } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [awbInput, setAwbInput] = useState('');
  const [awbList, setAwbList] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const addAwb = () => {
    const trimmed = awbInput.trim();
    if (trimmed && !awbList.includes(trimmed)) {
      setAwbList([...awbList, trimmed]);
      setAwbInput('');
    }
  };

  const removeAwb = (awb: string) => {
    setAwbList(awbList.filter(a => a !== awb));
  };

  const prefillFromResults = () => {
    const newAwbs = results.awbNumbers.filter(a => !awbList.includes(a));
    setAwbList([...awbList, ...newAwbs]);
  };

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
          <XCircle className="h-5 w-5" />
          Cancel Shipments
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Cancel one or more shipments by AWB number.</p>
      </div>

      <RiskBanner level="danger">
        This action will cancel real shipments and cannot be undone. Double-check your AWB numbers before proceeding.
      </RiskBanner>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">AWB Numbers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={awbInput}
                onChange={e => setAwbInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAwb(); } }}
                placeholder="Enter AWB number"
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={addAwb} disabled={!awbInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {results.awbNumbers.length > 0 && (
              <Button variant="outline" size="sm" onClick={prefillFromResults}>
                Prefill from results ({results.awbNumbers.length} available)
              </Button>
            )}

            {awbList.length > 0 && (
              <div className="space-y-2">
                <Label>{awbList.length} AWB{awbList.length !== 1 ? 's' : ''} queued</Label>
                <div className="flex flex-wrap gap-2">
                  {awbList.map(awb => (
                    <Badge key={awb} variant="secondary" className="gap-1 pr-1">
                      {awb}
                      <button onClick={() => removeAwb(awb)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => setConfirmOpen(true)}
        disabled={isLoading || awbList.length === 0}
        variant="destructive"
        className="w-full"
        size="lg"
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
        Cancel {awbList.length} Shipment{awbList.length !== 1 ? 's' : ''}
      </Button>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Cancel Shipments"
        description={`You are about to cancel ${awbList.length} shipment${awbList.length !== 1 ? 's' : ''}: ${awbList.join(', ')}. This action cannot be undone.`}
        confirmLabel="Cancel Shipments"
        variant="destructive"
        onConfirm={() => run('cancelShipments', [awbList])}
      />

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
