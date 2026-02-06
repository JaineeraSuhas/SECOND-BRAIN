# Vercel Deployment Troubleshooting

## Error: Missing Supabase environment variables

### Step 1: Verify Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Make sure ALL these variables exist:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
VITE_APP_NAME
VITE_APP_URL
VITE_ENABLE_3D_GRAPH
VITE_ENABLE_AI_CHAT
VITE_ENABLE_ANALYTICS
```

### Step 2: Check the Values

Click "Show" on each variable to verify:
- No extra spaces
- No quotes around the values
- Complete URL for VITE_SUPABASE_URL (starts with https://)
- Complete key for VITE_SUPABASE_ANON_KEY (starts with eyJ)

### Step 3: Important - Redeploy!

After adding environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (⋮)
4. Select **Redeploy**
5. Make sure "Use existing Build Cache" is **UNCHECKED**

### Step 4: Check Build Logs

1. Click on the latest deployment
2. Check the **Build Logs**
3. Look for any errors during build

### Common Issues:

**Issue 1: Variables added but not redeployed**
- Solution: Redeploy with fresh cache

**Issue 2: Wrong environment scope**
- Solution: Add variables to "Production", "Preview", AND "Development"

**Issue 3: Typo in variable names**
- Solution: Must be EXACTLY: `VITE_SUPABASE_URL` (not `SUPABASE_URL`)

**Issue 4: Values with spaces**
- Solution: Remove any leading/trailing spaces

### Quick Test

After redeploying, open browser console on your Vercel URL:

```javascript
// Check if variables are loaded
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### Still Not Working?

Try these:

1. **Delete all env vars and re-add them**
2. **Redeploy from scratch** (not just redeploy)
3. **Check if your Supabase project is active** (not paused)

---

## Your Correct Values (Copy & Paste to Vercel)

```
VITE_SUPABASE_URL = https://epjicesutwybszhviprg.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwamljZXN1dHd5YnN6aHZpcHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTgzNjUsImV4cCI6MjA4NTI3NDM2NX0.bWLCfSPUTkq-GRP6uPx4KhzlSvZaNfNP-fCrBaGwG84
VITE_GEMINI_API_KEY = AIzaSyD3tulDg3lm4OxqIOi5GIsEa4y5dXYdxgM
VITE_APP_NAME = Second Brain AI
VITE_APP_URL = https://your-project.vercel.app
VITE_ENABLE_3D_GRAPH = true
VITE_ENABLE_AI_CHAT = true
VITE_ENABLE_ANALYTICS = true
```

Make sure to update `VITE_APP_URL` with your actual Vercel URL!
