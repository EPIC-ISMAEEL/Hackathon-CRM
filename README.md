# J4 — AI Project Manager (The Infinity Hack '26)
Meeting → projects & tasks. Admin pastes a transcript; Gemini creates projects, tasks, owners, deadlines and estimated hours for NovaWorks Technologies.

**Stack:** Next.js 16 and React 19 (App Router, API routes), MongoDB Atlas, Gemini API, JWT cookie sessions (jose), bcryptjs.

## Features
Login/logout · admin home + Create from Transcript · read-only team directory · projects/project detail · task table (title, description, agent, deadline, hours) · manager sees own projects · agent sees only own tasks · persistent DB · role checks enforced server-side in every API · all-or-nothing Mongo transaction · validation with editable correction + revalidation · loading/error states, double-click protection.

## Setup
```bash
npm install
cp .env.example .env.local   # fill in values
npm run seed                 # optional: users are also auto-seeded on first request (idempotent)
npm run dev                  # http://localhost:3000
```
Env vars: `MONGODB_URI`, `MONGODB_DB`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AUTH_SECRET`.
Atlas: allow your IP (or 0.0.0.0/0) under Network Access.

## Demo accounts (password `Demo123!`)
admin@ · ayesha@ · bilal@ · hina@ · ali@ · hamza@ · sara@ · usman@ · zain@ · maryam@ `novaworks.example`

## Testing the transcript flow
1. Login as admin → **Create from transcript** → paste the supplied transcript → expect 3 projects / 12 tasks.
2. Login as ayesha (UrbanCart only), ali (3 tasks), hamza (2 tasks across projects).
3. Edit the transcript (e.g. QuickServe integration → 12h, 23 Oct) and re-run (keep "Replace existing" ticked).

## Deployment
Vercel (frontend + API) + MongoDB Atlas. Import the repo, add the env vars above, deploy.

## Known limitations
No signup/reset/user management, cost or progress tracking. Project/task editing not implemented. "Replace existing" wipes all projects/tasks before saving.
