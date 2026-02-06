# Deployment Guide - Vercel

> **Step-by-step guide to deploy Second Brain AI to Vercel**

---

## Prerequisites

✅ GitHub repository with your code  
✅ Supabase project set up (with migrations run)  
✅ Google Gemini API key  
✅ Vercel account (free)

---

## Quick Deploy (5 Minutes)

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Second Brain AI"

# Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/SECOND-BRAIN.git

# Push to main branch
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Vercel will auto-detect: **Vite** ✅
5. Click **"Deploy"** (we'll add env vars after)

### Step 3: Add Environment Variables

After first deployment (it will fail - that's OK):

1. Go to your project → **Settings** → **Environment Variables**
2. Add the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_APP_NAME=Second Brain AI
VITE_APP_URL=https://your-app.vercel.app
VITE_ENABLE_3D_GRAPH=true
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ANALYTICS=true
```

3. Click **"Save"**
4. Go to **Deployments** tab
5. Click **⋯** on latest deployment → **Redeploy**

---

## Automatic Deployments

Once set up, every push to `main` branch will:
1. ✅ Run CI checks (type-check, lint, build)
2. ✅ Deploy to Vercel production
3. ✅ Update your live site automatically

---

## Custom Domain (Optional)

1. Go to project **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate auto-provisioned ✅

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `VITE_APP_NAME` | Application name | `Second Brain AI` |
| `VITE_APP_URL` | Production URL | `https://my-brain.vercel.app` |
| `VITE_ENABLE_3D_GRAPH` | Enable 3D graph feature | `true` |
| `VITE_ENABLE_AI_CHAT` | Enable AI chat feature | `true` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics dashboard | `true` |

---

## Vercel Project Settings

### Build Settings (Auto-detected)

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 20.x

### Additional Settings

**Root Directory**: `./`  
**Function Region**: Auto (or select closest to users)

---

## Troubleshooting

### Build Fails

**Error**: "VITE_SUPABASE_URL is not defined"  
**Fix**: Add all environment variables in Vercel settings

**Error**: "Build failed with TypeScript errors"  
**Fix**: Run `npm run type-check` locally, fix errors, push again

### Deployment Succeeds but App Doesn't Work

**Issue**: Blank screen or errors in browser console  
**Fix**: 
1. Check browser console for errors
2. Verify environment variables are correct
3. Ensure Supabase migrations are run
4. Check Supabase RLS policies are enabled

### Authentication Not Working

**Issue**: Can't sign in with Google  
**Fix**:
1. Add Vercel URL to Supabase → Auth → URL Configuration
2. Add `https://your-app.vercel.app` to Allowed Redirect URLs
3. Update Google OAuth redirect URIs

---

## Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Supabase migrations completed
- [ ] Database RLS policies enabled
- [ ] Custom domain configured (optional)
- [ ] Google OAuth configured
- [ ] Test all features in production
- [ ] Monitor error logs in Vercel dashboard
- [ ] Set up alerts for downtime (Vercel does this automatically)

---

## Monitoring

### Vercel Dashboard

- **Analytics**: View page views, load times
- **Logs**: Real-time function logs
- **Deployments**: See all deployments and their status
- **Usage**: Monitor bandwidth and function invocations

### Free Tier Limits

- ✅ 100GB bandwidth/month
- ✅ 100GB-hours serverless function execution
- ✅ Unlimited deployments
- ✅ Unlimited sites

---

## Rollback

If a deployment has issues:

1. Go to **Deployments**
2. Find a working previous deployment
3. Click **⋯** → **Promote to Production**

---

## GitHub Actions Integration

Your repo includes CI/CD workflows:

- **`.github/workflows/ci.yml`** - Runs on every push/PR
- **`.github/workflows/deploy.yml`** - Deploys to Vercel on main push

To enable GitHub Actions deployment:

1. Get Vercel token: Vercel Settings → Tokens
2. Add to GitHub Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID` 
   - `VERCEL_PROJECT_ID`

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- Check GitHub Issues for common problems

---

**Your app is now live! 🎉**
