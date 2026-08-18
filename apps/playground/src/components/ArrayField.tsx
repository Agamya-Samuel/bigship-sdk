'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { ZodForm } from './ZodForm';
import type { FieldDef } from '@/lib/schema-introspect';

interface ArrayFieldProps {
  fieldName: string;
  elementDef: FieldDef;
  value: unknown[];
  onChange: (value: unknown[]) => void;
}

function getDefaultForField(def: FieldDef): unknown {
  switch (def.kind) {
    case 'string': return '';
    case 'number': return 0;
    case 'enum': return def.values[0] || '';
    case 'literal': return def.value;
    case 'object': {
      const obj: Record<string, unknown> = {};
      for (const [key, field] of Object.entries(def.shape)) {
        obj[key] = getDefaultForField(field);
      }
      return obj;
    }
    case 'array': return [];
    default: return '';
  }
}

export function ArrayField({ fieldName, elementDef, value, onChange }: ArrayFieldProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addItem = () => {
    const newItem = getDefaultForField(elementDef);
    const newValue = [...value, newItem];
    onChange(newValue);
    setExpandedItems(prev => new Set(prev).add(newValue.length - 1));
  };

  const removeItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    setExpandedItems(prev => {
      const next = new Set<number>();
      prev.forEach(i => { if (i < index) next.add(i); else if (i > index) next.add(i - 1); });
      return next;
    });
  };

  const updateItem = (index: number, itemValue: unknown) => {
    const newValue = [...value];
    newValue[index] = itemValue;
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <Card key={index} className="relative">
          <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
            <CardTitle
              className="text-sm cursor-pointer flex-1"
              onClick={() => toggleItem(index)}
            >
              {fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} #{index + 1}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          {expandedItems.has(index) && (
            <CardContent className="pt-0 pb-3 px-4">
              {elementDef.kind === 'object' ? (
                <ZodForm
                  shape={elementDef.shape}
                  values={item as Record<string, unknown>}
                  onChange={(updated) => updateItem(index, updated)}
                />
              ) : (
                <input
                  type="text"
                  value={String(item)}
                  onChange={(e) => updateItem(index, e.target.value)}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              )}
            </CardContent>
          )}
        </Card>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add {fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </Button>
    </div>
  );
}
