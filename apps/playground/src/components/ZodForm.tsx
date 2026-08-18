'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { deriveInputType, deriveLabel, getFieldConstraints, type FieldDef } from '@/lib/schema-introspect';
import { ArrayField } from './ArrayField';
import { FileUploadField } from './FileUploadField';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ZodFormProps {
  shape: Record<string, FieldDef>;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  parentPath?: string;
}

export function ZodForm({ shape, values, onChange, parentPath = '' }: ZodFormProps) {
  const updateField = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-4">
      {Object.entries(shape).map(([key, field]) => (
        <FieldRenderer
          key={key}
          fieldKey={key}
          field={field}
          value={values[key]}
          onChange={(v) => updateField(key, v)}
          path={`${parentPath}${key}`}
        />
      ))}
    </div>
  );
}

interface FieldRendererProps {
  fieldKey: string;
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  path: string;
}

function FieldRenderer({ fieldKey, field, value, onChange, path }: FieldRendererProps) {
  const [objectOpen, setObjectOpen] = useState(true);
  const label = deriveLabel(fieldKey);
  const inputType = deriveInputType(field, fieldKey);
  const constraints = getFieldConstraints(field);
  const isRequired = !field.optional;

  // Hidden / literal fields
  if (field.kind === 'literal') {
    return <input type="hidden" name={path} value={field.value} />;
  }

  // Object fields — collapsible section
  if (field.kind === 'object') {
    return (
      <Collapsible open={objectOpen} onOpenChange={setObjectOpen}>
        <div className="rounded-lg border">
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-muted/50">
            {objectOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="text-sm font-medium">{label}</span>
            {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-1">
              <ZodForm
                shape={field.shape}
                values={(value as Record<string, unknown>) || {}}
                onChange={onChange}
                parentPath={`${path}.`}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  // Array fields
  if (field.kind === 'array') {
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          {label}
          {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
          <Badge variant="secondary" className="text-[10px]">Array</Badge>
        </Label>
        <ArrayField
          fieldName={fieldKey}
          elementDef={field.element}
          value={(value as unknown[]) || []}
          onChange={onChange}
        />
      </div>
    );
  }

  // File upload (base64 data URI)
  if (inputType === 'file') {
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          {label}
          {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
          <Badge variant="secondary" className="text-[10px]">PDF / JPEG</Badge>
        </Label>
        <FileUploadField
          value={(value as string) || ''}
          onChange={onChange}
          required={isRequired}
        />
      </div>
    );
  }

  // Enum / select
  if (field.kind === 'enum') {
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          {label}
          {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
        </Label>
        <Select value={(value as string) || ''} onValueChange={(v) => v && onChange(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {field.values.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Number fields
  if (field.kind === 'number') {
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          {label}
          {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
        </Label>
        <Input
          type="number"
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? undefined : Number(v));
          }}
          min={constraints.min}
          max={constraints.max}
          step={constraints.step as number}
          placeholder={label}
        />
      </div>
    );
  }

  // DateTime
  if (inputType === 'datetime-local') {
    const dtValue = value ? new Date(value as string).toISOString().slice(0, 16) : '';
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          {label}
          {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
        </Label>
        <Input
          type="datetime-local"
          value={dtValue}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
        />
      </div>
    );
  }

  // Email
  if (inputType === 'email') {
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          {label}
          {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
        </Label>
        <Input
          type="email"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="email@example.com"
        />
      </div>
    );
  }

  // Tel (phone)
  if (inputType === 'tel') {
    return (
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          {label}
          {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
          <Badge variant="secondary" className="text-[10px]">10 digits</Badge>
        </Label>
        <Input
          type="tel"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={10}
          pattern="[0-9]{10}"
          placeholder="9876543210"
        />
      </div>
    );
  }

  // Default: text input
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2">
        {label}
        {isRequired && <Badge variant="outline" className="text-[10px]">Required</Badge>}
        {field.kind === 'string' && field.checks?.some((c: any) => c.type === 'regex' && c.source === '^[0-9]{6}$') && (
          <Badge variant="secondary" className="text-[10px]">6 digits</Badge>
        )}
      </Label>
      <Input
        type="text"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        minLength={constraints.minLength}
        maxLength={constraints.maxLength}
        pattern={constraints.pattern}
        placeholder={label}
      />
    </div>
  );
}
