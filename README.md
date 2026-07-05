# DocSync — Local-First Collaborative Document Editor

A production-ready collaborative document editor built with Next.js 16, featuring offline-first storage, real-time collaboration, conflict resolution, and AI-assisted writing.

**Live Demo:** [your-deployment-url.vercel.app]()  
**Built by:** [Your Name](https://github.com/yourusername) · [LinkedIn](https://linkedin.com/in/yourusername)

---

## Features

- **Offline-first** — documents load and save from IndexedDB with zero network dependency
- **Background sync** — queued changes push to the server automatically on reconnect
- **Conflict resolution** — 3-way merge at the paragraph level; server wins on collision
- **Real-time collaboration** — live presence, typing indicators via Socket.IO
- **Version history** — manual snapshots with restore; auto-snapshot before every restore
- **Role-based access** — Owner, Editor, Viewer enforced at API and socket level
- **AI features** — grammar fix, summarize, title generation via Groq (llama3-8b)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React, Tiptap, Tailwind CSS, Shadcn UI
- **Backend:** Node.js custom server, Socket.IO, Auth.js, Prisma 7
- **Database:** PostgreSQL
- **Storage:** IndexedDB via Dexie
- **AI:** Groq SDK (llama3-8b-8192)

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd edtech-editor
npm install

# 2. Set environment variables
cp .env.local.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, AUTH_URL, GROQ_API_KEY

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random string ≥ 32 chars for JWT signing |
| `AUTH_URL` | Base URL of the app (e.g. `http://localhost:3001`) |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) — free tier available |

## Deployment

Deploy to Vercel by connecting the GitHub repo. Add all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

Note: Socket.IO requires a persistent server. Vercel Serverless doesn't support this — deploy the custom server to **Railway** or **Render** instead, then point your domain there.

## Architecture Notes

**Offline sync flow:**
1. Every keystroke saves to IndexedDB after 800ms debounce
2. Each save enqueues an op in `pendingOps` IDB table
3. On reconnect, `useSync` collapses all pending ops into one POST to `/api/documents/[docId]/sync`
4. Server compares base clock — clean apply if clocks match, 3-way merge if diverged
5. Result broadcast to all room members via Socket.IO

**Conflict resolution:**
- HTML split into block-level elements (p, h2, li, etc.)
- If only one side changed a block → that change wins
- If both sides changed the same block → server wins (deterministic, no data loss)
