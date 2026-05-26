import {
  BUSINESS_PHONE_NUMBER,
  MIN_CALL_DURATION_SECONDS,
  isExcludedPhone,
  isTestPhone,
} from './constants';

const TOLL_FREE_PREFIXES = ['+1800', '+1833', '+1844', '+1855', '+1866', '+1877', '+1888'];

export interface QualifyingCallLike {
  from_number?: string | null;
  duration?: number | null;
  direction?: string | null;
}

export function isQualifyingCall(call: QualifyingCallLike): boolean {
  const fromNumber = call.from_number || '';

  if (call.direction && call.direction !== 'Inbound') return false;
  if (!fromNumber) return false;
  if (fromNumber === BUSINESS_PHONE_NUMBER) return false;
  if (TOLL_FREE_PREFIXES.some(prefix => fromNumber.startsWith(prefix))) return false;
  if (isExcludedPhone(fromNumber) || isTestPhone(fromNumber)) return false;
  if ((call.duration || 0) < MIN_CALL_DURATION_SECONDS) return false;

  return true;
}

export function applyQualifyingFilter<T extends QualifyingCallLike>(calls: T[]): T[] {
  return calls.filter(isQualifyingCall);
}
