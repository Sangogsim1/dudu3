# AI Character Dress-Up

Vite + React + TypeScript app with Tailwind and an Edge Function for Gemini.

## Local Development

1. Install dependencies:
   - `npm install`
2. Create a `.env` file with:
   - `GEMINI_API_KEY=your_key_here`
3. Run dev server:
   - `npm run dev`

## Deploy (Vercel)

- Set `GEMINI_API_KEY` in Project Settings → Environment Variables.
- Deploy; Vercel builds the static site and `api/gemini-dress.ts` Edge Function.

### Checklist
- [ ] 저장소에 커밋/푸시 완료
- [ ] `GEMINI_API_KEY` 환경변수 설정
- [ ] `vercel.json` 포함 확인 (Edge Function 설정)
- [ ] 빌드 스크립트 정상 (`npm run vercel-build`)
- [ ] `public/` 파비콘/robots 존재

## Notes

- The API expects base64 images and returns a base64 data URL for display.
