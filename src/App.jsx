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
    <main className="journal-shell min-h-screen px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-3xl">
        <header className="journal-header mb-9 text-center sm:mb-12">
          <div className="journal-flower mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
            🌷
          </div>
          <p className="journal-eyebrow mb-2 text-xs font-bold uppercase tracking-[0.24em]">
            A little space for you
          </p>
          <h1 className="journal-title text-3xl font-bold tracking-tight sm:text-4xl">
            오늘의 마음 일기
          </h1>
          <p className="journal-subtitle mt-3 text-sm leading-6 sm:text-base">
            지금 느끼는 마음을 있는 그대로 적어보세요.
          </p>
        </header>

        <section
          aria-labelledby="write-title"
          className="paper-card write-card rounded-3xl p-5 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="write-icon flex h-9 w-9 items-center justify-center rounded-xl text-lg">
              ✍️
            </span>
            <div>
              <h2 id="write-title" className="section-title font-bold">
                지금 어떤 기분인가요?
              </h2>
              <p className="section-caption mt-0.5 text-xs">
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
                        : 'emotion-unselected border-stone-100 text-stone-500 hover:border-rose-200 hover:bg-rose-50'
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
              className="journal-textarea w-full resize-y rounded-2xl px-4 py-4 text-sm leading-7 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 sm:px-5"
            />
            <div className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <p className="section-caption text-xs">
                당신의 마음을 천천히 들여다보는 시간
              </p>
              <button
                type="submit"
                disabled={saving || !content.trim() || !selectedEmotion}
                className="save-button rounded-xl px-6 py-3 text-sm font-bold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '일기 저장하기  ✿'}
              </button>
            </div>
          </form>
        </section>

        <section aria-labelledby="entries-title" className="diary-entries mt-10 sm:mt-12">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="journal-eyebrow mb-1 text-xs font-bold uppercase tracking-[0.18em]">
                Your moments
              </p>
              <h2
                id="entries-title"
                className="section-title text-xl font-bold sm:text-2xl"
              >
                마음 기록
              </h2>
            </div>
            <span className="record-count rounded-full px-3 py-1.5 text-xs font-medium">
              {diaries.length}개의 기록
            </span>
          </div>

          <div
            aria-label="감정별 일기 필터"
            className="journal-filters mb-5 flex gap-2 overflow-x-auto pb-2"
          >
            <button
              type="button"
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === 'all' ? 'filter-active' : 'filter-inactive'
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
                    ? 'filter-active'
                    : 'filter-inactive'
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
              className="paper-note mb-5 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm"
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
              className="paper-card flex min-h-44 flex-col items-center justify-center rounded-3xl text-sm text-stone-500"
            >
              <span className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
              일기를 불러오고 있어요...
            </div>
          ) : filteredDiaries.length === 0 ? (
            <div className="empty-page rounded-3xl px-6 py-12 text-center">
              <span className="text-4xl" aria-hidden="true">
                {filter === 'all' ? '📔' : emotionByValue[filter].emoji}
              </span>
              <p className="section-title mt-4 font-semibold">
                {filter === 'all'
                  ? '아직 기록이 없어요'
                  : `${emotionByValue[filter].label} 기록이 아직 없어요`}
              </p>
              <p className="section-caption mt-1 text-sm">
                오늘의 마음을 첫 일기로 남겨보세요.
              </p>
            </div>
          ) : (
            <div className="diary-stack space-y-3">
              {filteredDiaries.map((diary) => {
                const emotion = emotionByValue[diary.emotion]

                return (
                  <article
                    key={diary.id}
                    className={`diary-card diary-card-${diary.emotion} rounded-2xl p-5 transition sm:p-6`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="diary-emotion flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl">
                          {emotion?.emoji ?? '💭'}
                        </span>
                        <div className="min-w-0">
                          <p className="section-title text-sm font-bold">
                            {emotion?.label ?? '마음 기록'}
                          </p>
                          <time
                            dateTime={diary.created_at}
                            className="diary-date mt-0.5 block truncate text-xs"
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
                        className="delete-button shrink-0 rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50"
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
                    <p className="diary-content whitespace-pre-wrap break-words text-sm leading-7">
                      {diary.content}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <footer className="journal-footer mt-12 text-center text-xs">
          <span aria-hidden="true">✷</span>
          <span>오늘의 마음도 소중한 당신의 일부예요.</span>
          <span aria-hidden="true">✷</span>
        </footer>
      </div>
    </main>
  )
}

export default App
