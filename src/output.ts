export type OutputFormat = 'json' | 'table' | 'plain';

export function formatOutput(data: unknown, format: OutputFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'table':
      return formatTable(data);
    case 'plain':
      return formatPlain(data);
  }
}

function formatTable(data: unknown): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '(empty)';
    const keys = Object.keys(data[0] as Record<string, unknown>);
    const widths = keys.map((k) =>
      Math.max(
        k.length,
        ...data.map((row) => String((row as Record<string, unknown>)[k] ?? '').length),
      ),
    );
    const header = keys.map((k, i) => k.padEnd(widths[i]!)).join('  ');
    const sep = widths.map((w) => '-'.repeat(w)).join('  ');
    const rows = data.map((row) =>
      keys
        .map((k, i) => String((row as Record<string, unknown>)[k] ?? '').padEnd(widths[i]!))
        .join('  '),
    );
    return [header, sep, ...rows].join('\n');
  }
  if (data && typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    const maxKey = Math.max(...entries.map(([k]) => k.length));
    return entries.map(([k, v]) => `${k.padEnd(maxKey)}  ${JSON.stringify(v)}`).join('\n');
  }
  return String(data);
}

function formatPlain(data: unknown): string {
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
}

export function printOutput(data: unknown, format: OutputFormat): void {
  console.log(formatOutput(data, format));
}

export function parseJsonArg(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Invalid JSON: ${value}`);
  }
}
