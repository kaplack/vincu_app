function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

/**
 * Peru phone normalization to E.164 where possible.
 * Accepts:
 * - +519XXXXXXXX
 * - 519XXXXXXXX
 * - 9XXXXXXXX => +51...
 * - with spaces/dashes/parentheses
 */
function normalizePhonePE(input) {
  const raw = String(input).trim();
  if (!raw) return raw;

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");

  if (hasPlus && digits.startsWith("51")) return `+${digits}`;
  if (digits.startsWith("51") && digits.length === 11) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("9")) return `+51${digits}`;
  if (digits.length >= 10) return `+${digits}`;

  return digits;
}

module.exports = { normalizeEmail, normalizePhonePE };
