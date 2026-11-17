J4 - AI Meeting to Project CRM
Team
Team name: J4
Members and responsibilities:
Muhammad Ismail (70148866): Fontend
Arisha Fatima (70147272): Backend
Repository: [GitHub URL]
What Works

J4 is a project-management CRM for NovaWorks Technologies. An administrator pastes a meeting transcript and Gemini creates projects, tasks, assigned managers/agents, deadlines and estimated hours, saved in MongoDB.

Seeded demo login (10 accounts, bcrypt-hashed passwords, signed httpOnly session cookie)
Admin home with all project cards and Create from Transcript (loading, success and error states; double-click protection)
AI output is validated before saving; unresolved fields are shown in an editable draft and can be corrected and revalidated; nothing is saved on failure
All-or-nothing MongoDB transaction when saving projects and tasks
Read-only team directory
Projects list, project detail (client, manager, deadline, tasks) and task table (title, description, agent, deadline, estimated hours)
Role-based access enforced in the API: admin sees all, manager sees own projects, agent sees only own tasks and their projects
Saved projects/tasks persist after refresh
Not implemented (optional in the brief): editing projects/tasks after creation
Technology Stack
Frontend: Next.js 14 (App Router) + React 18
Backend: Next.js API routes (Node.js 20+)
Database: MongoDB Atlas (driver v6; transactions need a replica set, which Atlas provides)
AI: Google Gemini API (default model gemini-2.5-flash, configurable via GEMINI_MODEL)
Authentication/session: email + password checked with bcryptjs; JWT (jose) in an httpOnly cookie; the user and role are always read from the session, never from the request
Links
Live application: http://j4-beta.vercel.app/

Requirements
Node.js 20 or newer and npm
MongoDB Atlas cluster (free tier is fine) with your IP allowed under Network Access
Gemini API key from Google AI Studio and a model available to that key
Run Locally
Clone and enter the project:
bash

Install dependencies:
bash
npm install
Copy the env template:
bash
cp .env.example .env.local
Fill in .env.local (see Environment Variables).
Database: no manual setup. Collections and indexes are created automatically on first run.
Schema/migrations: none needed.
Seed the ten demo users (re-running never duplicates; users are also auto-seeded on the first request):
bash
npm run seed
Start the app (one terminal, keep it running) and open http://localhost:3000:
bash
npm run dev
Environment Variables
Variable	Purpose	Where configured
MONGODB_URI	MongoDB connection string	.env.local / deployment (server only)
MONGODB_DB	Database name (default j4)	.env.local / deployment
GEMINI_API_KEY	Gemini API credential	.env.local / deployment (server only)
GEMINI_MODEL	Gemini model name	.env.local / deployment
AUTH_SECRET	Session signing secret (long random string)	.env.local / deployment (server only)

No secrets use NEXT_PUBLIC_ variables. .env.local is git-ignored; only .env.example (placeholders) is committed.

Demo Login Accounts

Fictional identifiers, not mailboxes. No signup, verification or password reset. The seeder (npm run seed) creates them.

Role	Name	Demo email	Password
Admin	Admin	admin@novaworks.example	Demo123!
Manager	Ayesha Khan	ayesha@novaworks.example	Demo123!
Manager	Bilal Ahmed	bilal@novaworks.example	Demo123!
Manager	Hina Malik	hina@novaworks.example	Demo123!
Agent	Ali Raza	ali@novaworks.example	Demo123!
Agent	Hamza Shah	hamza@novaworks.example	Demo123!
Agent	Sara Noor	sara@novaworks.example	Demo123!
Agent	Usman Tariq	usman@novaworks.example	Demo123!
Agent	Zain Abbas	zain@novaworks.example	Demo123!
Agent	Maryam Asif	maryam@novaworks.example	Demo123!
How Judges Can Test
Log in as admin and click Create from transcript.
Paste the supplied meeting transcript (Section 7 of the challenge pack).
Click Create projects & tasks; expect three projects and twelve tasks.
Open UrbanCart: manager Ayesha, deadline 20 October 2026, four tasks.
Log out and log in as Ayesha: only UrbanCart appears.
Log in as Ali: only his three UrbanCart tasks appear.
Log in as Hamza: his two API tasks span UrbanCart and QuickServe.
Direct fetches are blocked: while logged in as Ali, open /api/projects/<id of another project> and expect 403.
Refresh: data persists.
Edit the transcript (e.g. QuickServe integration to 12 hours, 23 October) and run again; only that task should change.

Reset generated data: tick "Replace existing projects & tasks" (default) when creating, or delete all documents in the projects and tasks collections. The users collection is never touched.

Deployment Details
Deployment status: Live
Frontend host: http://j4-beta.vercel.app/
Backend host: same Vercel project (Next.js API routes)
Database: MongoDB Atlas 
Deployed branch/commit: Main
How We Deployed
Push the repo to GitHub and import it in Vercel (framework: Next.js; build npm run build; default output).
Backend runs as Next.js serverless API routes in the same project; no separate service.
Atlas: create a cluster, create a database user, and allow access under Network Access (0.0.0.0/0 for Vercel).
Add environment variables in Vercel: MONGODB_URI, MONGODB_DB, GEMINI_API_KEY, GEMINI_MODEL, AUTH_SECRET.
Users and indexes are created automatically on the first request (or run npm run seed locally against the same MONGODB_URI).
No separate frontend API URL or CORS setup is needed (same origin).
Judges log in with the demo accounts above; the admin uses Create from Transcript.
Known Limitations
Projects/tasks cannot be edited after creation.
Depends on Gemini model availability and quota; if the model returns 404/429, change GEMINI_MODEL or retry.
Gemini responses can take several seconds.
"Replace existing" deletes all current projects and tasks before saving.
Submission Summary
Source repository: https://github.com/EPIC-ISMAEEL/Hackethon-CRM
Live link or local demo video: http://j4-beta.vercel.app/
Setup and seed commands: documented above
Demo login accounts: confirmed working
Features completed: login/roles, team directory, projects/tasks views, AI transcript creation with validation and correction, transactional save, persistence
