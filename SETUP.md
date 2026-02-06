# Second Brain AI - Complete Setup Guide

> **Complete setup instructions from zero to production deployment**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** and **npm 10+** installed
- ✅ **Git** installed
- ✅ A **GitHub** account (for deployment)
- ✅ Basic command line familiarity

---

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/JaineeraSuhas/SECOND-BRAIN.git
cd SECOND-BRAIN

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```

### 3. Get Free API Keys

You'll need two free accounts:

#### A. Supabase (Database & Auth)
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign in with GitHub
3. Create a new project (choose a region close to you)
4. Wait ~2 minutes for provisioning
5. Go to **Settings** → **API**
6. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

#### B. Google Gemini AI (Free Tier)
1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key → `VITE_GEMINI_API_KEY`

### 4. Configure `.env.local`

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here

VITE_APP_NAME="Second Brain AI"
VITE_APP_URL=http://localhost:5173
VITE_ENABLE_3D_GRAPH=true
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ANALYTICS=true
```

### 5. Setup Database

Run the migrations in your Supabase project:

1. Go to your Supabase dashboard
2. Click **SQL Editor** → **New Query**
3. Run each migration file in order:
   - `supabase/migrations/20260207000001_initial_schema.sql`
   - `supabase/migrations/20260207000002_enable_rls.sql`
   - `supabase/migrations/20260207000003_storage_buckets.sql`

Or use the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🗄️ Database Setup (Detailed)

### Option A: Using Supabase Dashboard (Recommended for Beginners)

1. **Navigate to SQL Editor**
   - Open your Supabase project
   - Go to **SQL Editor** in the sidebar
   - Click **New Query**

2. **Run Initial Schema**
   - Copy contents of `supabase/migrations/20260207000001_initial_schema.sql`
   - Paste into SQL Editor
   - Click **Run** (bottom right)
   - Wait for success message

3. **Enable Row Level Security**
   - Create a new query
   - Copy contents of `supabase/migrations/20260207000002_enable_rls.sql`
   - Run it

4. **Setup Storage Buckets**
   - Create a new query
   - Copy contents of `supabase/migrations/20260207000003_storage_buckets.sql`
   - Run it

5. **Verify Setup**
   - Go to **Table Editor**
   - You should see: `profiles`, `documents`, `nodes`, `edges`, `document_chunks`, `chat_messages`

### Option B: Using Supabase CLI (For Advanced Users)

```bash
# Install CLI globally
npm install -g supabase

# Initialize in project
cd your-project-folder
supabase init

# Login to Supabase
supabase login

# Link to your cloud project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push

# Verify
supabase db diff
```

---

## 🔐 Authentication Setup

### Enable Google OAuth (Optional but Recommended)

1. **In Supabase Dashboard:**
   - Go to **Authentication** → **Providers**
   - Find **Google** and click configure

2. **Create Google OAuth Client:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or select existing)
   - Enable **Google+ API**
   - Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     ```
   - Copy **Client ID** and **Client Secret**

3. **Configure in Supabase:**
   - Paste Client ID and Secret in Google provider settings
   - Click **Save**

### Email Authentication (Enabled by Default)

Email/password authentication works out of the box! Users can sign up with email.

---

## 🧪 Verify Setup

Run these checks to ensure everything works:

### 1. Type Check
```bash
npm run type-check
```
Expected: `✓ No errors found`

### 2. Build Test
```bash
npm run build
```
Expected: Build completes successfully, creates `dist/` folder

### 3. Lint Check
```bash
npm run lint
```
Expected: Max 100 warnings (configured in package.json)

### 4. Preview Production Build
```bash
npm run preview
```
Expected: Server starts on http://localhost:4173

---

## 🚀 Deployment to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click **New Project**
   - Import your repository
   - Vercel auto-detects Vite ✅

3. **Add Environment Variables**
   - In Vercel project settings → **Environment Variables**
   - Add all variables from `.env.local`:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GEMINI_API_KEY`
     - `VITE_APP_NAME`
     - `VITE_APP_URL` (use your vercel.app URL)
     - `VITE_ENABLE_3D_GRAPH=true`
     - `VITE_ENABLE_AI_CHAT=true`
     - `VITE_ENABLE_ANALYTICS=true`

4. **Deploy**
   - Click **Deploy**
   - Wait ~2 minutes
   - Your app is live! 🎉

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
# Set environment variables when prompted

# Deploy to production
vercel --prod
```

---

## 🎨 Supabase Configuration

### Storage Buckets

The app needs a storage bucket for document uploads:

1. Go to **Storage** in Supabase Dashboard
2. Verify `documents` bucket exists (created by migration)
3. Set bucket to **Public** if you want documents accessible via URL
4. Configure bucket policies in Policies tab

### Row Level Security (RLS)

RLS ensures users only see their own data:

- ✅ Automatically enabled by migration
- ✅ Policies created for all tables
- ✅ Users can only access their own documents, nodes, edges, etc.

**Test RLS:**
1. Create two user accounts
2. Upload a document as User A
3. Login as User B
4. Verify you can't see User A's documents

---

## 📊 Optional: Qdrant Vector Database (Advanced)

> **Note:** The app works without Qdrant. Supabase pgvector is used by default.

If you want to use Qdrant for advanced vector search:

### Deploy on Fly.io (Free Tier)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
fly launch --name second-brain-qdrant

# Deploy Qdrant
fly deploy --image qdrant/qdrant:latest

# Get URL
fly status
```

Add to `.env.local`:
```env
VITE_QDRANT_URL=https://second-brain-qdrant.fly.dev
```

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Supabase client error"

- Verify `VITE_SUPABASE_URL` starts with `https://` and ends with `.supabase.co`
- Check anon key is correct (in Supabase Settings → API)
- Ensure environment variables are prefixed with `VITE_`

### "Build fails on Vercel"

- Check Node.js version in Vercel settings (should be 20+)
- Verify all environment variables are set
- Check build logs for specific errors

### "Database connection timeout"

- Verify migrations ran successfully
- Check Supabase project is not paused (happens after 1 week of inactivity on free tier)
- Restart Supabase project if needed

### "Google Auth not working"

- Verify redirect URI exactly matches in Google Cloud Console
- Check client ID and secret are correct in Supabase
- Enable Google provider in Supabase Authentication settings

---

## 📚 Next Steps

Once setup is complete:

1. ✅ Create your first account
2. ✅ Upload a test document
3. ✅ Explore the 3D knowledge graph
4. ✅ Chat with your knowledge base
5. ✅ Check analytics dashboard

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default credentials
- [ ] Enable 2FA on Supabase and Vercel accounts
- [ ] Review RLS policies in Supabase
- [ ] Add custom domain with SSL (Vercel provides free SSL)
- [ ] Set up monitoring and error tracking
- [ ] Review and limit API rate limits
- [ ] Backup your database regularly

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Vercel Documentation](https://vercel.com/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)

---

## 💡 Tips for Success

- **Start Small**: Upload a few documents first, test the graph
- **Use Keyboard Shortcuts**: Press `Cmd/Ctrl + K` for command palette
- **Monitor Usage**: Check your Gemini API usage in Google AI Studio
- **Free Tier Limits**:
  - Supabase: 500MB database, 1GB storage
  - Gemini: 1500 requests/day
  - Vercel: 100GB bandwidth/month

---

**Need Help?** Open an issue on GitHub or check existing issues for solutions.

**Happy Knowledge Management!** 🧠✨
