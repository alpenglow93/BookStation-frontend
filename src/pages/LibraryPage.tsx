import { useEffect, useState } from "react"
import axios from "axios"
import type {UserBook, ReadingStatus } from "../types.ts"

const STATUS_LABEL: Record<ReadingStatus, string> = {
    WISHLIST: '위시리스트',
    UNREAD: '안 읽음',
    READING: '읽는 중',
    COMPLETED: '완독',
    DROPPED: '드랍'
}

function LibraryPage() {
    const [books, setBooks] = useState<UserBook[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        axios.get<{list: UserBook[]}>('/api/library')
            .then(res => setBooks(res.data.list))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, []);

    if(loading) return <p>Loading...</p>
    if(error) return <p>서재를 불러오지 못했어요.</p>
    if(books.length === 0) return <p>아직 서재에 등록한 책이 없어요.</p>

    return (
        <div>
            <h2>내 서재 ({books.length}권)</h2>
            <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 16
            }}>
                {books.map(b=> (
                    <li key={b.id}>
                        {b.coverUrl && (
                            <img src={b.coverUrl} alt={b.title} style={{width: '100%'}}/>
                        )}
                        <strong>{b.title}</strong>
                        <div>{b.author ?? '작가 미상'}</div>
                        <div>{b.platformName} · {STATUS_LABEL[b.status]}</div>
                        {b.rating !== null && <div>{'★'.repeat(b.rating)}</div>}
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default LibraryPage