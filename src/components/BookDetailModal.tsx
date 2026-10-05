import { useEffect, useState } from "react";
import axios from "axios";
import type { Book, UserBook } from "../types.ts";
import { STATUS_LABEL } from "../constants.ts";

interface Props {
    userBook: UserBook
    onClose: () => void
    onSaved: () => void
}

function BookDetailModal({ userBook, onClose, onSaved }: Props) {
    const [synopsis, setSynopsis] = useState<string | null>(null)
    const [memo, setMemo] = useState(userBook.memo ?? '')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        axios.get<Book>(`/api/books/${userBook.bookId}`)
            .then(res => setSynopsis(res.data.synopsis ?? ''))
            .catch(() => setSynopsis(''))
    }, [userBook.bookId])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const saveMemo = () => {
        setSaving(true)
        axios.patch(`/api/library/${userBook.id}`, {memo})
            .then(() => { onSaved(); onClose() })
            .catch(() => alert('메모를 저장하지 못했어요.'))
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
                    <span className="riboon" data-status={userBook.status} />
                </div>

                <div>
                    <h3 className="book-title modal-title">{userBook.title}</h3>
                    <div className="book-meta">{userBook.author ?? '작가 미상'}</div>
                    <div className="book-meta">{userBook.platformName} / {STATUS_LABEL[userBook.status]}</div>
                    {userBook.rating !== null && <div className="book-meta">{'★'.repeat(userBook.rating)}</div>}

                    <p className="synopsis">
                        {synopsis === null ? '줄거리를 불러오는 중...' : synopsis || '등록된 줄거리가 없어요.'}
                    </p>
                </div>

                <div className="modal-memo">
                    <label htmlFor="memo" className="book-meta">메모</label>
                    <textarea
                        id="memo"
                        className="field"
                        value={memo}
                        onChange={e => setMemo(e.target.value)}
                        placeholder="이 책에 대해 남기고 싶은 말"
                    />
                    <div className="modal-actions">
                        <button className="button secondary" onClick={onClose}>닫기</button>
                        <button className="button" onClick={saveMemo} disabled={saving}>
                            {saving ? '저장 중...' : '메모 저장'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default BookDetailModal