import { useCallback, useEffect, useState } from 'react'
import { createDiary, deleteDiary, fetchDiaries } from './api/diaries.js'
import './App.css'

const emotions = [
  { value: 'joy', label: '기쁨', emoji: '😊', color: 'amber' },
  { value: 'calm', label: '평온', emoji: '😌', color: 'teal' },
  { value: 'sad', label: '슬픔', emoji: '😢', color: 'blue' },
  { value: 'angry', label: '화남', emoji: '😠', color: 'rose' },
  { value: 'anxious', label: '불안', emoji: '😰', color: 'violet' },
]

const emotionByValue = Object.fromEntries(
  emotions.map((emotion) => [emotion.value, emotion]),
)

function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback
}

function App() {
  const [diaries, setDiaries] = useState([])
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [filter, setFilter] = useState('all')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  const loadDiaries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setDiaries(await fetchDiaries())
    } catch (loadError) {
      setError(getErrorMessage(loadError, '일기를 불러오는 중 문제가 발생했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    fetchDiaries()
      .then((loadedDiaries) => {
        if (active) setDiaries(loadedDiaries)
      })
      .catch((loadError) => {
        if (active) {
          setError(
            getErrorMessage(
              loadError,
              '일기를 불러오는 중 문제가 발생했습니다.',
            ),
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedContent = content.trim()

    if (!trimmedContent || !selectedEmotion) return

    setSaving(true)
    setError('')

    try {
      await createDiary({ content: trimmedContent, emotion: selectedEmotion })
      setContent('')
      setSelectedEmotion(null)
      await loadDiaries()
    } catch (saveError) {
      setError(getErrorMessage(saveError, '일기를 저장하는 중 문제가 발생했습니다.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    setError('')

    try {
      await deleteDiary(id)
      await loadDiaries()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, '일기를 삭제하는 중 문제가 발생했습니다.'))
    } finally {
      setDeletingId(null)
    }
  }

  const filteredDiaries =
    filter === 'all'
      ? diaries
      : diaries.filter((diary) => diary.emotion === filter)

  return (
    <main className="min-h-screen px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-9 text-center sm:mb-12">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-3xl shadow-sm">
            🌷
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-rose-500">
            A little space for you
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl">
            오늘의 마음 일기
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-500 sm:text-base">
            지금 느끼는 마음을 있는 그대로 적어보세요.
          </p>
        </header>

        <section
          aria-labelledby="write-title"
          className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(115,75,60,0.3)] sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-lg">
              ✍️
            </span>
            <div>
              <h2 id="write-title" className="font-bold text-stone-800">
                지금 어떤 기분인가요?
              </h2>
              <p className="mt-0.5 text-xs text-stone-400">
                오늘의 감정을 골라주세요
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5 grid grid-cols-5 gap-2 sm:gap-3">
              {emotions.map((emotion) => {
                const isSelected = selectedEmotion === emotion.value

                return (
                  <button
                    key={emotion.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`emotion-choice rounded-2xl border px-1 py-3 text-center transition sm:py-4 ${
                      isSelected
                        ? `selected-${emotion.color} border-current`
                        : 'border-stone-100 bg-stone-50 text-stone-500 hover:border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <span className="block text-2xl sm:text-3xl">
                      {emotion.emoji}
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold sm:text-xs">
                      {emotion.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <label htmlFor="diary-content" className="sr-only">
              오늘의 일기
            </label>
            <textarea
              id="diary-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="무슨 일이 있었나요? 어떤 생각이 들었나요?"
              rows={5}
              className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-4 text-sm leading-7 text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100 sm:px-5"
            />
            <div className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-stone-400">
                당신의 마음을 천천히 들여다보는 시간
              </p>
              <button
                type="submit"
                disabled={saving || !content.trim() || !selectedEmotion}
                className="rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:bg-rose-200"
              >
                {saving ? '저장 중...' : '일기 저장하기'}
              </button>
            </div>
          </form>
        </section>

        <section aria-labelledby="entries-title" className="mt-10 sm:mt-12">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-rose-400">
                Your moments
              </p>
              <h2
                id="entries-title"
                className="text-xl font-bold text-stone-800 sm:text-2xl"
              >
                마음 기록
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-500 shadow-sm">
              {diaries.length}개의 기록
            </span>
          </div>

          <div
            aria-label="감정별 일기 필터"
            className="mb-5 flex gap-2 overflow-x-auto pb-2"
          >
            <button
              type="button"
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-500 hover:bg-rose-50'
              }`}
            >
              전체 보기
            </button>
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                type="button"
                aria-pressed={filter === emotion.value}
                onClick={() => setFilter(emotion.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  filter === emotion.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-stone-500 hover:bg-rose-50'
                }`}
              >
                <span className="mr-1">{emotion.emoji}</span>
                {emotion.label}
              </button>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
            >
              <span aria-hidden="true">⚠️</span>
              <p className="min-w-0 flex-1 leading-6">{error}</p>
              <button
                type="button"
                onClick={loadDiaries}
                className="shrink-0 font-bold underline underline-offset-2"
              >
                다시 시도
              </button>
            </div>
          )}

          {loading ? (
            <div
              role="status"
              className="flex min-h-44 flex-col items-center justify-center rounded-3xl border border-stone-100 bg-white text-sm text-stone-500"
            >
              <span className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
              일기를 불러오고 있어요...
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-rose-200 bg-white/70 px-6 py-12 text-center">
              <span className="text-4xl" aria-hidden="true">
                {filter === 'all' ? '📔' : emotionByValue[filter].emoji}
              </span>
              <p className="mt-4 font-semibold text-stone-700">
                {filter === 'all'
                  ? '아직 기록이 없어요'
                  : `${emotionByValue[filter].label} 기록이 아직 없어요`}
              </p>
              <p className="mt-1 text-sm text-stone-400">
                오늘의 마음을 첫 일기로 남겨보세요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDiaries.map((diary) => {
                const emotion = emotionByValue[diary.emotion]

                return (
                  <article
                    key={diary.id}
                    className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition hover:border-rose-100 sm:p-6"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-2xl">
                          {emotion?.emoji ?? '💭'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-stone-700">
                            {emotion?.label ?? '마음 기록'}
                          </p>
                          <time
                            dateTime={diary.created_at}
                            className="mt-0.5 block truncate text-xs text-stone-400"
                          >
                            {formatDate(diary.created_at)}
                          </time>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label="일기 삭제"
                        disabled={deletingId !== null}
                        onClick={() => handleDelete(diary.id)}
                        className="shrink-0 rounded-lg p-2 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === diary.id ? (
                          <span className="text-xs">삭제 중</span>
                        ) : (
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 20 20"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 5.5h12.5m-10.5 0 .7 10.1a1.5 1.5 0 0 0 1.5 1.4h4.1a1.5 1.5 0 0 0 1.5-1.4l.7-10.1M8 5.5V4.25a1.25 1.25 0 0 1 1.25-1.25h1.5A1.25 1.25 0 0 1 12 4.25V5.5m-3 3v5m2-5v5"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">
                      {diary.content}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-stone-400">
          오늘의 마음도 소중한 당신의 일부예요. 🌱
        </footer>
      </div>
    </main>
  )
}

export default App
