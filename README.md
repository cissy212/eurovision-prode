# Eurovision Prode 2026

Predict the Eurovision 2026 Grand Final Top 10, pick your personal favourites, and compete with friends on a private leaderboard.

## Stack

- **Next.js 16** (App Router, Server Actions, proxy)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth magic link)
- **@dnd-kit** (drag-and-drop ranking board)
- **Zod** (validation)

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed-contestants.sql` to populate the 2026 finalists
4. In **Authentication → URL Configuration**, set your Site URL and add `http://localhost:3000/auth/callback` to Redirect URLs

### 2. Environment variables

Copy `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=your-email@example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

| Feature | Description |
|---|---|
| Magic link auth | Email OTP — no passwords |
| Rooms | Create or join a room with a 6-character invite code |
| Predictions | Drag-and-drop Top 10 ranking |
| Favourites | Pick personal favourites separately from your competitive picks |
| Lock | Admin locks predictions before the show starts |
| Results | Admin enters official results; scores computed automatically |
| Leaderboard | Ranked by score with breakdown (top-10 hits + exact matches) |
| Recap | Side-by-side comparison of everyone's predictions vs official |

## Scoring

| Points | Condition |
|---|---|
| +1 | Contestant you picked appears anywhere in the real Top 10 |
| +2 | Bonus: exact rank match |
| 30 | Maximum possible score |

## Routes

```
/                   Landing page
/login              Magic link sign-in
/auth/callback      OAuth callback (handled automatically)
/dashboard          Your rooms
/rooms/[code]       Room home (members, status, invite code)
/rooms/[code]/predict       Drag-and-drop prediction form + favourites
/rooms/[code]/leaderboard   Scores table
/rooms/[code]/results       Admin: enter official Eurovision results
/rooms/[code]/recap         Full side-by-side comparison with confetti 🎉
```

## Deployment

Deploy to Vercel and set the same env vars in the Vercel dashboard. Update `NEXT_PUBLIC_SITE_URL` to your production URL and add it to Supabase's allowed redirect URLs.
