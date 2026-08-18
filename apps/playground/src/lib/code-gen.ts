const METHODS_WITH_PARAMS: Record<string, { paramNames: string[]; returnsData: boolean; needsTypeGuard: boolean }> = {
  getWalletBalance:          { paramNames: [], returnsData: true, needsTypeGuard: true },
  getCourierList:            { paramNames: ['shipmentCategory'], returnsData: true, needsTypeGuard: true },
  getCourierTransporterList: { paramNames: ['courierId'], returnsData: true, needsTypeGuard: true },
  getPaymentCategory:        { paramNames: ['shipmentCategory'], returnsData: true, needsTypeGuard: true },
  addWarehouse:              { paramNames: ['payload'], returnsData: true, needsTypeGuard: true },
  getWarehouseList:          { paramNames: ['pageIndex', 'pageSize'], returnsData: true, needsTypeGuard: true },
  addSingleOrder:            { paramNames: ['payload'], returnsData: true, needsTypeGuard: true },
  addHeavyOrder:             { paramNames: ['payload'], returnsData: true, needsTypeGuard: true },
  manifestSingle:            { paramNames: ['payload'], returnsData: true, needsTypeGuard: true },
  manifestHeavy:             { paramNames: ['payload'], returnsData: true, needsTypeGuard: true },
  getShippingRates:          { paramNames: ['orderId', 'category', 'riskType'], returnsData: true, needsTypeGuard: true },
  cancelShipments:           { paramNames: ['awbs'], returnsData: true, needsTypeGuard: true },
  calculateRate:             { paramNames: ['payload'], returnsData: true, needsTypeGuard: true },
  getAWB:                    { paramNames: ['orderId'], returnsData: true, needsTypeGuard: true },
  getShipmentFile:           { paramNames: ['shipmentDataId', 'orderId'], returnsData: true, needsTypeGuard: true },
  getShipmentData:           { paramNames: ['shipmentDataId', 'orderId'], returnsData: true, needsTypeGuard: true },
  trackShipment:             { paramNames: ['trackingId', 'trackingType'], returnsData: true, needsTypeGuard: true },
  manifestAndGetAWB:         { paramNames: ['orderId', 'courierId'], returnsData: true, needsTypeGuard: false },
  getShipmentDetails:        { paramNames: ['orderId'], returnsData: true, needsTypeGuard: false },
  createAndFinalizeShipment: { paramNames: ['config'], returnsData: true, needsTypeGuard: false },
};

const METHODS_NEEDING_SPECIAL_IMPORTS: Record<string, string[]> = {
  addSingleOrder: ['isFailedResponse'],
  addHeavyOrder: ['isFailedResponse'],
  getShipmentData: ['ShipmentDataType'],
};

function formatValue(value: unknown, depth: number): string {
  if (value === null || value === undefined) return 'undefined';
  if (typeof value === 'string') {
    if (value.startsWith('data:') && value.length > 50) {
      return `'${value.substring(0, 40)}...'`;
    }
    return `'${value}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map(v => formatValue(v, depth + 1));
    if (items.join(', ').length < 80) return `[${items.join(', ')}]`;
    const indent = '  '.repeat(depth + 1);
    const closing = '  '.repeat(depth);
    return `[\n${indent}${items.join(`,\n${indent}`)}\n${closing}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    const indent = '  '.repeat(depth + 1);
    const closing = '  '.repeat(depth);
    const lines = entries.map(([k, v]) => `${indent}${k}: ${formatValue(v, depth + 1)},`);
    return `{\n${lines.join('\n')}\n${closing}}`;
  }
  return String(value);
}

function formatCallArgs(params: unknown[], meta: { paramNames: string[] }): string {
  if (params.length === 0) return '';
  if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null && !Array.isArray(params[0])) {
    return formatValue(params[0], 1);
  }
  return params.map(p => formatValue(p, 0)).join(', ');
}

export function generateCode(method: string, params: unknown[]): string {
  const meta = METHODS_WITH_PARAMS[method];
  if (!meta) return `// Unknown method: ${method}`;

  const lines: string[] = [];

  // Imports
  const imports = ['BigshipClient'];
  if (meta.returnsData) imports.push('isSuccessResponse');
  const specialImports = METHODS_NEEDING_SPECIAL_IMPORTS[method];
  if (specialImports) imports.push(...specialImports);
  const uniqueImports = [...new Set(imports)];
  lines.push(`import { ${uniqueImports.join(', ')} } from '@agamya/bigship-sdk';`);
  lines.push('');

  // Client
  lines.push('const client = new BigshipClient({');
  lines.push("  baseURL: 'https://api.bigship.in',");
  lines.push("  userName: 'your-email@example.com',");
  lines.push("  password: 'your-password',");
  lines.push("  accessKey: 'your-access-key',");
  lines.push('});');
  lines.push('');

  // Method call
  const args = formatCallArgs(params, meta);
  if (args.includes('\n')) {
    lines.push(`const response = await client.${method}(${args});`);
  } else if (params.length === 0) {
    lines.push(`const response = await client.${method}();`);
  } else {
    lines.push(`const response = await client.${method}(${args});`);
  }
  lines.push('');

  // Response handling
  if (meta.returnsData) {
    lines.push('if (isSuccessResponse(response)) {');
    lines.push('  console.log(\'Data:\', response.data);');
    lines.push('}');
  }

  return lines.join('\n');
}
