import { useEffect, useState } from "react"
import axios from "axios"
import type { UserBook, ReadingStatus } from "../types.ts"
import { STATUS_LABEL } from "../constants.ts";
import { clearRecommendCache } from '../recommendCache.ts'

type Filter = ReadingStatus | 'ALL'
const FILTERS: Filter[] = ['ALL', 'WISHLIST', 'UNREAD', 'READING', 'COMPLETED', 'DROPPED']
const STATUSES: ReadingStatus[] = ['WISHLIST', 'UNREAD', 'READING', 'COMPLETED', 'DROPPED']
const canRate = (s: ReadingStatus) =>
    s === 'READING' || s === 'COMPLETED' || s === 'DROPPED'

function LibraryPage() {
    const [books, setBooks] = useState<UserBook[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [filter, setFilter] = useState<Filter>('ALL')

    const loadLibrary = () => {
        axios.get<{ list: UserBook[] }>('/api/library')
            .then(res => setBooks(res.data.list))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        loadLibrary()
    }, []);

    const updateBook = (id: number, body: {status?: ReadingStatus; rating?: number}) => {
        axios.patch(`/api/library/${id}`, body)
            .then(() => { clearRecommendCache(); loadLibrary() })
            .catch(() => alert('수정에 실패했어요.'))
    }

    const deleteBook = (id: number, title: string) => {
        if(!confirm(`[${title}] 을(를) 서재에서 삭제할까요?`)) return
        axios.delete(`/api/library/${id}`)
            .then(() => { clearRecommendCache(); loadLibrary() })
            .catch(() => alert('삭제에 실패했어요.'))
    }

    if(loading) return <p>Loading...</p>
    if(error) return <p>서재를 불러오지 못했어요.</p>
    if(books.length === 0) return <p>아직 서재에 등록한 책이 없어요.</p>

    const filtered = filter === 'ALL' ? books : books.filter(b => b.status === filter)
    const countOf = (f: Filter) => (f === 'ALL' ? books.length : books.filter(b => b.status === f).length)

    return (
        <div>
            <h2>내 서재 ({books.length}권)</h2>

            <div style={{ marginBottom: 16}}>
                {FILTERS.map(f => (
                    <button key={f} disabled={filter === f} onClick={() => setFilter(f)}>
                        {f == 'ALL' ? '전체' : STATUS_LABEL[f]} ({countOf(f)})
                    </button>
                ))}
            </div>

            {filtered.length === 0 && <p>이 상태의 책이 없어요.</p>}

            <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 16
            }}>
                {filtered.map(b=> (
                    <li key={b.id}>
                        {b.coverUrl && (
                            <img src={b.coverUrl} alt={b.title} style={{width: '100%'}}/>
                        )}
                        <strong>{b.title}</strong>
                        <div>{b.author ?? '작가 미상'}</div>
                        <div>{b.platformName}{b.purchasedAt && ` · ${b.purchasedAt}`}</div>
                        {b.category && <div style={{ fontSize: 12, color: 'gray'}}>{b.category}</div>}

                        <select
                            value={b.status}
                            onChange={e => updateBook(b.id, { status: e.target.value as ReadingStatus})}
                        >
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>

                        <select
                            value={b.rating ?? ''}
                            disabled={!canRate(b.status)}
                            onChange={e => updateBook(b.id, { rating: Number(e.target.value) })}
                        >
                            <option value="" disabled>평점</option>
                            {[5,4,3,2,1].map(r => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
                        </select>

                        <button onClick={() => deleteBook(b.id, b.title)}>삭제</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default LibraryPage