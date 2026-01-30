# Notion Integration Setup Guide

## Overview

Second Brain AI now supports importing your Notion pages and databases directly into your knowledge graph! This integration allows you to:

- Import Notion pages and convert them to nodes
- Extract concepts from Notion content using AI
- Maintain links between Notion pages in your graph
- Sync Notion databases

---

## Setup Instructions

### Step 1: Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Fill in the details:
   - **Name**: Second Brain AI (or any name you prefer)
   - **Associated workspace**: Select your workspace
   - **Capabilities**: Enable "Read content"
4. Click **"Submit"**
5. Copy the **"Internal Integration Token"** (starts with `secret_`)

### Step 2: Share Pages with Your Integration

> **Important**: Notion integrations can only access pages that are explicitly shared with them.

1. Open the Notion page or database you want to import
2. Click the **"..."** menu in the top-right corner
3. Scroll down and click **"+ Add connections"**
4. Search for your integration name (e.g., "Second Brain AI")
5. Click on it to grant access

Repeat this for all pages/databases you want to import.

### Step 3: Configure Second Brain AI

1. Open your `.env.local` file in the project root
2. Add your Notion integration token:

```bash
VITE_NOTION_API_KEY=secret_your_token_here
```

3. Save the file and restart your development server

---

## How to Use

### Importing from Notion

1. Navigate to the **Documents** page in Second Brain AI
2. Click **"Unified Ingest"** button
3. Click the **"Notion"** button
4. If this is your first time:
   - Paste your Notion Integration Token
   - Click **"Connect to Notion"**
5. Click **"Search Workspace"** to find your pages and databases
6. Select the pages/databases you want to import
7. Click **"Import Selected"**

### What Happens During Import

For each Notion page:

1. **Content Extraction**: The page content is fetched and converted to plain text
2. **AI Concept Extraction**: Gemini AI analyzes the content and extracts key concepts
3. **Node Creation**: 
   - A document node is created for the page
   - Concept nodes are created for each extracted concept
4. **Edge Creation**: Connections are made between the document and its concepts
5. **Graph Update**: Your knowledge graph is updated in real-time

---

## Features

### Supported Content Types

- ✅ **Pages**: Regular Notion pages with text, headings, lists, etc.
- ✅ **Databases**: Import all pages from a database
- ✅ **Rich Text**: Formatting is preserved as plain text
- ✅ **Links**: Internal Notion links are tracked
- ⚠️ **Images**: Captions are extracted (image files not yet supported)
- ⚠️ **Code Blocks**: Content is extracted (syntax highlighting not preserved)

### AI-Powered Features

- **Concept Extraction**: Automatically identifies key concepts from your Notion content
- **Semantic Analysis**: Uses Gemini AI to understand the meaning of your notes
- **Smart Connections**: Creates meaningful relationships between concepts

---

## Troubleshooting

### "Failed to connect" Error

**Cause**: Invalid or missing Notion API key

**Solution**:
1. Verify your API key is correct (starts with `secret_`)
2. Make sure it's properly added to `.env.local`
3. Restart your development server

### "No results found" When Searching

**Cause**: Pages not shared with your integration

**Solution**:
1. Go to each Notion page you want to import
2. Click "..." → "+ Add connections"
3. Select your integration

### Import Fails or Gets Stuck

**Cause**: Large pages or API rate limits

**Solution**:
- Try importing fewer pages at once
- Wait a few minutes and try again
- Check browser console for specific error messages

### Concepts Not Extracted Properly

**Cause**: Gemini API quota exceeded or content too short

**Solution**:
- Check your Gemini API quota
- Ensure pages have substantial content (>100 words recommended)

---

## API Limits

### Notion API

- **Rate Limit**: 3 requests per second
- **Free Tier**: Unlimited requests
- **Timeout**: 60 seconds per request

### Gemini AI

- **Free Tier**: 1,500 requests per day
- **Rate Limit**: 60 requests per minute
- **Token Limit**: 2,048 tokens per request

**Tip**: The integration automatically batches requests to stay within limits.

---

## Privacy & Security

- **API Key Storage**: Your Notion API key is stored locally in your browser (localStorage)
- **Data Processing**: Content is sent to Gemini AI for concept extraction
- **No Server Storage**: Notion content is processed client-side and stored in your Supabase database
- **Permissions**: The integration only accesses pages you explicitly share with it

---

## Advanced Usage

### Importing Specific Database Properties

Currently, all pages from a database are imported. Future updates will allow:
- Filtering by properties (tags, status, etc.)
- Importing only specific views
- Syncing database properties as node metadata

### Scheduled Sync

To keep your knowledge graph in sync with Notion:
1. Re-run the import periodically
2. Duplicate pages will be skipped (based on Notion page ID)
3. Updated content will create new concept nodes

---

## Next Steps

After importing from Notion:

1. **Explore Your Graph**: Navigate to the Graph page to see your Notion content visualized
2. **Run Gap Analysis**: Use AI to identify missing knowledge areas
3. **Generate Learning Paths**: Create structured learning paths from your notes
4. **Connect Ideas**: Manually connect related concepts for deeper insights

---

## Need Help?

- **Documentation**: Check the main README.md
- **Issues**: Report bugs on GitHub
- **Questions**: Join our Discord community

---

## Roadmap

Upcoming Notion integration features:

- [ ] Two-way sync (update Notion from Second Brain)
- [ ] Database property mapping
- [ ] Image and file support
- [ ] Real-time sync with webhooks
- [ ] Notion-style block editing
- [ ] Export graph back to Notion

---

**Happy knowledge building! 🧠✨**
