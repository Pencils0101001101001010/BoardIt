# BoardIt

A style whiteboard where you can add links and images on a canvas to plan out events, drag them around, and save them for later. Built with the PERN stack (PostgreSQL, Express, React, Node.js) plus TypeScript on the frontend.

## Status of project

**Development**

## Features

- User accounts with JWT authentication
- Multiple boards per user
- Positions persist automatically to the database

## Tech Stack

- **Frontend:** React (Vite) + TypeScript, `@dnd-kit` for drag-and-drop, `react-router-dom`
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
- **Auth:** JWT + bcrypt

## Prerequisites

- Node.js v18+
- A PostgreSQL database (local or hosted, e.g. Neon)

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
  type VARCHAR(10) NOT NULL CHECK (type IN ('link', 'image')),
  url TEXT NOT NULL,
  title TEXT,
  thumbnail_url TEXT,
  pos_x FLOAT NOT NULL DEFAULT 100,
  pos_y FLOAT NOT NULL DEFAULT 100,
  width FLOAT NOT NULL DEFAULT 220,
  height FLOAT NOT NULL DEFAULT 220,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_items_board_id ON items(board_id);
```

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

Visit `http://localhost:5173`, register an account, and start adding links/images to your board.

## API Overview

All `/api/boards` and `/api/items` routes require an `Authorization: Bearer <token>` header.

| Method | Route                        | Description                            |
| ------ | ---------------------------- | -------------------------------------- |
| POST   | `/api/auth/register`         | Create an account                      |
| POST   | `/api/auth/login`            | Log in                                 |
| GET    | `/api/auth/me`               | Get current user                       |
| GET    | `/api/boards`                | List your boards                       |
| POST   | `/api/boards`                | Create a board                         |
| DELETE | `/api/boards/:id`            | Delete a board                         |
| GET    | `/api/boards/:boardId/items` | List items on a board                  |
| POST   | `/api/boards/:boardId/items` | Add an item to a board                 |
| PATCH  | `/api/items/:id`             | Update an item (position, size, title) |
| DELETE | `/api/items/:id`             | Delete an item                         |

## Roadmap

- Real link previews (OpenGraph scraping)
- Direct image uploads (not just image URLs)

## License

MIT
