'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wrench, Upload, CheckCircle2, XCircle, Calculator } from 'lucide-react';

export default function UtilsPage() {
  const [base64Result, setBase64Result] = useState<string | null>(null);
  const [base64FileName, setBase64FileName] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [validationInput, setValidationInput] = useState('');
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  const [paymentType, setPaymentType] = useState('Prepaid');
  const [codAmount, setCodAmount] = useState('0');
  const [collectableResult, setCollectableResult] = useState<number | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBase64FileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setBase64Result(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleValidate = useCallback(() => {
    if (!validationInput) {
      setValidationResult(null);
      return;
    }
    const isValid = /^data:[a-z]+\/[a-z+\-.]+;base64,[A-Za-z0-9+/]+=*$/.test(validationInput);
    setValidationResult(isValid);
  }, [validationInput]);

  const calculateCollectable = useCallback(() => {
    const amount = Number(codAmount) || 0;
    switch (paymentType) {
      case 'Prepaid':
        setCollectableResult(0);
        break;
      case 'COD':
        setCollectableResult(Math.max(0, amount));
        break;
      case 'ToPay':
        setCollectableResult(Math.max(0, amount));
        break;
      default:
        setCollectableResult(0);
    }
  }, [paymentType, codAmount]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Utilities
        </h2>
        <p className="text-sm text-muted-foreground mt-1">SDK helper functions for common operations.</p>
      </div>

      <Tabs defaultValue="fileToBase64">
        <TabsList>
          <TabsTrigger value="fileToBase64">fileToBase64DataURI</TabsTrigger>
          <TabsTrigger value="isValidBase64">isValidBase64DataURI</TabsTrigger>
          <TabsTrigger value="collectable">calculateCollectableAmount</TabsTrigger>
        </TabsList>

        <TabsContent value="fileToBase64" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Convert File to Base64 Data URI</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Select File</Label>
                  <Input
                    ref={fileRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                  />
                  {base64FileName && (
                    <p className="text-xs text-muted-foreground">Selected: {base64FileName}</p>
                  )}
                </div>

                {base64Result && (
                  <div className="space-y-1.5">
                    <Label>Result</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-xs font-mono break-all line-clamp-3">{base64Result}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Size: {Math.round((base64Result.length * 3) / 4 / 1024)} KB (approx)</span>
                      <span>|</span>
                      <span>MIME: {base64Result.match(/data:([^;]+)/)?.[1] || 'unknown'}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(base64Result)}
                    >
                      Copy to Clipboard
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="isValidBase64" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Validate Base64 Data URI</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Data URI String</Label>
                  <Input
                    value={validationInput}
                    onChange={e => { setValidationInput(e.target.value); setValidationResult(null); }}
                    placeholder="data:image/png;base64,iVBOR..."
                  />
                </div>

                <Button onClick={handleValidate} variant="outline" size="sm">
                  Validate
                </Button>

                {validationResult !== null && (
                  <div className="flex items-center gap-2 pt-2">
                    {validationResult ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" variant="secondary">
                          Valid Base64 Data URI
                        </Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" variant="secondary">
                          Invalid Base64 Data URI
                        </Badge>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collectable" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Calculate Collectable Amount</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Payment Type</Label>
                  <Select value={paymentType} onValueChange={(v) => v && setPaymentType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prepaid">Prepaid</SelectItem>
                      <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                      <SelectItem value="ToPay">ToPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>COD Amount</Label>
                  <Input
                    type="number"
                    value={codAmount}
                    onChange={e => setCodAmount(e.target.value)}
                    placeholder="0"
                    min={0}
                    step="any"
                  />
                </div>

                <Button onClick={calculateCollectable} variant="outline" size="sm">
                  <Calculator className="h-3.5 w-3.5 mr-1.5" />
                  Calculate
                </Button>

                {collectableResult !== null && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      Collectable Amount: <span className="font-mono">{collectableResult}</span>
                    </p>
                    {paymentType === 'Prepaid' && (
                      <p className="text-xs text-muted-foreground mt-1">Prepaid orders have 0 collectable amount.</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
