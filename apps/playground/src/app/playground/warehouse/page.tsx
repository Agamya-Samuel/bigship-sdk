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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, Warehouse, Plus } from 'lucide-react';
import { SAMPLE_WAREHOUSE, SAMPLE_WAREHOUSE_LIST } from '@/lib/sample-data';
import type { HookEvent } from '@/lib/execute-stream';

export default function WarehousePage() {
  const { executeMethod, isLoading } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [segmentType, setSegmentType] = useState<'hyperlocal' | 'local'>('hyperlocal');
  const [page, setPage] = useState('1');
  const [perPage, setPerPage] = useState('10');

  const [warehouseContactPerson, setWarehouseContactPerson] = useState('');
  const [warehouseAddressPhone, setWarehouseAddressPhone] = useState('');
  const [warehouseCountry, setWarehouseCountry] = useState('India');
  const [warehouseState, setWarehouseState] = useState('');
  const [warehouseCity, setWarehouseCity] = useState('');
  const [warehousePinCode, setWarehousePinCode] = useState('');
  const [warehouseAddressLine1, setWarehouseAddressLine1] = useState('');
  const [warehouseAddressLine2, setWarehouseAddressLine2] = useState('');
  const [warehouseAddressLandMark, setWarehouseAddressLandMark] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [addressType, setAddressType] = useState<'Home' | 'Office' | 'Shop' | 'Factory' | 'Hotel' | 'Other'>('Home');

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
  };

  const fillSample = () => {
    setWarehouseContactPerson(SAMPLE_WAREHOUSE.warehouseContactPerson);
    setWarehouseAddressPhone(SAMPLE_WAREHOUSE.warehouseAddressPhone);
    setWarehouseCountry(SAMPLE_WAREHOUSE.warehouseCountry);
    setWarehouseState(SAMPLE_WAREHOUSE.warehouseState);
    setWarehouseCity(SAMPLE_WAREHOUSE.warehouseCity);
    setWarehousePinCode(SAMPLE_WAREHOUSE.warehousePinCode);
    setWarehouseAddressLine1(SAMPLE_WAREHOUSE.warehouseAddressLine1);
    setWarehouseAddressLine2(SAMPLE_WAREHOUSE.warehouseAddressLine2 || '');
    setWarehouseAddressLandMark(SAMPLE_WAREHOUSE.warehouseAddressLandMark);
    setLatitude(SAMPLE_WAREHOUSE.latitude || '');
    setLongitude(SAMPLE_WAREHOUSE.longitude || '');
    setAddressType(SAMPLE_WAREHOUSE.address_type || 'Home');
  };

  const handleSaveWarehouse = () => {
    const payload = {
      segment_type: segmentType,
      warehouseContactPerson,
      warehouseAddressPhone,
      warehouseCountry,
      warehouseState,
      warehouseCity,
      warehousePinCode,
      warehouseAddressLine1,
      warehouseAddressLine2: warehouseAddressLine2 || undefined,
      warehouseAddressLandMark,
      latitude: segmentType === 'hyperlocal' ? latitude : undefined,
      longitude: segmentType === 'hyperlocal' ? longitude : undefined,
      address_type: segmentType === 'hyperlocal' ? addressType : undefined,
    };
    run('saveWarehouse', [payload]);
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
          <TabsTrigger value="add">saveWarehouse</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Segment Type</Label>
                  <Select value={segmentType} onValueChange={(v) => setSegmentType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hyperlocal">Hyperlocal</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Page</Label>
                  <Input type="number" value={page} onChange={e => setPage(e.target.value)} placeholder="1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Per Page</Label>
                  <Input type="number" value={perPage} onChange={e => setPerPage(e.target.value)} placeholder="10" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => run('getWarehouseList', [{ page, perPage, segment_type: segmentType }])} disabled={isLoading} className="w-full" size="lg">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Segment Type</Label>
                    <Select value={segmentType} onValueChange={(v) => setSegmentType(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hyperlocal">Hyperlocal</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Contact Person</Label>
                    <Input value={warehouseContactPerson} onChange={e => setWarehouseContactPerson(e.target.value)} placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={warehouseAddressPhone} onChange={e => setWarehouseAddressPhone(e.target.value)} placeholder="9876543210" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Country</Label>
                    <Input value={warehouseCountry} onChange={e => setWarehouseCountry(e.target.value)} placeholder="India" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input value={warehouseState} onChange={e => setWarehouseState(e.target.value)} placeholder="Karnataka" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input value={warehouseCity} onChange={e => setWarehouseCity(e.target.value)} placeholder="Bangalore" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input value={warehousePinCode} onChange={e => setWarehousePinCode(e.target.value)} placeholder="560113" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 1</Label>
                  <Input value={warehouseAddressLine1} onChange={e => setWarehouseAddressLine1(e.target.value)} placeholder="Sector 29" />
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 2</Label>
                  <Input value={warehouseAddressLine2} onChange={e => setWarehouseAddressLine2(e.target.value)} placeholder="Near City Centre" />
                </div>
                <div className="space-y-1.5">
                  <Label>Landmark</Label>
                  <Input value={warehouseAddressLandMark} onChange={e => setWarehouseAddressLandMark(e.target.value)} placeholder="Hudda City Centre" />
                </div>
                {segmentType === 'hyperlocal' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Latitude</Label>
                        <Input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="12.947146" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Longitude</Label>
                        <Input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="77.621029" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Address Type</Label>
                      <Select value={addressType} onValueChange={(v) => setAddressType(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home">Home</SelectItem>
                          <SelectItem value="Office">Office</SelectItem>
                          <SelectItem value="Shop">Shop</SelectItem>
                          <SelectItem value="Factory">Factory</SelectItem>
                          <SelectItem value="Hotel">Hotel</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveWarehouse} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute saveWarehouse
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
