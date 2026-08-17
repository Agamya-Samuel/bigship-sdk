import { z } from 'zod';

export interface StringCheck {
  type: 'min' | 'max' | 'regex' | 'datetime' | 'email';
  value?: number;
  source?: string;
}

export interface NumberCheck {
  type: 'min' | 'max' | 'int';
  value?: number;
  inclusive?: boolean;
}

export type FieldDef =
  | { kind: 'string'; checks: StringCheck[]; optional: boolean; nullable: boolean }
  | { kind: 'number'; checks: NumberCheck[]; optional: boolean; nullable: boolean }
  | { kind: 'enum'; values: string[]; optional: boolean; nullable: boolean }
  | { kind: 'literal'; value: string; optional: boolean; nullable: boolean }
  | { kind: 'object'; shape: Record<string, FieldDef>; optional: boolean; nullable: boolean }
  | { kind: 'array'; element: FieldDef; optional: boolean; nullable: boolean }
  | { kind: 'union'; options: FieldDef[]; optional: boolean; nullable: boolean }
  | { kind: 'nullable'; inner: FieldDef; optional: boolean; nullable: boolean };

export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'datetime-local'
  | 'select'
  | 'file'
  | 'hidden'
  | 'object'
  | 'array';

export function introspect(schema: z.ZodTypeAny): FieldDef {
  const def = (schema as any)._def;
  const typeName: string = def.typeName;

  switch (typeName) {
    case 'ZodString': {
      const checks: StringCheck[] = (def.checks || []).map((c: any) => {
        if (c.kind === 'min') return { type: 'min' as const, value: c.value };
        if (c.kind === 'max') return { type: 'max' as const, value: c.value };
        if (c.kind === 'regex') return { type: 'regex' as const, source: c.regex.source };
        if (c.kind === 'datetime') return { type: 'datetime' as const };
        if (c.kind === 'email') return { type: 'email' as const };
        return null;
      }).filter(Boolean);
      return { kind: 'string', checks, optional: false, nullable: false };
    }

    case 'ZodNumber': {
      const checks: NumberCheck[] = (def.checks || []).map((c: any) => {
        if (c.kind === 'min') return { type: 'min' as const, value: c.value, inclusive: c.inclusive };
        if (c.kind === 'max') return { type: 'max' as const, value: c.value, inclusive: c.inclusive };
        if (c.kind === 'int') return { type: 'int' as const };
        return null;
      }).filter(Boolean);
      return { kind: 'number', checks, optional: false, nullable: false };
    }

    case 'ZodEnum':
      return { kind: 'enum', values: def.values, optional: false, nullable: false };

    case 'ZodNativeEnum':
      return { kind: 'enum', values: Object.values(def.values), optional: false, nullable: false };

    case 'ZodLiteral':
      return { kind: 'literal', value: def.value, optional: false, nullable: false };

    case 'ZodObject': {
      const shape = typeof def.shape === 'function' ? def.shape() : def.shape;
      const fields: Record<string, FieldDef> = {};
      for (const [key, val] of Object.entries(shape)) {
        fields[key] = introspect(val as z.ZodTypeAny);
      }
      return { kind: 'object', shape: fields, optional: false, nullable: false };
    }

    case 'ZodArray':
      return { kind: 'array', element: introspect(def.type), optional: false, nullable: false };

    case 'ZodOptional': {
      const inner = introspect(def.innerType);
      return { ...inner, optional: true };
    }

    case 'ZodNullable': {
      const inner = introspect(def.innerType);
      return { ...inner, nullable: true };
    }

    case 'ZodUnion':
      return { kind: 'union', options: def.options.map((o: any) => introspect(o)), optional: false, nullable: false };

    case 'ZodEffects':
      return introspect(def.schema);

    case 'ZodDefault':
      return introspect(def.innerType);

    case 'ZodBranded':
      return introspect(def.type);

    default:
      return { kind: 'string', checks: [], optional: false, nullable: false };
  }
}

export function deriveInputType(field: FieldDef, fieldName: string): InputType {
  if (field.kind === 'literal') return 'hidden';
  if (field.kind === 'enum') return 'select';
  if (field.kind === 'object') return 'object';
  if (field.kind === 'array') return 'array';

  if (field.kind === 'string') {
    if (field.checks.some(c => c.type === 'regex' && c.source?.startsWith('^data:'))) return 'file';
    if (field.checks.some(c => c.type === 'datetime')) return 'datetime-local';
    if (field.checks.some(c => c.type === 'email')) return 'email';
    if (field.checks.some(c => c.type === 'regex' && c.source === '^[0-9]{10}$')) return 'tel';
    return 'text';
  }

  if (field.kind === 'number') return 'number';

  return 'text';
}

export function deriveLabel(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function getFieldConstraints(field: FieldDef): {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
} {
  const constraints: Record<string, unknown> = {};

  if (field.kind === 'string') {
    for (const check of field.checks) {
      if (check.type === 'min') constraints.minLength = check.value;
      if (check.type === 'max') constraints.maxLength = check.value;
      if (check.type === 'regex') constraints.pattern = check.source;
    }
  }

  if (field.kind === 'number') {
    for (const check of field.checks) {
      if (check.type === 'min') constraints.min = check.inclusive ? check.value : (check.value ?? 0) + 0.001;
      if (check.type === 'max') constraints.max = check.value;
      if (check.type === 'int') constraints.step = 1;
    }
    if (!field.checks.some(c => c.type === 'int')) {
      constraints.step = 'any';
    }
  }

  return constraints as ReturnType<typeof getFieldConstraints>;
}
