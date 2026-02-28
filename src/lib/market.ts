'use client';

export type Market = 'arizona' | 'colorado';

export function getMarketFromPath(pathname: string | null | undefined): Market | null {
  if (!pathname) return null;
  const path = pathname.toLowerCase();
  if (path.includes('/phoenix') || path.includes('-az') || path.includes('/arizona')) return 'arizona';
  if (
    path.includes('/denver') ||
    path.includes('/boulder') ||
    path.includes('/aurora') ||
    path.includes('/colorado-springs') ||
    path.includes('/colorado') ||
    path.includes('-co')
  ) {
    return 'colorado';
  }
  return null;
}

export function getMarketFromCookie(): Market | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )market=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1] || '').toLowerCase();
  if (value === 'arizona' || value === 'colorado') return value;
  return null;
}

export function resolveMarket(pathname?: string | null): Market {
  return getMarketFromPath(pathname) || getMarketFromCookie() || 'colorado';
}

export function getPhoneForMarket(market: Market) {
  if (market === 'arizona') {
    return {
      phoneNumber: '4807127465',
      phoneE164: '+14807127465',
      displayPhone: '(480) 712-7465',
    };
  }

  return {
    phoneNumber: '7209187465',
    phoneE164: '+17209187465',
    displayPhone: '(720) 918-7465',
  };
}
