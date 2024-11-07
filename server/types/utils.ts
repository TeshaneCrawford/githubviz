import type { H3Event } from 'h3'

export type CacheHandler = (event: H3Event) => Promise<unknown>

export interface CacheEntry<T> {
  data: T
  timestamp: number
}

export interface CacheStorage {
  getItem<T>(key: string): Promise<CacheEntry<T> | null>
  setItem<T>(key: string, value: CacheEntry<T>): Promise<void>
}