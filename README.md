# WatchParty

A synchronized movie-watching platform where users can watch YouTube videos together in real-time, chat while watching, and share rooms via QR codes.

## Features

- Real-time video synchronization (play, pause, seek)
- Live chat while watching
- Friend system with requests
- QR code room sharing
- YouTube video support

## Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript)
- **Backend**: Next.js API routes + Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (credentials)
- **Real-time**: Socket.io
- **Video**: React Player

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:

   Update `.env` with your values:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/watchparty"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
   ```

3. **Set up the database**:
   ```bash
   npm run db:push
   ```

4. **Start the development servers**:

   Run both Next.js and Socket.io servers:
   ```bash
   npm run dev:all
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Next.js
   npm run dev

   # Terminal 2 - Socket.io
   npm run socket
   ```

5. **Open the app**:

   Navigate to [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run socket` - Start Socket.io server
- `npm run dev:all` - Start both servers concurrently
- `npm run build` - Build for production
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Usage

1. Register a new account
2. Login and access your dashboard
3. Create a new watch room
4. Add a YouTube video URL
5. Share the room via QR code or link
6. Watch together with friends!

## Project Structure

```
watchparty/
├── prisma/
│   └── schema.prisma      # Database schema
├── server/
│   └── socket.ts          # Socket.io server
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities (prisma, auth, socket)
│   └── types/             # TypeScript types
└── package.json
```
