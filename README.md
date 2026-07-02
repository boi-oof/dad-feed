# Dad's Feed 🌊

A bubbly turquoise photo feed. Dad logs in with a password to post a photo +
caption + tags, everyone else just views the public feed. Every photo gets
an automatic date/time stamp — the app sets it on the server, so there's
nothing to fill in.

Two modes:
- **`/`** — the public feed. Anyone with the link can view and filter by tag.
- **`/login` → `/upload`** — Dad's private posting screen, password-protected.

Works great on a phone: the photo picker opens the camera or gallery
directly, and the layout is mobile-first.

---

## 1. Create a free Supabase project (storage + database)

Vercel's servers don't keep files between requests, so photos and posts
live in [Supabase](https://supabase.com) (free tier is plenty for this).

1. Go to supabase.com → New project. Pick any name/region, set a database
   password (you won't need to remember it — it's separate from Dad's app
   password).
2. Once it's created, open **SQL Editor → New query**, paste in the
   contents of `supabase.sql` (included in this project), and run it.
   This creates the `posts` table and a public `photos` storage bucket.
3. Go to **Project Settings → API**. You'll need three values in the next
   step:
   - `Project URL`
https://ekeiqocbxibrdfyixbyq.supabase.co/rest/v1/

   - `anon` `public` key - 
   
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZWlxb2NieGlicmRmeWl4YnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5OTcyMzIsImV4cCI6MjA5ODU3MzIzMn0.2RxqD7XcdMElE0cr-XkUoxrmjSY--sy_Qf9WFV0ZIa4
   - `service_role` key (click "reveal" — keep this one secret, never put
     it in client-side code) - 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZWlxb2NieGlicmRmeWl4YnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk5NzIzMiwiZXhwIjoyMDk4NTczMjMyfQ.YNtVdKaKd5vI3m3jZC-ZTHorP9MjI9SIti3TxYo-Tnw

## 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill it in:

```
NEXT_PUBLIC_SUPABASE_URL=      # Project URL from step 1
NEXT_PUBLIC_SUPABASE_ANON_KEY= # anon public key from step 1
SUPABASE_SERVICE_ROLE_KEY=     # service_role key from step 1
DAD_PASSWORD=                  # whatever password Dad will type to log in
SESSION_SECRET=                # random string — generate with: openssl rand -hex 32
```

## 3. Run it locally (optional, to try it before deploying)

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the feed, `http://localhost:3000/login`
to sign in as Dad.

## 4. Deploy to Vercel

The easiest path is through GitHub:

1. Push this project to a new GitHub repo (private is fine):
   ```bash
   git init
   git add .
   git commit -m "Dad's feed"
   git remote add origin <https://ekeiqocbxibrdfyixbyq.supabase.co/rest/v1/>
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new), import that repo.
3. Vercel will auto-detect Next.js — no build settings to change.
4. Before deploying, add the same 5 environment variables from step 2 in
   the Vercel project's **Settings → Environment Variables** (Production +
   Preview).
5. Click **Deploy**. You'll get a `your-app.vercel.app` URL — that's the
   link you share with family for the feed, and the one Dad uses to log in
   and post.

No GitHub account? You can also deploy straight from your machine with the
[Vercel CLI](https://vercel.com/docs/cli): run `npx vercel` in this folder
and follow the prompts, then `npx vercel --prod` once it looks right. It'll
ask you to add the env variables too.

## Notes

- Dad's "password" is one shared password for the whole app — simplest
  option for a family project. If you'd rather he have his own private
  login separate from a generic one, that's a bigger add (real user
  accounts) — just say the word and I can build that instead.
- Photos are stored in Supabase's free storage tier (1GB free, cheap
  after that) — plenty for a long while of family photos.
- Tags are freeform — Dad can type any tag when posting, and the feed
  automatically shows filter buttons for every tag currently in use.
