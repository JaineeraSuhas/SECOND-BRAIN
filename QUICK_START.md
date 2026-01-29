# Quick Start Checklist

## ⚡ 5-Minute Setup

### 1. Supabase Setup (3 min)
- [ ] Go to [supabase.com](https://supabase.com) → Sign up
- [ ] Create project: `second-brain-ai`
- [ ] Copy Project URL & anon key
- [ ] Run SQL from `SETUP.md` Section 1.5
- [ ] Create `documents` storage bucket

### 2. Gemini API (1 min)
- [ ] Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Create API key
- [ ] Copy key (starts with `AIza...`)

### 3. Environment Setup (1 min)
- [ ] Create `.env.local` file in project root
- [ ] Paste this template:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GEMINI_API_KEY=AIza...
VITE_APP_NAME="Second Brain AI"
VITE_APP_URL=http://localhost:5173
```
- [ ] Replace with YOUR actual keys
- [ ] Save file

### 4. Run App
```bash
npm run dev
```

### 5. Test
- [ ] Open http://localhost:5173
- [ ] Sign up with email
- [ ] Access dashboard

---

## 🎯 You're Done!

If all checkboxes are ✅, you're ready to build!

**Next**: Tell me when you're ready and I'll help you build:
- Document upload system
- 3D knowledge graph
- AI chat interface
- Concept extraction

---

**Having issues?** Check `NEXT_STEPS.md` for detailed troubleshooting.
