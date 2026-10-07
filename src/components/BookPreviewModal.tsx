import { useEffect, useState } from "react";
import axios from "axios";
import type { Book, Platform, ReadingStatus } from "../types.ts";
import { STATUS_LABEL } from "../constants.ts";
import { clearRecommendCache } from "../recommendCache.ts";

const ADD_STATUSES: ReadingStatus[] = ['WISHLIST', 'UNREAD', 'READING', 'COMPLETED']

interface Props {
    bookId: number
    reason?: string
    defaultStatus?: ReadingStatus
    onClose: () => void
}

function BookPreviewModal({ bookId, reason, defaultStatus = 'UNREAD', onClose }: Props) {
    const [book, setBook] = useState<Book | null>(null)
    const [platforms, setPlatforms] = useState<Platform[]>([])
    const [platformId, setPlatformId] = useState<number | null>(null)
    const [status, setStatus] = useState<ReadingStatus>(defaultStatus)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        axios.get<Book>(`/api/books/${bookId}`)
            .then(res => setBook(res.data))
            .catch(err => console.error(err))
    }, [bookId])

    useEffect(() => {
        axios.get<{list: Platform[]}>('/api/platforms')
            .then(res => {
                setPlatforms(res.data.list)
                if(res.data.list.length > 0) setPlatformId(res.data.list[0].id)
            })
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose]);

    const add = () => {
        if(!book || platformId === null) return
        setAdding(true)
        axios.post('/api/library', { bookId: book.id, platformId, status })
            .then(() => {
                clearRecommendCache()
                alert(`[${book.title}] 을(를) ${STATUS_LABEL[status]}(으)로 담았어요.`)
                onClose()
            })
            .catch(err => {
                if(err.response?.status === 409) alert('이미 같은 플랫폼으로 서재에 있는 책입니다.')
                else alert('담지 못했어요.')
            })
            .finally(() => setAdding(false))
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={book?.title ?? '도서 정보'}
                onClick={e => e.stopPropagation()}
            >
                {!book ? (
                    <p className="notice">불러오는 중...</p>
                ) : (
                    <>
                        <div className="cover">
                            {book.cover_url && <img src={book.cover_url} alt="" />}
                        </div>

                        <div>
                            <h3 className="book-title modal-title">{book.title}</h3>
                            <div className="book-meta">{book.author ?? '작가 미상'}</div>
                            {(book.category || book.genre) && (
                                <div className="book-meta">{[book.category, book.genre].filter(Boolean).join(' / ')}</div>)}

                            {reason && <p className="recommend-reason modal-reason">{reason}</p>}

                            <p className="synopsis">{book.synopsis || '등록된 줄거리가 없어요.'}</p>
                        </div>

                        <div className="modal-memo">
                            <div className="form-grid">
                                <label className="form-row">
                                    {status === 'WISHLIST' ? '살 예정인 곳' : '구매처'}
                                    <select
                                        className="field"
                                        value={platformId ?? ''}
                                        onChange={e => setPlatformId(Number(e.target.value))}
                                    >
                                        {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </label>
                                <label className="form-row">
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

                            <div className="modal-actions">
                                <button className="button secondary" onClick={onClose}>닫기</button>
                                <button className="button" onClick={add} disabled={adding}>
                                    {adding ? '담는 중...' : '서재에 담기'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
export default BookPreviewModal