# 오늘의 마음 일기

하루의 감정과 생각을 기록하고, Supabase에 저장된 일기를 여러 기기에서 확인하는 반응형 웹앱입니다. 감정별 기록 필터와 일기 삭제를 지원하며, 작성·삭제 후 목록을 다시 조회합니다.

## 실행 방법

1. `.env.example`을 복사해 `.env.local` 파일을 만들고 Supabase 프로젝트 값을 입력합니다.

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

2. Supabase 프로젝트에 `diaries` 테이블과 앱에 맞는 접근 정책이 준비되어 있는지 확인합니다.
3. 의존성을 설치하고 개발 서버를 실행합니다.

   ```bash
   npm install
   npm run dev
   ```

## 데이터와 보안

일기 데이터는 Supabase `diaries` 테이블의 `id`, `content`, `emotion`, `created_at` 컬럼에 저장됩니다. 브라우저 저장소를 사용하지 않으므로 같은 Supabase 프로젝트에 연결된 기기에서는 동일한 기록을 조회할 수 있습니다.

브라우저 앱의 `VITE_` 환경변수는 빌드 결과물에서도 확인할 수 있습니다. Supabase publishable key는 공개 클라이언트용 키이며, 데이터 접근을 보호하는 경계는 데이터베이스 권한과 올바르게 설정된 RLS 정책입니다. 실제 사용자별 비공개 일기에는 사용자 인증과 행 단위 접근 정책이 필요합니다. 비밀 키나 `service_role` 키를 프런트엔드에 넣지 마세요.

## 기술

React, Vite, Tailwind CSS, Supabase JavaScript client
