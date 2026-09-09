'use client';

import { useState } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export default function ReferenceDataPage() {
  const { executeMethod, isLoading } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [segmentType, setSegmentType] = useState<'hyperlocal' | 'domestic_b2c' | 'domestic_b2b'>('domestic_b2c');

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Reference Data</h2>
        <p className="text-sm text-muted-foreground mt-1">Get package types, payment modes, and risk types.</p>
      </div>

      <Tabs defaultValue="packageTypes">
        <TabsList>
          <TabsTrigger value="packageTypes">getPackageTypes</TabsTrigger>
          <TabsTrigger value="paymentModes">getPaymentModes</TabsTrigger>
          <TabsTrigger value="riskTypes">getRiskTypes</TabsTrigger>
        </TabsList>

        <TabsContent value="packageTypes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Package Types</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Get available package types for hyperlocal shipments.</p>
            </CardContent>
          </Card>
          <Button onClick={() => run('getPackageTypes', [])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getPackageTypes
          </Button>
        </TabsContent>

        <TabsContent value="paymentModes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Segment Type</Label>
                <Select value={segmentType} onValueChange={(v) => setSegmentType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hyperlocal">Hyperlocal</SelectItem>
                    <SelectItem value="domestic_b2c">B2C</SelectItem>
                    <SelectItem value="domestic_b2b">B2B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => run('getPaymentModes', [segmentType])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getPaymentModes
          </Button>
        </TabsContent>

        <TabsContent value="riskTypes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Risk Types</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Get available risk types (insurance options) for shipments.</p>
            </CardContent>
          </Card>
          <Button onClick={() => run('getRiskTypes', [])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getRiskTypes
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
