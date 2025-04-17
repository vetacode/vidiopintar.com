# About Vidiopintar.com

Vidiopintar.com is a smart video learning platform that enhances YouTube videos with interactive transcripts, chat, notes, and quizzes.

## What it does
- Paste a YouTube URL to start a learning session.
- Fetches video metadata (title, description, channel) via an external API.
- Retrieves and caches the transcript in PostgreSQL.
- Displays an in‑browser video player with an interactive transcript (auto‑generated chapters).
- Side‑panel chat interface to ask questions about the video (history persisted).
- Note‑taking tied to transcript timestamps.
- On‑demand AI‑generated quizzes based on the transcript.

## Tech Stack
- Next.js 13 (App Router + Server Actions)
- React + TypeScript + Tailwind CSS
- Drizzle ORM + Drizzle‑Kit for migrations and PostgreSQL access
- Docker & docker‑compose for easy local deployment
- External APIs for YouTube data and transcripts

## Getting Started
1. Set your `.env` with `DATABASE_URL` pointing to Postgres.
2. Run `docker-compose up --build` (or `-d`) and visit http://localhost:3000.
3. Alternatively locally:
   - `npm install`
   - `npx drizzle-kit migrate:up` (run migrations)
   - `npm run dev`

## Key Areas of the Code
- `/app` – Next.js routes and Server Actions:
  - `page.tsx` – Home page for URL input.
  - `video/[videoId]/page.tsx` – Main learning dashboard.
  - `/app/actions` – Server-side helpers.
  - `/app/api` – API routes for chat, notes, quizzes.
- `/lib` – Core logic:
  - `youtube.ts` – Fetching and upserting video details & transcripts.
  - `storage.ts` – Chat, notes, quizzes persistence.
  - `db/` – Drizzle schema (`schema/*.ts`) & repository (`repository.ts`).
  - `utils.ts` – Misc utilities (e.g. time formatting).
- `/components` – UI components: player, transcript viewer, chat interface, note & quiz sections.
- `/components/ui` – Shared UI primitives (buttons, inputs, tabs, cards, etc.).
- `/drizzle` + `drizzle.config.ts` – SQL migrations and drizzle‑kit configuration.

## How It Works
1. User submits a YouTube URL → Next.js server action extracts `videoId` & redirects.
2. Video page fetches metadata & transcript (caches into Postgres via Drizzle).
3. Transcript is rendered, chat loads existing messages.
4. Interactions (chat, notes, quizzes) hit Server Actions or API routes → persisted by Drizzle repositories.

## Next Steps for Exploration
- Review `/lib/db/schema` to understand database structure.
- Step through `fetchVideoTranscript` to see transcript-fetch + upsert logic.
- Inspect `ChatInterface` and `app/api/chat/route.ts` for streaming chat with OpenAI.
- Customize the theme in `tailwind.config.ts`.