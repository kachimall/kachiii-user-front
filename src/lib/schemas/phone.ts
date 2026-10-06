/**
 * A phone number's basic shape: digits with the usual separators and an optional
 * leading + or 00, 9 to 15 digits. Which numbers are taken is the backend's call
 * (UAE numbers, plus Philippine mobiles on a test server), and its 422 message shows
 * on the field, so the form never refuses a number the server would accept.
 */
export function looksLikePhone(value: string): boolean {
  if (!/^\+?[\d\s().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, "").length;
  return digits >= 9 && digits <= 15;
}
