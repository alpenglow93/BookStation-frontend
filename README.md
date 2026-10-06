# 북스테이션 (BookStation) - Frontend

여러 플랫폼에 흩어진 웹소설과 e북을 한 서재에서 관리하고, 독서 기록으로 AI 추천을 받는 서비스 **북스테이션**의 프론트엔드입니다.

- 백엔드 저장소: [BookStation-backend](https://github.com/alpenglow93/BookStation-backend) (프로젝트 소개, 추천 설계, API는 이쪽에 정리되어 있습니다)

<!-- ![내 서재](docs/library.png) -->

## 기술 스택

React, TypeScript, Vite, axios, react-router-dom

## 화면

| 경로 | 화면 | 기능 |
| --- | --- | --- |
| `/` | 내 서재 | 상태 탭, 카테고리·플랫폼 필터, 제목 검색, 상태·평점 변경, 삭제, 상세 보기(줄거리, 메모) |
| `/books` | 도서 검색 | 제목 검색, 페이지 이동, 구매처와 상태를 골라 서재에 담기, 직접 등록 |
| `/recommend` | AI 추천 | 카테고리별 추천, 책마다 AI가 쓴 추천 이유 |

## 구조

```
src/
├─ pages/
│  ├─ LibraryPage.tsx      내 서재
│  ├─ BookListPage.tsx     도서 검색
│  └─ RecommendPage.tsx    AI 추천
├─ components/
│  ├─ BookDetailModal.tsx  도서 상세, 메모 수정
│  └─ ManualBookForm.tsx  도서 직접 등록
├─ types.ts                API 응답 타입
├─ constants.ts            상태값 한글 표기
├─ recommendCache.ts       추천 결과 저장/무효화
└─ index.css               공용 스타일
```

## 구현 포인트

- **상태를 책갈피 리본으로 표시**: 표지 위 리본 색으로 읽기 상태를 보여줘서, 서재를 훑어보기만 해도 상태를 알 수 있게 했습니다. 상태 색은 `data-status` 속성 하나로 리본과 필터 탭에 함께 적용됩니다.
- **AI 추천 결과 캐시**: AI 호출 횟수를 아끼기 위해 버튼을 눌렀을 때만 추천을 요청하고, 결과를 카테고리별로 `localStorage`에 저장합니다. 서재가 바뀌면 저장된 결과를 지웁니다.
- **느린 응답과 탭 전환**: 추천 응답은 몇 초 걸리기 때문에, 응답을 요청 당시의 카테고리에 저장해 로딩 중 탭을 바꿔도 결과가 섞이지 않게 했습니다.
- **서재 필터는 클라이언트에서 처리**: 서재 데이터는 한 번에 받아 두고 상태·카테고리·플랫폼·제목 필터를 화면에서 처리해, 필터를 바꿀 때마다 API를 호출하지 않습니다.
- **API 타입 정의**: 백엔드 응답 모양을 `types.ts`에 정의해 필드명 오타를 컴파일 단계에서 잡습니다. 상태값은 유니언 타입으로 제한합니다.

## 실행 방법

백엔드 서버(`localhost:8080`)를 먼저 실행한 뒤:

```
npm install
npm run dev
```

`http://localhost:5173`에서 확인할 수 있습니다. 개발 서버가 `/api` 요청을 백엔드로 전달하도록 `vite.config.ts`에 프록시가 설정되어 있습니다.
