'use client';

import { useState, useMemo } from 'react';
import { z } from 'zod';
import { usePlayground } from '@/components/PlaygroundProvider';
import { ZodForm } from '@/components/ZodForm';
import { CodeSnippet } from '@/components/CodeSnippet';
import { ResponseViewer } from '@/components/ResponseViewer';
import { RiskBanner } from '@/components/RiskBanner';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { introspect, type FieldDef } from '@/lib/schema-introspect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, RotateCcw, Wand2 } from 'lucide-react';

type RiskLevel = 'safe' | 'warning' | 'danger';

interface MethodPanelProps {
  methodName: string;
  description: string;
  schema?: z.ZodTypeAny;
  riskLevel: RiskLevel;
  sampleData?: unknown;
  defaultValues?: Record<string, unknown>;
  onExecute: (params: unknown[]) => Promise<void>;
  children?: React.ReactNode;
}

function getDefaultForShape(shape: Record<string, FieldDef>): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(shape)) {
    switch (field.kind) {
      case 'string': defaults[key] = ''; break;
      case 'number': defaults[key] = 0; break;
      case 'enum': defaults[key] = field.values[0] || ''; break;
      case 'literal': defaults[key] = field.value; break;
      case 'object': defaults[key] = getDefaultForShape(field.shape); break;
      case 'array': defaults[key] = []; break;
      default: defaults[key] = '';
    }
  }
  return defaults;
}

export function MethodPanel({
  methodName,
  description,
  schema,
  riskLevel,
  sampleData,
  defaultValues,
  onExecute,
  children,
}: MethodPanelProps) {
  const { isLoading } = usePlayground();
  const [response, setResponse] = useState<unknown>(null);
  const [responseError, setResponseError] = useState<unknown>(null);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [duration, setDuration] = useState(0);
  const [hooks, setHooks] = useState<unknown[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const shapeMemo = useMemo((): Record<string, FieldDef> | null => {
    if (!schema) return null;
    const def = introspect(schema);
    if (def.kind === 'object') return def.shape;
    return null;
  }, [schema]);

  const shape: Record<string, FieldDef> | null = shapeMemo;

  const [formValues, setFormValues] = useState<Record<string, unknown>>(
    defaultValues || (shape ? getDefaultForShape(shape) : {})
  );

  const handleFillSample = () => {
    if (sampleData) {
      setFormValues(sampleData as Record<string, unknown>);
    }
  };

  const handleReset = () => {
    setFormValues(defaultValues || (shape ? getDefaultForShape(shape) : {}));
    setResponse(null);
    setResponseError(null);
    setCodeSnippet('');
  };

  const execute = async () => {
    setResponse(null);
    setResponseError(null);

    const params = schema ? [formValues] : [];

    try {
      const result = await onExecute(params);
    } catch (err) {
      setResponseError(err);
    }
  };

  const handleExecute = () => {
    if (riskLevel === 'danger') {
      setShowConfirm(true);
    } else {
      execute();
    }
  };

  const formSection: React.ReactNode = shape !== null ? (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Parameters</CardTitle>
          <div className="flex gap-2">
            {sampleData ? (
              <Button type="button" variant="outline" size="sm" onClick={handleFillSample}>
                <Wand2 className="h-3.5 w-3.5 mr-1" />
                Fill Sample
              </Button>
            ) : null}
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ZodForm
          shape={shape}
          values={formValues}
          onChange={setFormValues}
        />
      </CardContent>
    </Card>
  ) : null;

  const riskBanner: React.ReactNode = riskLevel !== 'safe' ? (
    <RiskBanner level={riskLevel}>
      {riskLevel === 'warning'
        ? 'This operation will create or modify data on your BigShip account.'
        : 'This operation will cancel or permanently modify data on your BigShip account. Please confirm before proceeding.'}
    </RiskBanner>
  ) : null;

  const responseSection: React.ReactNode = (response !== null && response !== undefined) || (responseError !== null && responseError !== undefined) ? (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm">
        <Badge variant={response ? 'default' : 'destructive'}>
          {response ? 'Success' : 'Error'}
        </Badge>
        {duration > 0 && (
          <span className="text-muted-foreground">{duration}ms</span>
        )}
      </div>

      {response !== null && response !== undefined ? <ResponseViewer data={response as any} success label="Result" /> : null}
      {responseError !== null && responseError !== undefined ? <ResponseViewer data={responseError as any} success={false} label="Error" /> : null}
      {codeSnippet ? <CodeSnippet code={codeSnippet} /> : null}
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold font-mono">{methodName}</h2>
          <Badge variant={riskLevel === 'safe' ? 'default' : riskLevel === 'warning' ? 'secondary' : 'destructive'}>
            {riskLevel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Risk banner */}
      {riskBanner}

      {/* Form */}
      {formSection}

      {/* Custom children (for methods without schemas, like getWalletBalance) */}
      {children}

      {/* Execute button */}
      <Button onClick={handleExecute} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Execute {methodName}
          </>
        )}
      </Button>

      {/* Response */}
      {responseSection}

      {/* Confirmation dialog for danger operations */}
      <ConfirmationDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Execute ${methodName}?`}
        description="This is a destructive operation that will modify real data on your BigShip account. Are you sure you want to proceed?"
        confirmLabel="Execute"
        variant="destructive"
        onConfirm={execute}
      />
    </div>
  );
}
