// idb-keyval 包装,本地持久化
import { get, set, del, keys } from "idb-keyval";

export const db = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    return (await get(key)) as T | undefined;
  },
  async set(key: string, value: unknown): Promise<void> {
    await set(key, value);
  },
  async remove(key: string): Promise<void> {
    await del(key);
  },
  async listKeys(): Promise<string[]> {
    return ((await keys()) as IDBValidKey[]).map((k) => String(k));
  },
};