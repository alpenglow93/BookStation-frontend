import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import axios from "axios";
import type { Platform, ReadingStatus } from "../types.ts";
import { STATUS_LABEL } from "../constants.ts";
import { clearRecommendCache } from "../recommendCache.ts";

const CATEGORY_OPTIONS = ['로판 웹소설', '로판 e북', '로맨스 웹소설', '로맨스 e북', '판타지 웹소설', '판타지 e북']
const ADD_STATUSES: ReadingStatus[] = ['UNREAD', 'READING', 'COMPLETED', 'WISHLIST']

interface Props {
    platforms: Platform[]
    onClose: () => void
}

function ManualBookForm({ platforms, onClose }: Props) {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [genre, setGenre] = useState('')
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0])
    const [synopsis, setSynopsis] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [platformId, setPlatformId] = useState<number | null>(platforms[0]?.id ?? null)
    const [status, setStatus] = useState<ReadingStatus>('UNREAD')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if(e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose]);

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault()
        if(!title.trim() || platformId === null) return

        setSaving(true)
        axios.post('/api/books', {
            title: title.trim(),
            author: author.trim() || null,
            genre: genre.trim() || null,
            category,
            synopsis: synopsis.trim() || null,
            coverUrl: coverUrl.trim() || null,
            platformId,
            status
        })
            .then(() => {
                clearRecommendCache()
                alert(`[${title.trim()}] 을(를) 등록하고 서재에 담았어요.`)
                onClose()
            })
            .catch(err => {
                if(err.response?.status === 404) alert('제목과 구매처는 꼭 입력해 주세요.')
                else alert('등록에 실패했어요.')
            })
            .finally(() => setSaving(false))
    }

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <form
                className="modal form-modal"
                role="dialog"
                aria-modal="true"
                aria-label="도서 직접 등록"
                onClick={e => e.stopPropagation()}
                onSubmit={ handleSubmit }
            >
                <h3 className="modal-title">도서 직접 등록</h3>
                <p className="book-meta">줄거리를 입력하면 AI 추천에도 반영돼요.</p>

                <label className="form-row">
                    제목 (필수)
                    <input className="field" value={title} onChange={e => setTitle(e.target.value)} required />
                </label>

                <div className="form-grid">
                    <label className="form-row">
                        작가
                        <input className="field" value={author} onChange={e => setAuthor(e.target.value)} />
                    </label>
                    <label className="form-row">
                        장르
                        <input className="field" value={genre} onChange={e => setGenre(e.target.value)} placeholder="예: 서양풍 로판" />
                    </label>
                    <label className="form-row">
                        카테고리
                        <select className="field" value={category} onChange={e => setCategory(e.target.value)}>
                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </label>
                    <label className="form-row">
                        구매처
                        <select className="field" value={platformId ?? ''} onChange={e => setPlatformId(Number(e.target.value))}>
                            {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </label>
                    <label className="form-row">
                        상태
                        <select className="field" value={status} onChange={e => setStatus(e.target.value as ReadingStatus)}>
                            {ADD_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                    </label>
                    <label className="form-row">
                        표지 이미지 URL
                        <input className="field" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} />
                    </label>
                </div>

                <label className="form-row">
                    줄거리
                    <textarea className="field" value={synopsis} onChange={e => setSynopsis(e.target.value)} />
                </label>

                <div className="modal-actions">
                   <button type="button" className="button secondary" onClick={onClose}>취소</button>
                    <button type="submit" className="button" disabled={saving}>
                        {saving ? '등록 중...' : '등록하고 서재에 담기'}
                    </button>
                </div>
            </form>
        </div>
    )
}
export default ManualBookForm