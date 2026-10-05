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
            <h2 className="page-title">내 서재 (총 {books.length}권)</h2>

            <div className="tabs">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className="tab"
                        aria-pressed={filter === f}
                        onClick={() => setFilter(f)}
                    >
                        {f !== 'ALL' && <span className="swatch" data-status={f}/>}
                        {f === 'ALL' ? '전체' : STATUS_LABEL[f]} ({countOf(f)})
                    </button>
                ))}
            </div>

            {filtered.length === 0 && <p className="notice">이 상태의 책이 없어요.</p>}

            <ul className="book-grid">
                {filtered.map(b=> (
                    <li key={b.id} className="book-card">
                        <div className="cover">
                            {b.coverUrl && <img src={b.coverUrl} alt=""/>}
                            <span className="ribbon" data-status={b.status} title={STATUS_LABEL[b.status]}/>
                        </div>

                        <div className="book-title">{b.title}</div>
                        <div className="book-meta">{b.author ?? '작가 미상'}</div>
                        {b.category && <div className="book-meta">{b.category}</div>}
                        <div className="book-meta">{b.platformName}</div>
                        {b.purchasedAt && <div className="book-meta">{b.purchasedAt} 구매</div>}

                        <div className="book-actions">
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

                            <button className="text-button danger" onClick={() => deleteBook(b.id, b.title)}>삭제</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default LibraryPage