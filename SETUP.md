# Setup Guide - Second Brain AI

This guide will walk you through setting up Second Brain AI from scratch. **Total setup time: ~30 minutes**.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 20+ installed ([Download](https://nodejs.org/))
- [ ] Git installed
- [ ] A GitHub account
- [ ] A code editor (VS Code recommended)

---

## 🔐 Step 1: Supabase Setup (5 minutes)

Supabase provides our database, authentication, and storage - all **100% FREE**.

### 1.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 1.2 Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `second-brain-ai`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: FREE (default)
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup to complete

### 1.3 Get Your Credentials

Once your project is ready:

1. Go to **Settings** (gear icon) → **API**
2. Copy these values (you'll need them later):
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (keep this secret!)
   ```

### 1.4 Enable Authentication Providers

1. Go to **Authentication** → **Providers**
2. Enable **Email** (already enabled)
3. Enable **Google**:
   - Click **Google**
   - Toggle **"Enable Sign in with Google"**
   - We'll configure OAuth later (optional for MVP)

### 1.5 Setup Database Schema

1. Go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Graph nodes table
CREATE TABLE public.nodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- document, concept, person, organization, topic, location
  label TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Graph edges table
CREATE TABLE public.edges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- relates_to, builds_on, contradicts, supports, derives_from
  weight FLOAT DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document chunks table (for RAG)
CREATE TABLE public.document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768), -- Gemini embedding dimension
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat history table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_nodes_user_id ON public.nodes(user_id);
CREATE INDEX idx_nodes_type ON public.nodes(type);
CREATE INDEX idx_edges_user_id ON public.edges(user_id);
CREATE INDEX idx_edges_source ON public.edges(source_id);
CREATE INDEX idx_edges_target ON public.edges(target_id);
CREATE INDEX idx_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX idx_chunks_user_id ON public.document_chunks(user_id);
CREATE INDEX idx_chat_user_id ON public.chat_messages(user_id);

-- Create vector similarity search index
CREATE INDEX ON public.document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Documents
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Nodes
CREATE POLICY "Users can view own nodes" ON public.nodes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nodes" ON public.nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nodes" ON public.nodes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nodes" ON public.nodes
  FOR DELETE USING (auth.uid() = user_id);

-- Edges
CREATE POLICY "Users can view own edges" ON public.edges
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own edges" ON public.edges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own edges" ON public.edges
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own edges" ON public.edges
  FOR DELETE USING (auth.uid() = user_id);

-- Document Chunks
CREATE POLICY "Users can view own chunks" ON public.document_chunks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chunks" ON public.document_chunks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chunks" ON public.document_chunks
  FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

### 1.6 Setup Storage Buckets

1. Go to **Storage**
2. Click **"New bucket"**
3. Create bucket:
   - **Name**: `documents`
   - **Public bucket**: OFF (private)
   - Click **"Create bucket"**
4. Click on `documents` bucket → **Policies**
5. Click **"New policy"** and add 
 
```sql
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

✅ **Supabase setup complete!**

---

## 🤖 Step 2: Google Gemini API Setup (2 minutes)

### 2.1 Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Click **"Create API key in new project"**
5. Copy your API key (starts with `AIza...`)
6. **Save this key** - you'll need it for `.env.local`

**Free Tier**: 1,500 requests per day (45,000/month) - plenty for personal use!

✅ **Gemini API setup complete!**

---

## 🚀 Step 3: Project Setup (10 minutes)

### 3.1 Clone and Install

```bash
# Navigate to project directory
cd C:\Users\ASUS\.gemini\antigravity\scratch\second-brain-ai

# Install dependencies
npm install
```

### 3.2 Create Environment File

Create `.env.local` in the project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Google Gemini
VITE_GEMINI_API_KEY=AIza...

# App Config
VITE_APP_NAME="Second Brain AI"
VITE_APP_URL=http://localhost:5173
```

Replace the values with your actual credentials from Steps 1 and 2.

### 3.3 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v6.0.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

✅ **Local development setup complete!**

---

## 🌐 Step 4: Qdrant Vector Database (Optional - for production)

For local development, we'll use in-memory vectors. For production:

### 4.1 Deploy to Fly.io (FREE)

1. Install Fly CLI:
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

2. Sign up and login:
```bash
fly auth signup
fly auth login
```

3. Deploy Qdrant:
```bash
fly apps create second-brain-qdrant
fly deploy --image qdrant/qdrant:latest --region <your-region>
```

4. Get your Qdrant URL:
```bash
fly info
```

5. Add to `.env.local`:
```
VITE_QDRANT_URL=https://second-brain-qdrant.fly.dev
```

---

## 🚀 Step 5: Deploy to Cloudflare Pages (5 minutes)

### 5.1 Build for Production

```bash
npm run build
```

### 5.2 Deploy

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Sign up/login
3. Click **"Create a project"**
4. Connect your GitHub repository
5. Configure build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: Add your `.env.local` variables
6. Click **"Save and Deploy"**

Your app will be live at `https://second-brain-ai.pages.dev`!

---

## ✅ Verification Checklist

- [ ] Supabase project created and database schema deployed
- [ ] Gemini API key obtained
- [ ] `.env.local` file created with all credentials
- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] Can access app at http://localhost:5173
- [ ] Can sign up/login with email
- [ ] (Optional) Qdrant deployed to Fly.io
- [ ] (Optional) App deployed to Cloudflare Pages

---

## 🆘 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection errors
- Check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure they don't have trailing slashes or extra spaces

### Gemini API errors
- Verify your API key is correct
- Check you haven't exceeded the free tier (1500 requests/day)

### Build errors
```bash
npm run lint
npm run type-check
```

---

## 📚 Next Steps

1. Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand the system
2. Explore [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for UI components
3. Check [API.md](./docs/API.md) for API documentation
4. Start building! 🚀

---

**Need help?** Open an issue on GitHub or check the documentation.
