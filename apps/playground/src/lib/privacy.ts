/**
 * Privacy masking utilities for blurring sensitive user information.
 *
 * Detects and masks: email addresses, phone numbers, API keys / access tokens,
 * bearer tokens, JWTs, passwords in key-value patterns, and IP addresses.
 */

/** Mask character used to replace sensitive content. */
const MASK = '\u2022'; // bullet

/** Produce a mask string of the same visual length (capped at maxLen). */
function maskOf(len: number, maxLen = 24): string {
  return MASK.repeat(Math.min(len, maxLen));
}

// ── Patterns (order matters – more specific patterns run first) ──────────────

interface PrivacyPattern {
  name: string;
  pattern: RegExp;
  replace: (match: string, ...groups: string[]) => string;
}

const patterns: PrivacyPattern[] = [
  // 1. JWT / Bearer tokens (3 base64url segments separated by dots)
  {
    name: 'jwt',
    pattern: /\b(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
    replace: (m) => maskOf(m.length),
  },

  // 2. Bearer / Authorization header values
  {
    name: 'auth-header',
    pattern: /((?:Bearer|Basic|Token)\s+)([A-Za-z0-9_\-./+=]{8,})/gi,
    replace: (_, prefix) => prefix + maskOf(16),
  },

  // 3. Email addresses
  {
    name: 'email',
    pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
    replace: (m) => {
      const [local, domain] = m.split('@');
      const maskedLocal = local.length <= 2
        ? maskOf(local.length)
        : local[0] + maskOf(local.length - 2) + local[local.length - 1];
      return maskedLocal + '@' + domain;
    },
  },

  // 4. Indian phone numbers (10 digits, optional +91 / 91 prefix)
  {
    name: 'phone-in',
    pattern: /(?<!\d)(?:\+?91[\s-]?)?[6-9]\d{9}(?!\d)/g,
    replace: (m) => maskOf(m.length),
  },

  // 5. Generic phone numbers (international format with country code)
  {
    name: 'phone-intl',
    pattern: /(?<!\d)\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}(?!\d)/g,
    replace: (m) => maskOf(m.length),
  },

  // 6. Key-value patterns where value is a credential:
  //    password: "xxx", accessKey: 'xxx', secret: "xxx", token: "xxx", apiKey: "xxx"
  {
    name: 'kv-secret',
    pattern: /((?:password|passwd|secret|access[_-]?key|api[_-]?key|token|auth|credential|private[_-]?key)\s*[:=]\s*)(["'`]?)([^"'`,\s}\]]{4,})\2/gi,
    replace: (_, prefix, quote) => prefix + quote + maskOf(12) + quote,
  },

  // 7. Long hex / alphanumeric strings that look like API keys or tokens (≥ 20 chars)
  {
    name: 'api-key',
    pattern: /\b[A-Za-z0-9]{32,}\b/g,
    replace: (m) => maskOf(Math.min(m.length, 24)),
  },

  // 8. IPv4 addresses (private ranges are especially sensitive)
  {
    name: 'ipv4',
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/g,
    replace: () => '••.••.••.••',
  },
];

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Mask all detected PII in a plain-text string.
 * When `enabled` is false the input is returned unchanged.
 */
export function maskText(text: string, enabled: boolean): string {
  if (!enabled) return text;
  let result = text;
  for (const { pattern, replace } of patterns) {
    // Reset lastIndex for global regexes before each pass
    result = result.replace(new RegExp(pattern.source, pattern.flags), replace as any);
  }
  return result;
}

/**
 * Deep-clone a JSON-serialisable value and mask all string leaves.
 * More thorough than maskText because it walks the entire object tree.
 */
export function maskJson<T>(value: T, enabled: boolean): T {
  if (!enabled) return value;
  return _maskDeep(value) as T;
}

function _maskDeep(value: unknown): unknown {
  if (typeof value === 'string') {
    return maskText(value, true);
  }
  if (Array.isArray(value)) {
    return value.map(_maskDeep);
  }
  if (value !== null && typeof value === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      // Mask keys that are obviously credential names regardless of value
      const isSensitiveKey = /^(password|passwd|secret|access_?key|api_?key|token|auth|credential|private_?key|user_?name|email|phone|ip)$/i.test(k);
      if (isSensitiveKey && typeof v === 'string') {
        masked[k] = maskOf(Math.min(v.length, 16));
      } else {
        masked[k] = _maskDeep(v);
      }
    }
    return masked;
  }
  return value;
}

/**
 * Mask a single credential value (username, password, key).
 * Returns the masked version with first and last character visible.
 */
export function maskCredential(value: string, enabled: boolean): string {
  if (!enabled || !value) return value;
  if (value.length <= 2) return maskOf(value.length);
  if (value.length <= 4) return value[0] + maskOf(value.length - 1);
  return value.slice(0, 2) + maskOf(value.length - 4) + value.slice(-2);
}
