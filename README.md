# BoardIt

A mood-board where you can drop links, images, and headers on a canvas, drag and resize them, and save it all for later. Built with the PERN stack (PostgreSQL, Express, React, Node.js), with TypeScript on the frontend.

## Features

- User accounts with JWT authentication
- Multiple boards per user, switchable from a sidebar
- Resizable cards via a drag handle
- Direct image uploads (stored on Cloudinary) as well as pasted image/link URLs
- Editable text headers with adjustable font size and color, always rendered above other cards
- Cards keep a per-session stacking order — clicking/dragging brings a card to the front
- Board sharing: invite other users as an editor or viewer, with permission-aware UI and API

## Tech Stack

- **Frontend:** React (Vite) + TypeScript, `@dnd-kit` for drag-and-drop, `react-router-dom`
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
- **File storage:** Cloudinary (for uploaded images)
- **Auth:** JWT + bcrypt

## Prerequisites

- Node.js v18+
- A PostgreSQL database (local or hosted, e.g. Neon)
- A free [Cloudinary](https://cloudinary.com) account (only needed for direct image uploads)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Pencils0101001101001010/BoardIt.git
cd boardit

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/boardit?sslmode=require
JWT_SECRET=your_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Set up the database

Run the schema against your database (via `psql` or your provider's SQL editor):

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'My Board',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('link', 'image', 'header')),
  url TEXT NOT NULL,
  title TEXT,
  thumbnail_url TEXT,
  pos_x FLOAT NOT NULL DEFAULT 100,
  pos_y FLOAT NOT NULL DEFAULT 100,
  width FLOAT NOT NULL DEFAULT 220,
  height FLOAT NOT NULL DEFAULT 220,
  font_size INTEGER DEFAULT 24,
  color VARCHAR(20) DEFAULT '#222222',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE board_collaborators (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (board_id, user_id)
);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_items_board_id ON items(board_id);
CREATE INDEX idx_collaborators_board_id ON board_collaborators(board_id);
CREATE INDEX idx_collaborators_user_id ON board_collaborators(user_id);
```

> If you're upgrading an existing database rather than starting fresh, apply these as migrations instead — see [Migration notes](#migration-notes-for-existing-databases) below.

### 4. Run the app

In two terminals:

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Visit `http://localhost:5173`, register an account, and start adding links/images/headers to your board.

## API Overview

All `/api/boards` and `/api/items` routes require an `Authorization: Bearer <token>` header.

| Method | Route                                        | Description                                                        |
| ------ | -------------------------------------------- | ------------------------------------------------------------------ |
| POST   | `/api/auth/register`                         | Create an account                                                  |
| POST   | `/api/auth/login`                            | Log in                                                             |
| GET    | `/api/auth/me`                               | Get current user                                                   |
| GET    | `/api/boards`                                | List boards you own or collaborate on                              |
| POST   | `/api/boards`                                | Create a board                                                     |
| DELETE | `/api/boards/:id`                            | Delete a board (owner only)                                        |
| GET    | `/api/boards/:boardId/items`                 | List items on a board                                              |
| POST   | `/api/boards/:boardId/items`                 | Add a link/image/header item to a board                            |
| POST   | `/api/boards/:boardId/items/upload`          | Upload an image file directly (multipart/form-data, field `image`) |
| PATCH  | `/api/items/:id`                             | Update an item (position, size, title, font size, color)           |
| DELETE | `/api/items/:id`                             | Delete an item                                                     |
| POST   | `/api/boards/:boardId/share`                 | Invite a collaborator by email (owner only)                        |
| GET    | `/api/boards/:boardId/collaborators`         | List a board's collaborators                                       |
| DELETE | `/api/boards/:boardId/collaborators/:userId` | Remove a collaborator (owner only)                                 |

**Access levels:** each board request checks whether the caller is the **owner**, an **editor**, or a **viewer** (via collaborator role). Viewers can read but not create/update/delete items or invite others.

## Deployment

Live setup: **frontend on Vercel**, **backend on Render**, **database on Neon**.

1. Push the repo to GitHub.
2. **Backend → Render:** new Web Service, root directory `server`, build `npm install`, start `npm start`. Add all `server/.env` variables (including `CLIENT_URL` set to your deployed frontend origin) as environment variables.
3. **Frontend → Vercel:** new project, root directory `client`. Add `VITE_API_URL` pointing at your Render backend's `/api` path.
4. Update CORS in `server/src/index.js` to read `CLIENT_URL` from the environment rather than allowing all origins.

Notes from getting this running in practice:

- Render's free tier spins down when idle — the first request after inactivity will be slow (cold start).
- Neon's serverless compute also suspends when idle — expect the first DB query after a period of inactivity to take several seconds.
- Both `pg`'s SSL connection to Neon and Node's dual-stack (IPv4/IPv6) connection behavior can be slow on some networks; `server/src/db.js` sets `ssl: { rejectUnauthorized: false }` and a longer `connectionTimeoutMillis`, and calls `net.setDefaultAutoSelectFamilyAttemptTimeout(10000)` to avoid premature connection timeouts.
- Schema changes (new tables/columns) must be run manually against whichever database `DATABASE_URL` points to in each environment — pushing code does not apply SQL changes.

## Roadmap

- Real link previews (OpenGraph scraping) instead of raw URLs as titles
- Real-time sync between collaborators (websockets or polling)
- Click-and-drag panning (not just scroll) on the canvas
- Invite collaborators by email even if they don't have an account yet

## License

MIT
