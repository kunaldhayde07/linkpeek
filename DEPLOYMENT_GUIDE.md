# Deployment Guide — LinkPeek

## Prerequisites

- Node.js 20+
- npm 10+
- Git
- Accounts: [Supabase](https://supabase.com), [Upstash](https://upstash.com), [Vercel](https://vercel.com)

---

## Step 1: Supabase Setup

1. **Create a new project** at [app.supabase.com](https://app.supabase.com)
2. **Note your credentials** from Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role key (keep secret!)
3. **Database URLs** from Project Settings → Database:
   - `DATABASE_URL` — Connection Pooling URL (port 6543, add `?pgbouncer=true`)
   - `DIRECT_URL` — Direct Connection URL (port 5432)
4. **Enable Auth providers** in Authentication → Providers:
   - Enable Email (already enabled by default)
   - Enable GitHub: Add OAuth app from [github.com/settings/developers](https://github.com/settings/developers)
   - Enable Google: Add OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
5. **Create Storage bucket**: Storage → Create bucket named `screenshots` (public)

---

## Step 2: Upstash Redis Setup

1. **Create a database** at [console.upstash.com](https://console.upstash.com)
2. Select region closest to your Vercel deployment (e.g., US East 1)
3. **Note your credentials**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Step 3: Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/linkpeek.git
cd linkpeek

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in all environment variables in .env.local

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Step 4: Vercel Deployment

1. **Push to GitHub** — Create a repo and push your code
2. **Import in Vercel** — [vercel.com/new](https://vercel.com/new) → Import your repo
3. **Set Environment Variables** in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
API_KEY_SALT=<run: openssl rand -hex 32>
```

4. **Deploy** — Vercel auto-deploys on push to `main`
5. **Run migrations on production**:
```bash
npx prisma migrate deploy
```

---

## Step 5: Post-Deployment Checklist

- [ ] Visit `/api/health` — verify all checks pass
- [ ] Sign up a test account
- [ ] Generate an API key
- [ ] Make a test API call: `curl -X POST https://your-domain/api/v1/preview -H "Authorization: Bearer lp_live_xxx" -H "Content-Type: application/json" -d '{"url":"https://github.com"}'`
- [ ] Verify the dashboard loads correctly
- [ ] Test OAuth login (GitHub/Google)
- [ ] Set up [UptimeRobot](https://uptimerobot.com) monitor for `/api/health`

---

## Monitoring

| Tool | What to Watch | URL |
|------|--------------|-----|
| Vercel Analytics | Web Vitals, page load times | Vercel Dashboard |
| Vercel Logs | Function errors, slow requests | Vercel Dashboard → Logs |
| Supabase Dashboard | DB size, query performance | app.supabase.com |
| Upstash Console | Redis commands, memory | console.upstash.com |
| `/api/health` | System health | Your domain/api/health |

---

## Cost (Free Tier Limits)

| Service | Free Tier | When to Upgrade |
|---------|-----------|-----------------|
| **Vercel** | 100GB bandwidth, serverless functions | >100K monthly visitors |
| **Supabase** | 500MB DB, 1GB storage, 50K auth users | >500MB data |
| **Upstash** | 10K commands/day, 256MB | >10K daily API calls |

**Total monthly cost: $0** (within free tiers)
