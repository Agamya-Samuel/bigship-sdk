'use client';

import { useState } from 'react';
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
import { Loader2, Play, Warehouse, Plus } from 'lucide-react';
import { SAMPLE_WAREHOUSE } from '@/lib/sample-data';
import type { HookEvent } from '@/lib/execute-stream';

export default function WarehousePage() {
  const { executeMethod, isLoading } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [pageIndex, setPageIndex] = useState('1');
  const [pageSize, setPageSize] = useState('10');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressLandmark, setAddressLandmark] = useState('');
  const [addressPincode, setAddressPincode] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
  };

  const fillSample = () => {
    setAddressLine1(SAMPLE_WAREHOUSE.address_line1);
    setAddressLine2(SAMPLE_WAREHOUSE.address_line2 ?? '');
    setAddressLandmark(SAMPLE_WAREHOUSE.address_landmark ?? '');
    setAddressPincode(SAMPLE_WAREHOUSE.address_pincode);
    setContactNumber(SAMPLE_WAREHOUSE.contact_number_primary);
  };

  const handleAddWarehouse = () => {
    const payload = {
      address_line1: addressLine1,
      address_line2: addressLine2,
      address_landmark: addressLandmark,
      address_pincode: addressPincode,
      contact_number_primary: contactNumber,
    };
    run('addWarehouse', [payload]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Warehouse
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage warehouses — list or add new warehouse addresses.</p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">getWarehouseList</TabsTrigger>
          <TabsTrigger value="add">addWarehouse</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Page Index</Label>
                  <Input type="number" value={pageIndex} onChange={e => setPageIndex(e.target.value)} placeholder="1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Page Size</Label>
                  <Input type="number" value={pageSize} onChange={e => setPageSize(e.target.value)} placeholder="10" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => run('getWarehouseList', [Number(pageIndex), Number(pageSize)])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getWarehouseList
          </Button>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <RiskBanner level="warning">
            This will create a real warehouse on your BigShip account. Proceed with caution.
          </RiskBanner>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Warehouse Details</CardTitle>
                <Button variant="outline" size="sm" onClick={fillSample}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Fill Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Address Line 1</Label>
                  <Input value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="42 Industrial Area Phase 2" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 2</Label>
                  <Input value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Near Metro Station" />
                </div>
                <div className="space-y-1.5">
                  <Label>Landmark</Label>
                  <Input value={addressLandmark} onChange={e => setAddressLandmark(e.target.value)} placeholder="Behind SBI Branch" />
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input value={addressPincode} onChange={e => setAddressPincode(e.target.value)} placeholder="110020" />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Number</Label>
                  <Input value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="9876543210" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleAddWarehouse} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute addWarehouse
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
