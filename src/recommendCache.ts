import type { Recommendation } from "./types.ts";

export interface CacheEntry {
    items: Recommendation[]
    savedAt: string
}

const STORAGE_KEY = 'bookstation:recommend'

export function readCache(): Record<string, CacheEntry> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

export function writeCache(cache: Record<string, CacheEntry>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
}

export function clearRecommendCache() {
    localStorage.removeItem(STORAGE_KEY)
}