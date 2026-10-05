import { useState } from 'react'
import axios from 'axios'
import type { Recommendation } from "../types.ts"
import { readCache, writeCache } from "../recommendCache.ts"
import type { CacheEntry } from "../recommendCache.ts"

const CATEGORIES: { label: string; value: string | null}[] = [
    { label: '전체', value: null},
    { label: '로판', value: '로판'},
    { label: '로맨스', value: '로맨스'},
    { label: '판타지', value: '판타지'}
]

const keyOf = (category: string | null) => category ?? 'ALL'

function RecommendPage() {
    const [category, setCategory] = useState<string | null>(null)
    const [cache, setCache] = useState<Record<string, CacheEntry>>(() => readCache())
    const [loadingKey, setLoadingKey] = useState<string | null>(null)
    const [errorKey, setErrorKey] = useState<string | null>(null)

    const key = keyOf(category)
    const entry = cache[key]
    const loading = loadingKey === key
    const error = errorKey === key

    const fetchRecommend = () => {
        const targetKey = key
        setLoadingKey(targetKey)
        setErrorKey(null)

        axios.get<{ list: Recommendation[] }>('/api/recommendations', {
            params: { category: category ?? undefined, limit: 10}
        })
            .then(res => {
                const items = res.data.list
                const newEntry: CacheEntry = {items, savedAt: new Date().toLocaleString() }
                const hasReason = items.some(r => r.reason)

                setCache(prev => {
                    const next = { ...prev, [targetKey]: newEntry }
                    if(hasReason) writeCache(next)
                    return next
                })
            })
            .catch(() => setErrorKey(targetKey))
            .finally(() => setLoadingKey(k => (k === targetKey ? null : k)))
    }

    const reasonFailed = entry && entry.items.length > 0 && entry.items.every(r => !r.reason)

    return (
        <div>
            <h2 className="page-title">AI 취향 추천</h2>

            <div className="tabs">
                {CATEGORIES.map(c => (
                    <button
                        key={c.label}
                        className="tab"
                        aria-pressed={category === c.value}
                        onClick={() => setCategory(c.value)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {loading && <p className="notice">서재를 바탕으로 취향을 분석하고 추천 이유를 쓰는 중이에요. 몇 초 걸려요.</p>}

            {!loading && !entry && (
                <div>
                    {error && <p className="notice">추천을 받지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
                    <p className="notice">내 서재의 책과 평점을 바탕으로 비슷한 작품을 골라 드려요.</p>
                    <button className="button" onClick={fetchRecommend}>AI 추천 받기</button>
                </div>
            )}

            {!loading && entry && (
                <div>
                    <div className="recommend-head">
                        <span>{entry.savedAt}에 받은 추천</span>
                        <button className="button secondary small" onClick={fetchRecommend}>다시 추천받기</button>
                    </div>

                    {reasonFailed && (
                        <p className="notice">AI 서버가 응답하지 않아 추천 이유를 만들지 못했어요. 잠시 후 '다시 추천받기'를 눌러 주세요.</p>
                    )}

                    {entry.items.length === 0 ? (
                        <p className="notice">이 카테고리의 책을 서재에 담고 평점을 남기면 추천해 드려요.</p>
                    ) : (
                        <ul className="recommend-list">
                            {entry.items.map(r => (
                                <li key={r.bookId} className="recommend-row">
                                    <div className="cover">
                                        {r.coverUrl && <img src={r.coverUrl} alt="" />}
                                    </div>
                                    <div>
                                        <div className="book-title">{r.title}</div>
                                        <div className="book-meta">{r.author ?? '작가 미상'}</div>
                                        {r.category && <div className="book-meta">{r.category}</div>}
                                    </div>
                                    <p className={r.reason ? 'recommend-reason' : 'recommend-reason empty'}>
                                        {r.reason || '추천 이유를 만들지 못했어요.'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
export default RecommendPage