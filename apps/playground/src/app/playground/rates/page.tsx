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
import { SAMPLE_RATE_CALC } from '@/lib/sample-data';
import type { HookEvent } from '@/lib/execute-stream';

export default function RatesPage() {
  const { executeMethod, isLoading, results } = usePlayground();
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<HookEvent[]>([]);

  const [shipmentCategory, setShipmentCategory] = useState(SAMPLE_RATE_CALC.shipment_category);
  const [paymentType, setPaymentType] = useState(SAMPLE_RATE_CALC.payment_type);
  const [pickupPincode, setPickupPincode] = useState(SAMPLE_RATE_CALC.pickup_pincode);
  const [destinationPincode, setDestinationPincode] = useState(SAMPLE_RATE_CALC.destination_pincode);
  const [invoiceAmount, setInvoiceAmount] = useState(String(SAMPLE_RATE_CALC.shipment_invoice_amount));
  const [weight, setWeight] = useState(String(SAMPLE_RATE_CALC.box_details[0].each_box_dead_weight));
  const [length, setLength] = useState(String(SAMPLE_RATE_CALC.box_details[0].each_box_length));
  const [width, setWidth] = useState(String(SAMPLE_RATE_CALC.box_details[0].each_box_width));
  const [height, setHeight] = useState(String(SAMPLE_RATE_CALC.box_details[0].each_box_height));
  const [boxCount, setBoxCount] = useState(String(SAMPLE_RATE_CALC.box_details[0].box_count));

  const [shippingOrderId, setShippingOrderId] = useState('');
  const [shippingCategory, setShippingCategory] = useState('b2c');
  const [riskType, setRiskType] = useState('safe');

  useEffect(() => {
    if (results.orderIds.length > 0 && !shippingOrderId) {
      setShippingOrderId(results.orderIds[results.orderIds.length - 1]);
    }
  }, [results.orderIds, shippingOrderId]);

  const run = async (method: string, params: unknown[]) => {
    setResponse(null); setError(null);
    const r = await executeMethod(method, params);
    setResponse(r.result); setError(r.error);
    setCodeSnippet(r.codeSnippet); setDuration(r.duration); setHooks(r.hooks);
  };

  const handleCalculateRate = () => {
    const payload = {
      shipment_category: shipmentCategory,
      payment_type: paymentType,
      pickup_pincode: pickupPincode,
      destination_pincode: destinationPincode,
      shipment_invoice_amount: Number(invoiceAmount),
      box_details: [{
        each_box_dead_weight: Number(weight),
        each_box_length: Number(length),
        each_box_width: Number(width),
        each_box_height: Number(height),
        box_count: Number(boxCount),
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
          <TabsTrigger value="shipping">getShippingRates</TabsTrigger>
        </TabsList>

        <TabsContent value="calculate" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Rate Calculator</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  setShipmentCategory(SAMPLE_RATE_CALC.shipment_category);
                  setPaymentType(SAMPLE_RATE_CALC.payment_type);
                  setPickupPincode(SAMPLE_RATE_CALC.pickup_pincode);
                  setDestinationPincode(SAMPLE_RATE_CALC.destination_pincode);
                  setInvoiceAmount(String(SAMPLE_RATE_CALC.shipment_invoice_amount));
                  setWeight(String(SAMPLE_RATE_CALC.box_details[0].each_box_dead_weight));
                  setLength(String(SAMPLE_RATE_CALC.box_details[0].each_box_length));
                  setWidth(String(SAMPLE_RATE_CALC.box_details[0].each_box_width));
                  setHeight(String(SAMPLE_RATE_CALC.box_details[0].each_box_height));
                  setBoxCount(String(SAMPLE_RATE_CALC.box_details[0].box_count));
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
                    <Label>Shipment Category</Label>
                    <Select value={shipmentCategory} onValueChange={(v) => v && setShipmentCategory(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B2C">B2C</SelectItem>
                        <SelectItem value="B2B">B2B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment Type</Label>
                    <Select value={paymentType} onValueChange={(v) => v && setPaymentType(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prepaid">Prepaid</SelectItem>
                        <SelectItem value="COD">COD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Pickup Pincode</Label>
                    <Input value={pickupPincode} onChange={e => setPickupPincode(e.target.value)} placeholder="110001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Destination Pincode</Label>
                    <Input value={destinationPincode} onChange={e => setDestinationPincode(e.target.value)} placeholder="400001" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Shipment Invoice Amount</Label>
                  <Input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="2500" />
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <p className="text-sm font-medium">Box Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Weight (kg)</Label>
                      <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.5" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Box Count</Label>
                      <Input type="number" value={boxCount} onChange={e => setBoxCount(e.target.value)} placeholder="1" />
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

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Parameters</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Order ID</Label>
                  <Input value={shippingOrderId} onChange={e => setShippingOrderId(e.target.value)} placeholder="Enter order ID" />
                  {results.orderIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">Auto-filled from last created order</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={shippingCategory} onValueChange={(v) => v && setShippingCategory(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="b2c">B2C</SelectItem>
                        <SelectItem value="b2b">B2B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Risk Type</Label>
                    <Select value={riskType} onValueChange={(v) => v && setRiskType(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safe">Safe</SelectItem>
                        <SelectItem value="risky">Risky</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => run('getShippingRates', [shippingOrderId, shippingCategory, riskType])} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Execute getShippingRates
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
