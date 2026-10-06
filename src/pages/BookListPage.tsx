import { useEffect, useState } from "react";
//import type { FormEvent } from "react";
import type { SubmitEvent } from "react";
import axios from "axios";
import type { Book, BookListResponse, Platform, ReadingStatus } from "../types.ts";
import { STATUS_LABEL } from "../constants.ts";
import { clearRecommendCache } from '../recommendCache.ts'
import ManualBookForm from "../components/ManualBookForm.tsx";

const ADD_STATUSES: ReadingStatus[] = ['UNREAD', 'READING', 'COMPLETED', 'WISHLIST']

function BookListPage() {
    // 검색
    const [keyword, setKeyword] = useState('')  // 입력창에 타이핑 중인 값
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)
    const [data, setData] = useState<BookListResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)

    // 등록 옵션
    const [platforms, setPlatforms] = useState<Platform[]>([])
    const [platformId, setPlatformId] = useState<number | null>(null)
    const [status, setStatus] = useState<ReadingStatus>('UNREAD')

    // 처음 한 번: 플랫폼 목록
    useEffect(() => {
        axios.get<{list: Platform[] }>('/api/platforms')
            .then(res => {
                setPlatforms(res.data.list)
                if (res.data.list.length > 0) setPlatformId(res.data.list[0].id)
            })
            .catch(err => console.error(err))
    }, []);

    // page나 query가 바뀔 때마다: 도서 목록
    useEffect(() => {
        axios.get<BookListResponse>('/api/books', { params: { page, keyword: query}})
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [page, query]);

    const goToPage = (p: number) => {
        if (p === page) return
        setLoading(true)
        setPage(p)
    }

    const handleSearch = (e: SubmitEvent) => {
        e.preventDefault()
        const q = keyword.trim()
        if(q === query && page === 1) return
        setLoading(true)
        setPage(1)
        setQuery(q)
    }

    const handleAdd = (book: Book) => {
        if(platformId === null) return

        axios.post('/api/library', { bookId: book.id, platformId, status })
            .then(() => {
                clearRecommendCache()
                alert (`[${book.title}]을(를) 서재에 담았어요.`)
            })
            .catch(err => {
                if(err.response?.status === 409) alert('이미 같은 플랫폼으로 서재에 있는 책이예요.')
                else alert('등록에 실패했어요.')
            })
    }

    const pageNumbers = data
        ? Array.from({length: data.endPage - data.startPage + 1}, (_, i) => data.startPage + i)
        : []

    return (
        <div>
            <h2 className="page-title">도서 검색</h2>

            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    className="field"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    placeholder="제목으로 검색"
                />
                <button type="submit" className="button">검색</button>
            </form>

            <button className="text-button" onClick={() => setShowForm(true)}>
                찾는 책이 없나요? 직접 등록하기
            </button>

            <div className="add-options">
                <label>
                    구매처
                    <select
                        className="field"
                        value={platformId ?? ''}
                        onChange={e => setPlatformId(Number(e.target.value))}
                    >
                        {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </label>
                <label>
                    담을 때 상태
                    <select
                        className="field"
                        value={status}
                        onChange={e => setStatus(e.target.value as ReadingStatus)}
                    >
                        {ADD_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                </label>
            </div>

            {loading && <p className="notice">불러오는 중...</p>}
            {!loading && data && data.list.length === 0 && (
                <p className="notice">'{query}'(으)로 찾은 책이 없어요. 제목 일부만 넣어 보세요.</p>
            )}

            {!loading && data && (
                <ul className="book-grid">
                    {data.list.map(b => (
                        <li key={b.id} className="book-card">
                            <div className="cover">
                                {b.cover_url && <img src={b.cover_url} alt="" />}
                            </div>
                            <div className="book-title">{b.title}</div>
                            <div className="book-meta">{b.author ?? '작가 미상'}</div>
                            {b.category && <div className="book-meta">{b.category}</div>}
                            <button className="button secondary small" onClick={() => handleAdd(b)}>
                                서재에 담기
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.totalpage > 0 && (
                <nav className="pagination" aria-label="페이지">
                    <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>이전</button>
                    {pageNumbers.map(p => (
                        <button
                            key={p}
                            aria-current={p === page ? 'page' : undefined}
                            onClick={() => goToPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                    <button disabled={page >= data.totalpage} onClick={() => goToPage(page + 1)}>다음</button>
                </nav>
            )}
            {showForm && (
                <ManualBookForm platforms={platforms} onClose={() => setShowForm(false)} />
            )}
        </div>
    )
}
export default BookListPage