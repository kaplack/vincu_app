function normalizePhonePE(rawPhone) {
  const digits = String(rawPhone ?? "").replace(/\D/g, "");

  // 9 digits: 987654321
  if (digits.length === 9 && digits.startsWith("9")) return `+51${digits}`;

  // 11 digits: 51987654321
  if (digits.length === 11 && digits.startsWith("51") && digits[2] === "9")
    return `+${digits}`;

  // 12 digits with leading 0: 051987654321
  if (digits.length === 12 && digits.startsWith("051") && digits[3] === "9")
    return `+${digits.slice(1)}`;

  const err = new Error(
    "Invalid Peru mobile phone. Expected 9 digits starting with 9.",
  );
  err.code = "PHONE_INVALID";
  throw err;
}

module.exports = { normalizePhonePE };
