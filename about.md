# About Vidiopintar.com

Here’s a high‑level tour of the Vidiopintar.com project:

1. **What is Vidiopintar.com?**

   - An interactive video learning platform: paste a YouTube URL and get a smart dashboard with transcript navigation, chat, notes, and quizzes.
   - Enhances YouTube videos with AI-powered tools for deeper learning: searchable transcripts, chat Q&A, timestamped notes, and on-demand quizzes.
   - Designed for students, educators, and autodidacts who want to learn more efficiently from online video content.

2. **Core features**

   - **YouTube video import:** Paste a link to auto-fetch metadata and transcript.
   - **Interactive transcript:** Scroll, search, and jump to any part of the video. Auto-generated chapters for easy navigation.
   - **AI chat:** Ask questions about the video; chat history is persisted and context-aware.
   - **Notes:** Take timestamped notes tied to transcript positions for easy review.
   - **Quizzes:** Generate AI-powered quizzes on demand from transcript content.
   - **Persistent storage:** All data (transcripts, notes, chats, quizzes) stored in PostgreSQL via Drizzle ORM.
   - **Modern, responsive UI:** Built with React, TypeScript, and Tailwind CSS for a clean, distraction-free experience.

3. **Tech stack**

   - **Frontend:** Next.js (App Router, React Server Components), React, TypeScript, Tailwind CSS, Shadcn/ui
   - **Backend:** Next.js API routes and server actions, Drizzle ORM, PostgreSQL
   - **AI/External:** OpenAI for chat and quizzes, external APIs for YouTube metadata/transcripts
   - **DevOps:** Docker, docker-compose, GitHub Actions for CI/CD, Drizzle Kit for migrations

4. **Repo layout**

   ```
   /
   ├─ app/                ← Next.js routes, API endpoints, server actions
   │   ├─ page.tsx        ← Home page (YouTube URL input)
   │   ├─ video/[videoId]/page.tsx  ← Main dashboard
   │   ├─ api/            ← API routes (chat, notes, quizzes)
   │   └─ actions/        ← Server-side helpers
   ├─ components/         ← UI components (player, transcript, chat, notes, quizzes)
   │   └─ ui/             ← Shared UI primitives
   ├─ lib/                ← Core logic
   │   ├─ youtube.ts      ← Fetch/upsert video details & transcripts
   │   ├─ storage.ts      ← Chat, notes, quizzes persistence
   │   └─ db/             ← Drizzle schema & repositories
   ├─ drizzle/            ← SQL migrations
   ├─ public/             ← Static assets
   ├─ Dockerfile & docker-compose.yml
   ├─ tailwind.config.ts  ← Theme & design system
   └─ .env, README.md, about.md
   ```

5. **Running locally**

   - **Prereqs:** Node.js >=18, Docker (for easy DB setup)
   - **Quickstart:**
     ```bash
     cp .env.example .env      # Set up your environment variables
     docker-compose up --build # Start Postgres and the app
     # or for local dev:
     npm install
     npx drizzle-kit migrate:up
     npm run dev
     ```
   - Visit [http://localhost:3000](http://localhost:3000) and paste a YouTube URL to begin.

6. **Documentation & next steps**

   - **Database:** See `/lib/db/schema` for the Drizzle ORM table definitions.
   - **Transcript logic:** Review `lib/youtube.ts` and `fetchVideoTranscript` for how transcripts are fetched and stored.
   - **Chat/AI:** Explore `components/chat-interface.tsx` and `app/api/chat/route.ts` for OpenAI integration.
   - **Customizing:** Tweak `tailwind.config.ts` for theming, or extend `/components` for new UI features.
   - **API samples:** See `/app/api` for REST endpoints powering chat, notes, and quizzes.

---

Feel free to explore any area in depth—whether it’s the database, the API, or the UI—and ask for a walkthrough or code deep-dive!


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