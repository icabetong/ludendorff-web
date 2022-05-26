import { Timestamp } from "@firebase/firestore-types";

export type OperatingSystem = 'Linux' | 'Android' | 'Windows' | 'macOS' | 'iOS' | 'unknown';
export function getHostOperatingSystem(): OperatingSystem {
  let userAgent = window.navigator.userAgent,
    platform = window.navigator?.userAgentData?.platform ?? window.navigator.platform, // eslint-disable-line
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'],
    os: OperatingSystem = 'unknown';

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'macOS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }
  return os;
}

export const currencyFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
export const SERVER_URL = "https://deshi-production.up.railway.app";
export const isDev = process.env.NODE_ENV === 'development'

export const newId = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = ''
  for (let i = 0; i < 20; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}
export const formatDate = (date: Date | undefined) => {
  const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' } as const;
  return date !== undefined ? date.toLocaleDateString(['en-PH'], options) : "unknown";
}

export const formatTimestamp = (timestamp: Timestamp | undefined) => {
  return formatDate(timestamp?.toDate());
}

export function chunck<T>(arr: T[], size: number) {
  return Array.from({ length: Math.ceil(arr.length / size )}, function(v, i) {
    return arr.slice(i * size, i * size + size);
  });
}

export function escapeRegExp(value: string): string {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function groupBy<T, K extends keyof T>(array: T[], key: K) {
  let map = new Map<T[K], T[]>();
  array.forEach((item: T) => {
    let itemKey = item[key];
    if (!map.has(itemKey)) {
      map.set(itemKey, array.filter(i => i[key] === item[key]));
    }
  })
  return map;
}