import { useEffect, useState } from "react";
//import type { FormEvent } from "react";
import type { SubmitEvent } from "react";
import axios from "axios";
import type { Book, BookListResponse, Platform, ReadingStatus } from "../types.ts";
import { STATUS_LABEL } from "../constants.ts";
import { clearRecommendCache } from '../recommendCache.ts'

const ADD_STATUSES: ReadingStatus[] = ['UNREAD', 'READING', 'COMPLETED', 'WISHLIST']

function BookListPage() {
    // 검색
    const [keyword, setKeyword] = useState('')  // 입력창에 타이핑 중인 값
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(1)
    const [data, setData] = useState<BookListResponse | null>(null)
    const [loading, setLoading] = useState(false)

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
        setLoading(true)
        axios.get<BookListResponse>('/api/books', { params: { page, keyword: query}})
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [page, query]);

    const handleSearch = (e: SubmitEvent) => {
        e.preventDefault()
        setPage(1)
        setQuery(keyword.trim())
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
            <h2>도서 검색</h2>

            <form onSubmit={handleSearch}>
                <input value={keyword} onChange={ e => setKeyword(e.target.value) }
                       placeholder="제목으로 검색" />
                <button type="submit">검색</button>
            </form>

            <div style={{margin: '12px 0'}}>
                구매처{' '}
                <select value={platformId ?? ''} onChange={e => setPlatformId(Number(e.target.value))}>
                    {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>{' '}
                상태{' '}
                <select value={status} onChange={e=>setStatus(e.target.value as ReadingStatus)}>
                    {ADD_STATUSES.map(s=> <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
            </div>

            {loading && <p>불러오는 중...</p>}
            {!loading && data && data.list.length === 0 && <p>검색 결과가 없어요.</p>}

            {data && (
                <ul style={{
                    listStyle: 'none', padding: 0, display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16,
                }}>
                    {data.list.map(b => (
                        <li key={b.id}>
                            {b.cover_url && <img src={b.cover_url} alt={b.title} style={{ width: '100%' }}/>}
                            <strong>{b.title}</strong>
                            <div>{b.author ?? '작가 미상'}</div>
                            {b.category && <div style={{ fontSize: 12, color: 'gray'}}>{b.category}</div>}
                            <button onClick={()=>handleAdd(b)}>서재에 담기</button>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.totalpage > 0 && (
                <div style={{marginTop: 16}}>
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)}>이전</button>
                    {pageNumbers.map(p => (
                        <button key={p} disabled={p === page} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button disabled={page >= data.totalpage} onClick={() => setPage(page + 1)}>다음</button>
                </div>
            )}
        </div>
    )
}
export default BookListPage