# LocalHub Frontend

LocalHub의 Vue 프론트엔드입니다. 대전/충청권 관광 장소 탐색, 추천, 지도 상세, 게시판, AI 채팅 화면을 제공하며 백엔드 API와 연동해 데이터를 조회합니다.

## 주요 화면

- 랜딩 화면
- 홈/추천 화면
- 장소 목록 및 카테고리 탐색
- 지도 기반 장소 상세 화면
- 게시글 목록, 작성, 상세 화면
- AI 채팅 화면

## 기술 스택

- Vue 3
- Vite
- Vue Router
- Pinia
- Axios

## 서버 실행 방법

PowerShell 기준입니다.

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

개발 서버가 실행되면 아래 주소에서 확인할 수 있습니다.

- Frontend: http://localhost:5173

## 환경 변수

`.env.example`을 복사해 `.env`를 만든 뒤 백엔드 API 주소를 확인합니다.

```env
VITE_API_BASE_URL=http://localhost:8000
```

백엔드 서버를 다른 포트에서 실행하는 경우 이 값을 해당 주소로 변경해야 합니다.

## 백엔드 연동

프론트엔드는 기본적으로 `http://localhost:8000`의 백엔드 API를 호출합니다. 전체 기능을 확인하려면 백엔드 서버를 먼저 실행하고, 필요한 경우 장소 데이터를 시드한 뒤 프론트엔드 개발 서버를 실행합니다.

```powershell
cd ..\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

## 빌드 및 미리보기

```powershell
cd frontend
npm run build
npm run preview
```
