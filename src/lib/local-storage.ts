export function readCollection<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(data) ? (data as T[]) : [];
  } catch (error) {
    console.error(`localStorage 읽기 실패: ${key}`, error);
    return [];
  }
}

export function writeCollection<T>(key: string, items: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error(`localStorage 저장 실패: ${key}`, error);
    return false;
  }
}

export function createId() {
  return globalThis.crypto.randomUUID();
}
