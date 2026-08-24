export function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIPadOS = ua.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/.test(ua) || isIPadOS;
}

export function isIPad() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iPad/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

/**
 * Best-effort iOS major version. Modern iPadOS reports as "Macintosh" in
 * the UA string with no OS version at all, so this falls back to the
 * Safari version token, which tracks the OS version closely enough to
 * distinguish "old, buggy iOS 15" from "current."
 */
export function getIOSMajorVersion() {
  if (typeof navigator === 'undefined' || !isIOSDevice()) return null;
  const ua = navigator.userAgent || '';
  const osMatch = ua.match(/OS (\d+)_/); // "CPU iPhone OS 15_0 like Mac OS X"
  if (osMatch) return parseInt(osMatch[1], 10);
  const safariMatch = ua.match(/Version\/(\d+)\./);
  if (safariMatch) return parseInt(safariMatch[1], 10);
  return null;
}