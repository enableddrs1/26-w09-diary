# 오늘의 마음 일기 🌷

하루의 감정과 생각을 차곡차곡 적어두는 반응형 감정 일기 웹앱입니다. 파스텔 스크랩북 스타일의 화면에서 감정을 골라 일기를 작성하고, 감정별로 기록을 모아볼 수 있어요. 기록은 Supabase에 저장되어 같은 프로젝트에 연결된 기기에서 확인할 수 있습니다.

## 주요 기능

- 😊 기쁨 · 😌 평온 · 😢 슬픔 · 😠 화남 · 😰 불안, 다섯 가지 감정으로 일기 작성
- 최신순 일기 목록, 감정별 필터 및 일기 삭제
- 로딩, 저장 중, 빈 목록, 오류 상태 표시
- 모바일과 데스크톱에 대응하는 Tailwind CSS 반응형 UI
- 작성·삭제 후 목록을 다시 불러오는 기본 CRUD 방식 (Realtime 구독 미사용)

## 시작하기

### 준비 사항

- Node.js와 npm
- Supabase 프로젝트 및 `diaries` 테이블

### 환경변수 설정

프로젝트 루트에서 `.env.example`을 `.env.local`로 복사한 뒤, Supabase 프로젝트의 URL과 **publishable key**를 입력합니다.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`.env.local`은 Git에 커밋하지 마세요. 환경변수를 변경했다면 Vite 개발 서버를 다시 시작해야 합니다.

### 설치 및 실행

```bash
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 여세요.

### 확인 명령

```bash
npm run lint
npm run build
npm run preview
```

## Supabase 데이터

앱은 `diaries` 테이블을 사용합니다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `bigint` | 자동 생성되는 일기 ID |
| `content` | `text` | 일기 본문 |
| `emotion` | `text` | `joy`, `calm`, `sad`, `angry`, `anxious` 중 하나 |
| `created_at` | `timestamptz` | 작성 일시 (DB 기본값) |

목록은 `created_at` 내림차순으로 조회합니다. 이 앱은 브라우저의 `localStorage`가 아니라 Supabase를 데이터 저장소로 사용합니다.

## 보안 참고

`VITE_` 접두사가 붙은 값은 브라우저에서 사용되므로 배포된 앱에서도 확인할 수 있습니다. Supabase publishable key는 공개 클라이언트용 키이며, 실제 데이터 접근은 데이터베이스 권한과 RLS(Row Level Security) 정책으로 제한해야 합니다. 테이블에 필요한 읽기·추가·삭제 권한을 설정하고, 사용자별 비공개 기록이 필요하다면 인증과 사용자 ID 기반 RLS 정책을 구성하세요. `service_role` 키나 다른 비밀 키를 프런트엔드 환경변수에 넣으면 안 됩니다.

## 기술 스택

- React
- Vite
- Tailwind CSS
- Supabase JavaScript client

## 프로젝트 구조

```text
src/
├── api/diaries.js       # 일기 조회·추가·삭제
├── lib/supabase.js      # Supabase 클라이언트 초기화
├── App.jsx              # 일기 작성 및 목록 화면
├── App.css              # 스크랩북 장식 스타일
└── index.css            # Tailwind 및 전역 스타일
```

실습 절차와 배포 안내는 [`guide.md`](./guide.md)를 참고하세요.
