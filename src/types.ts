export interface Platform {
    id: number
    name: string
}

export interface Book {
    id: number
    title: string
    author: string
    genre: string
    category: string
    synopsis: string
    cover_url: string
    source: string
    created_at: string
}

export interface BookListResponse {
    list: Book[]
    curpage: number
    totalpage: number
    startPage: number
    endPage: number
}

export type ReadingStatus = 'WISHLIST' | 'UNREAD' | 'READING' | 'COMPLETED' | 'DROPPED'

export interface UserBook {
    id: number
    bookId: number
    title: string
    author: string | null
    genre: string | null
    category: string | null
    coverUrl: string | null
    platformName: string
    status: ReadingStatus
    rating: number | null
    purchasedAt: string | null
}

export interface Recommendation {
    bookId: number
    title: string
    author: string | null
    category: string | null
    coverUrl: string | null
    reason: string
}