import type { ReadingStatus } from './types.ts'

export const STATUS_LABEL: Record<ReadingStatus, string> = {
    WISHLIST: '위시리스트',
    UNREAD: '안 읽음',
    READING: '읽는 중',
    COMPLETED: '완독',
    DROPPED: '드랍'
}