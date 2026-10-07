import { useEffect, useState } from "react";
import axios from "axios";
import type { Book, UserBook, Platform } from "../types.ts";
import { STATUS_LABEL } from "../constants.ts";

interface Props {
    userBook: UserBook
    onClose: () => void
    onSaved: () => void
}

function BookDetailModal({ userBook, onClose, onSaved }: Props) {
    const [synopsis, setSynopsis] = useState<string | null>(null)
    const [platforms, setPlatforms] = useState<Platform[]>([])

    const [memo, setMemo] = useState(userBook.memo ?? '')
    const [platformId, setPlatformId] = useState(userBook.platformId)
    const [purchasedAt, setPurchasedAt] = useState(userBook.purchasedAt ?? '')
    const [saving, setSaving] = useState(false)

    const isWishlist = userBook.status === 'WISHLIST'
    const categoryLine = [userBook.category, userBook.genre].filter(Boolean).join(' / ')

    useEffect(() => {
        axios.get<Book>(`/api/books/${userBook.bookId}`)
            .then(res => setSynopsis(res.data.synopsis ?? ''))
            .catch(() => setSynopsis(''))
    }, [userBook.bookId])

    useEffect(() => {
        axios.get<{list: Platform[] }>('/api/platforms')
            .then(res => setPlatforms(res.data.list))
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const save = () => {
        const body: { memo: string; platformId?: number; purchasedAt?: string } = { memo }
        if(platformId !== userBook.platformId) body.platformId = platformId
        if(purchasedAt && purchasedAt !== userBook.purchasedAt) body.purchasedAt = purchasedAt

        setSaving(true)
        axios.patch(`/api/library/${userBook.id}`, body)
            .then(() => { onSaved(); onClose() })
            .catch(err => {
                if(err.response?.status === 409) alert('이미 서재에 동일한 책이 동일한 플랫폼에 존재합니다')
                else alert('저장하지 못했어요.')
            })
            .finally(() => setSaving(false))
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-label={userBook.title}
                onClick={e => e.stopPropagation()}
            >
                <div className="cover">
                    {userBook.coverUrl && <img src={userBook.coverUrl} alt="" />}
                    <span className="ribbon" data-status={userBook.status} />
                </div>

                <div>
                    <h3 className="book-title modal-title">{userBook.title}</h3>
                    <div className="book-meta">{userBook.author ?? '작가 미상'}</div>
                    {categoryLine && <div className="book-meta">{categoryLine}</div> }
                    <div className="book-meta">{userBook.platformName} / {STATUS_LABEL[userBook.status]}</div>
                    {userBook.rating !== null && <div className="book-meta">{'★'.repeat(userBook.rating)}</div>}

                    <p className="synopsis">
                        {synopsis === null ? '줄거리를 불러오는 중...' : synopsis || '등록된 줄거리가 없어요.'}
                    </p>
                </div>

                <div className="modal-memo">
                    <div className="form-grid">
                        <label className="form-row">
                            {isWishlist ? '살 예정인 곳': '구매처'}
                            <select className="field" value={platformId} onChange={e => setPlatformId(Number(e.target.value))}>
                                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </label>
                        {!isWishlist && (
                            <label className="form-row">
                                구매일
                                <input
                                    type="date"
                                    className="field"
                                    value={purchasedAt}
                                    onChange={e => setPurchasedAt(e.target.value)}
                                />
                            </label>
                        )}
                    </div>

                    <label className="form-row">메모
                        <textarea
                            className="field"
                            value={memo}
                            onChange={e => setMemo(e.target.value)}
                            placeholder="이 책에 대해 남기고 싶은 말"
                        />
                    </label>

                    <div className="modal-actions">
                        <button className="button secondary" onClick={onClose}>닫기</button>
                        <button className="button" onClick={save} disabled={saving}>
                            {saving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default BookDetailModal