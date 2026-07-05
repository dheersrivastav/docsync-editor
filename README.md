# DocSync

DocSync is a collaborative document editor built with Next.js. It supports offline editing, background synchronization, real-time collaboration, version history, and AI-powered writing assistance.

The goal of this project is to provide a smooth editing experience where users can continue working even without an internet connection. Once the connection is restored, local changes are synchronized automatically without interrupting the user.

---

## Features

- User authentication with Auth.js
- Create, edit, and manage documents
- Role-based access (Owner, Editor, Viewer)
- Offline-first document editing using IndexedDB
- Automatic background synchronization
- Real-time collaboration with Socket.IO
- Version history with document restore
- AI tools for grammar correction, summarization, and title generation
- Responsive interface built with Tailwind CSS and Shadcn UI

---

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Tiptap Editor

### Backend
- Node.js
- Socket.IO
- Auth.js
- Prisma ORM

### Database
- PostgreSQL

### Local Storage
- IndexedDB (Dexie)

### AI
- Groq API (Llama 3)

---

## Getting Started

Clone the repository

```bash
git clone <repository-url>
cd docsync
```

Install dependencies

```bash
npm install
```

Configure environment variables

```bash
cp .env.local.example .env.local
```

Update the following values:

- DATABASE_URL
- AUTH_SECRET
- AUTH_URL
- GROQ_API_KEY

Run database migrations

```bash
npx prisma migrate dev
```

Start the development server

```bash
npm run dev
```

Open

```
http://localhost:3001
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL database connection |
| AUTH_SECRET | Secret used by Auth.js |
| AUTH_URL | Base application URL |
| GROQ_API_KEY | Groq API key |

---

## Project Structure

```
app/
components/
hooks/
lib/
prisma/
public/
types/
```

The project follows the Next.js App Router structure with reusable components and feature-based organization.

---

## How Offline Sync Works

- Changes are saved locally while editing.
- If the internet is unavailable, users can continue working normally.
- Pending changes are stored in IndexedDB.
- Once the connection is restored, changes are synchronized with the server.
- Connected users receive updates automatically.

---

## Version History

Users can save document snapshots and restore previous versions whenever required. Restoring a version creates a new snapshot to preserve the existing history.

---

## AI Features

- Fix grammar
- Generate document title
- Summarize selected content

---

## Deployment

The application can be deployed on Vercel.

For real-time collaboration, the Socket.IO server should be hosted on a platform that supports persistent WebSocket connections, such as Railway or Render.

---

## Future Improvements

- Presence indicators
- Cursor collaboration
- Richer conflict resolution
- End-to-end testing
- Docker support

---

## Author

**Dheer Srivastava**

GitHub: https://github.com/your-github

LinkedIn: https://linkedin.com/in/your-linkedin