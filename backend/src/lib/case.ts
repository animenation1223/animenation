export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

export function keysToCamel<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = snakeToCamel(k);
    if (Array.isArray(v)) {
      out[key] = v.map((item) =>
        item && typeof item === "object" && !Array.isArray(item) ? keysToCamel(item as Record<string, unknown>) : item
      );
    } else if (v && typeof v === "object" && !(v instanceof Date)) {
      out[key] = keysToCamel(v as Record<string, unknown>);
    } else {
      out[key] = v;
    }
  }
  return out;
}

export function keysToSnake<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = camelToSnake(k);
    if (v instanceof Date) {
      out[key] = v.toISOString();
    } else if (Array.isArray(v)) {
      out[key] = v.map((item) =>
        item && typeof item === "object" && !Array.isArray(item) ? keysToSnake(item as Record<string, unknown>) : item
      );
    } else if (v && typeof v === "object") {
      out[key] = keysToSnake(v as Record<string, unknown>);
    } else {
      out[key] = v;
    }
  }
  return out;
}
