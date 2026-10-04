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
            <h2>AI 취향 추천</h2>

            <div style={{ marginBottom: 16}}>
                {CATEGORIES.map(c => (
                    <button
                        key={c.label}
                        disabled={category === c.value}
                        onClick={() => setCategory(c.value)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {loading && <p>취향을 분석하고 추천 이유를 쓰는 중이에요... (몇 초 걸려요)</p>}

            {!loading && !entry && (
                <div>
                    { error && <p>추천을 불러오지 못했어요.</p> }
                    <button onClick={fetchRecommend}>AI 추천 받기</button>
                </div>

            )}

            {!loading && entry && (

                <div>
                    <div style={{ marginBottom: 12, fontSize: 12, color: 'gray' }}>
                        {entry.savedAt} 기준 추천{' '}
                        <button onClick={fetchRecommend}>다시 추천받기</button>
                    </div>

                {reasonFailed && (
                <p>AI 서버가 혼잡해서 추천 이유를 만들지 못했어요. 잠시 후 '다시 추천받기'를 눌러 주세요.</p>
                )}

                {entry.items.length === 0 ? (
                    <p>이 카테고리의 책을 서재에 담고 평점을 남기면 추천해 드려요.</p>
                ) : (
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {entry.items.map(r => (
                            <li key={r.bookId} style={{
                                display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid #ddd'
                            }}>
                                <div style={{ width: 90, flexShrink: 0 }}>
                                    {r.coverUrl && (
                                        <img src={r.coverUrl} alt={r.title} style={{
                                            width: '100%', aspectRatio: '2 / 3', objectFit: 'cover'
                                        }}/>
                                    )}
                                </div>
                                <div style={{ width: 200, flexShrink: 0 }}>
                                    <strong>{r.title}</strong>
                                    <div>{r.author ?? '작가 미상'}</div>
                                    {r.category && <div style={{ fontSize: 12, color: 'gray' }}>{r.category}</div>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    {r.reason ? `💡 ${r.reason}` : <span style={{ color: 'gray'}}>추천 이유 없음</span> }
                                </div>
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