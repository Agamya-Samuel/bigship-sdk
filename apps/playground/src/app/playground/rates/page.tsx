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
import { Loader2, Play, IndianRupee, Plus } from 'lucide-react';
import { SAMPLE_RATE_CALC_B2C } from '@/lib/sample-data';
import type { HookEvent } from '@/lib/execute-stream';

export default function RatesPage() {
  const { executeMethod, isLoading, results } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [segmentType, setSegmentType] = useState(SAMPLE_RATE_CALC_B2C.segment_type);
  const [paymentModeId, setPaymentModeId] = useState(String(SAMPLE_RATE_CALC_B2C.paymentModeId));
  const [sourcePincode, setSourcePincode] = useState(SAMPLE_RATE_CALC_B2C.sourcePincode);
  const [destPincode, setDestPincode] = useState(SAMPLE_RATE_CALC_B2C.destPincode);
  const [invoiceValue, setInvoiceValue] = useState(String(SAMPLE_RATE_CALC_B2C.invoiceValue));
  const [riskTypeId, setRiskTypeId] = useState(String(SAMPLE_RATE_CALC_B2C.riskTypeId));
  const [weight, setWeight] = useState(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_dead_weight));
  const [length, setLength] = useState(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_length));
  const [width, setWidth] = useState(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_width));
  const [height, setHeight] = useState(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_height));
  const [noOfBox, setNoOfBox] = useState(String(SAMPLE_RATE_CALC_B2C.boxes[0].no_of_box));

  const [serviceableOrderId, setServiceableOrderId] = useState('');

  useEffect(() => {
    if (results.orderIds.length > 0 && !serviceableOrderId) {
      setServiceableOrderId(results.orderIds[results.orderIds.length - 1]);
    }
  }, [results.orderIds, serviceableOrderId]);

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
  };

  const handleCalculateRate = () => {
    const payload = {
      segment_type: segmentType,
      sourcePincode: sourcePincode,
      destPincode: destPincode,
      invoiceValue: Number(invoiceValue),
      paymentModeId: Number(paymentModeId),
      riskTypeId: Number(riskTypeId),
      boxes: [{
        box_dead_weight: Number(weight),
        box_length: Number(length),
        box_width: Number(width),
        box_height: Number(height),
        no_of_box: Number(noOfBox),
      }],
    };
    run('calculateRate', [payload]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <IndianRupee className="h-5 w-5" />
          Rates
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Calculate shipping rates or get rates for an existing order.</p>
      </div>

      <Tabs defaultValue="calculate">
        <TabsList>
          <TabsTrigger value="calculate">calculateRate</TabsTrigger>
          <TabsTrigger value="serviceable">getServiceableCouriers</TabsTrigger>
        </TabsList>

        <TabsContent value="calculate" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Rate Calculator</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  setSegmentType(SAMPLE_RATE_CALC_B2C.segment_type);
                  setPaymentModeId(String(SAMPLE_RATE_CALC_B2C.paymentModeId));
                  setSourcePincode(SAMPLE_RATE_CALC_B2C.sourcePincode);
                  setDestPincode(SAMPLE_RATE_CALC_B2C.destPincode);
                  setInvoiceValue(String(SAMPLE_RATE_CALC_B2C.invoiceValue));
                  setRiskTypeId(String(SAMPLE_RATE_CALC_B2C.riskTypeId));
                  setWeight(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_dead_weight));
                  setLength(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_length));
                  setWidth(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_width));
                  setHeight(String(SAMPLE_RATE_CALC_B2C.boxes[0].box_height));
                  setNoOfBox(String(SAMPLE_RATE_CALC_B2C.boxes[0].no_of_box));
                }}>
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
                    <Select value={segmentType} onValueChange={(v) => v && setSegmentType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domestic_b2c">B2C</SelectItem>
                        <SelectItem value="domestic_b2b">B2B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Mode</Label>
                    <Select value={paymentModeId} onValueChange={(v) => v && setPaymentModeId(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Prepaid</SelectItem>
                        <SelectItem value="2">COD</SelectItem>
                        <SelectItem value="3">ToPay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Risk Type</Label>
                    <Select value={riskTypeId} onValueChange={(v) => v && setRiskTypeId(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Third Party Insurance</SelectItem>
                        <SelectItem value="2">Owner Risk</SelectItem>
                        <SelectItem value="3">Carrier Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Invoice Value</Label>
                    <Input type="number" value={invoiceValue} onChange={e => setInvoiceValue(e.target.value)} placeholder="1000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Source Pincode</Label>
                    <Input value={sourcePincode} onChange={e => setSourcePincode(e.target.value)} placeholder="110001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Destination Pincode</Label>
                    <Input value={destPincode} onChange={e => setDestPincode(e.target.value)} placeholder="400001" />
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <p className="text-sm font-medium">Box Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Weight (kg)</Label>
                      <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="1" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>No. of Boxes</Label>
                      <Input type="number" value={noOfBox} onChange={e => setNoOfBox(e.target.value)} placeholder="1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label>Length (cm)</Label>
                      <Input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="20" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Width (cm)</Label>
                      <Input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="15" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Height (cm)</Label>
                      <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="10" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleCalculateRate} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute calculateRate
          </Button>
        </TabsContent>

        <TabsContent value="serviceable" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                <Label>Custom Global Order ID</Label>
                <Input value={serviceableOrderId} onChange={e => setServiceableOrderId(e.target.value)} placeholder="Enter order ID" />
                {results.orderIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('getServiceableCouriers', [serviceableOrderId])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getServiceableCouriers
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
