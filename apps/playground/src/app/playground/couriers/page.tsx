'use client';

import { useState } from 'react';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ResponseViewer } from '@/components/ResponseViewer';
import { CodeSnippet } from '@/components/CodeSnippet';
import { HooksLog } from '@/components/HooksLog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play } from 'lucide-react';
import type { HookEvent } from '@/lib/execute-stream';

export default function CouriersPage() {
  const { executeMethod, isLoading } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [category, setCategory] = useState('b2c');
  const [courierId, setCourierId] = useState('5');

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Couriers</h2>
        <p className="text-sm text-muted-foreground mt-1">List available couriers and their transporters.</p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">getCourierList</TabsTrigger>
          <TabsTrigger value="transporters">getCourierTransporterList</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Shipment Category</Label>
                <Select value={category} onValueChange={(v) => v && setCategory(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="b2c">B2C</SelectItem>
                    <SelectItem value="b2b">B2B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => run('getCourierList', [category])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getCourierList
          </Button>
        </TabsContent>

        <TabsContent value="transporters" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Courier ID</Label>
                <Input type="number" value={courierId} onChange={e => setCourierId(e.target.value)} placeholder="5" />
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => run('getCourierTransporterList', [Number(courierId)])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getCourierTransporterList
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
