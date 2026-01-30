# Second Brain AI - Complete Project Guidelines

> **Your AI-Powered Personal Knowledge Management System**  
> Enterprise-grade platform with 3D graph visualization and macOS Liquid Glass design

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Components Library](#-components-library)
- [Pages Overview](#-pages-overview)
- [Design System](#-design-system)
- [State Management](#-state-management)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [Development Commands](#-development-commands)
- [Deployment Strategy](#-deployment-strategy)

---

## 🎯 Project Overview

**Second Brain AI** is a modern, enterprise-grade knowledge management system that helps users:
- Store and organize documents and notes
- Automatically extract concepts and entities using AI
- Visualize knowledge as an interactive 3D graph
- Chat with their knowledge base using RAG (Retrieval-Augmented Generation)
- Get analytics and insights on their knowledge patterns

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | ^18.2.0 |
| **TypeScript** | Type Safety | ^5.3.3 |
| **Vite** | Build Tool & Dev Server | ^5.0.11 |
| **TailwindCSS** | Utility-first Styling | ^3.4.1 |
| **Framer Motion** | Animations & Transitions | ^10.18.0 |
| **React Router DOM** | Client-side Routing | ^6.21.3 |
| **Zustand** | Client State Management | ^4.5.0 |
| **React Query** | Server State Management | ^5.17.19 |
| **Three.js** | 3D Graphics | ^0.160.1 |
| **react-force-graph-3d** | 3D Knowledge Graph | ^1.24.4 |
| **lucide-react** | Icon Library | ^0.563.0 |

### Backend (100% FREE Tier!)

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL Database, Authentication, File Storage, Edge Functions |
| **Google Gemini 2.0** | AI Concept Extraction & Q&A (1500 requests/day FREE) |
| **Qdrant** | Vector Database for Semantic Search (self-hosted on Fly.io) |

### DevDependencies

| Tool | Purpose |
|------|---------|
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Vitest** | Unit Testing |
| **PostCSS + Autoprefixer** | CSS Processing |

---

## 📁 Project Structure

```
second-brain-ai/
├── 📄 index.html              # Entry HTML file
├── 📄 package.json            # Dependencies & scripts
├── 📄 vite.config.ts          # Vite configuration
├── 📄 tailwind.config.js      # TailwindCSS configuration
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 .env.local              # Environment variables (local)
├── 📄 .env.example            # Environment template
│
├── 📁 docs/                   # Documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── API.md                 # API documentation
│   ├── DESIGN_SYSTEM.md       # Design system guide
│   └── PROJECT_GUIDELINES.md  # This file
│
└── 📁 src/                    # Source code
    ├── 📄 main.tsx            # App entry point
    ├── 📄 App.tsx             # Root component with routing
    ├── 📄 index.css           # Global styles
    │
    ├── 📁 components/         # Reusable UI components (19 files)
    ├── 📁 pages/              # Page components (8 files)
    ├── 📁 hooks/              # Custom React hooks (4 files)
    ├── 📁 lib/                # Third-party integrations (2 files)
    ├── 📁 types/              # TypeScript definitions (1 file)
    └── 📁 utils/              # Helper functions (4 files)
```

---

## ✨ Key Features

### 1. AI-Powered Knowledge Extraction
- Automatic concept detection from uploaded documents
- Entity recognition (people, organizations, locations, topics)
- Relationship mapping between concepts

### 2. 3D Knowledge Graph
- Interactive WebGL visualization
- Force-directed layout with physics simulation
- Supports 10K+ nodes at 60 FPS
- Multiple view modes and filters

### 3. Intelligent Q&A (RAG)
- Chat with your knowledge base
- Answers grounded in your documents
- Source citations for transparency

### 4. Document Management
- Upload PDFs, text files, and notes
- Automatic chunking and embedding generation
- Full-text and semantic search

### 5. Analytics Dashboard
- Knowledge growth metrics
- Most connected concepts
- Gap analysis and suggestions

### 6. Premium macOS Liquid Glass UI
- Glassmorphism effects with backdrop blur
- Genie-like fluid animations
- 60 FPS smooth interactions

---

## 🧩 Components Library

### Core UI Components

| Component | File | Description |
|-----------|------|-------------|
| **Button** | `Button.tsx` | Primary action button with variants (primary, secondary, ghost, danger) |
| **Card** | `Card.tsx` | Glassmorphic container with hover effects |
| **Input** | `Input.tsx` | Text input with label, icon, and error states |
| **Modal** | `Modal.tsx` | Overlay dialog with Genie animation |
| **Toast** | `Toast.tsx` | Notification system (success, error, info, warning) |
| **LoadingSpinner** | `LoadingSpinner.tsx` | Loading indicator |
| **Logo** | `Logo.tsx` | Brand logo component |

### Feature Components

| Component | File | Description |
|-----------|------|-------------|
| **SemanticSearch** | `SemanticSearch.tsx` | AI-powered search with embeddings |
| **GapAnalysis** | `GapAnalysis.tsx` | Knowledge gap detection and suggestions |
| **DataExport** | `DataExport.tsx` | Export functionality for data |
| **GraphControls** | `GraphControls.tsx` | 3D graph manipulation controls |
| **GraphViewSelector** | `GraphViewSelector.tsx` | Switch between graph view modes |
| **AnimatedCounter** | `AnimatedCounter.tsx` | Number animation for stats |

### Visual Effects Components

| Component | File | Description |
|-----------|------|-------------|
| **ParticleBackground** | `ParticleBackground.tsx` | Animated particle effects |
| **ParticleNetwork** | `ParticleNetwork.tsx` | Network-style particle animation |
| **MeadowCanvas** | `MeadowCanvas.tsx` | Nature-inspired background |
| **FloatingOrb** | `FloatingOrb.tsx` | Decorative floating element |
| **MagneticButton** | `MagneticButton.tsx` | Button with magnetic cursor effect |

---

## 📄 Pages Overview

| Page | File | Route | Description |
|------|------|-------|-------------|
| **Landing** | `LandingPage.tsx` | `/` | Marketing homepage with features showcase |
| **Login** | `LoginPage.tsx` | `/login` | Authentication with Google OAuth & Email |
| **Dashboard** | `DashboardPage.tsx` | `/dashboard` | Main hub with stats and recent activity |
| **Documents** | `DocumentsPage.tsx` | `/documents` | Upload, view, and manage documents |
| **Graph** | `GraphPage.tsx` | `/graph` | 3D interactive knowledge graph |
| **Chat** | `ChatPage.tsx` | `/chat` | AI Q&A with your knowledge base |
| **Analytics** | `AnalyticsPage.tsx` | `/analytics` | Insights and metrics dashboard |
| **About** | `AboutPage.tsx` | `/about` | About the platform |

---

## 🎨 Design System

### Color Palette

#### macOS System Colors
```css
--accent-blue: #007AFF
--accent-purple: #AF52DE
--accent-pink: #FF2D55
--accent-orange: #FF9500
--accent-green: #34C759
--accent-teal: #5AC8FA
--accent-indigo: #5856D6
```

#### Background Colors (Dark Theme)
```css
--bg-primary: rgba(28, 28, 30, 0.95)
--bg-secondary: rgba(44, 44, 46, 0.9)
--bg-tertiary: rgba(58, 58, 60, 0.85)
```

#### Glass Effects
```css
--glass-primary: rgba(255, 255, 255, 0.08)
--glass-secondary: rgba(255, 255, 255, 0.05)
--glass-border: rgba(255, 255, 255, 0.12)
```

### Typography

- **Display Font**: SF Pro Display, Inter
- **Text Font**: SF Pro Text, Inter
- **Mono Font**: SF Mono, Monaco

### Animations (Defined in tailwind.config.js)

| Animation | Description |
|-----------|-------------|
| `genie-in` | macOS Genie effect opening |
| `genie-out` | macOS Genie effect closing |
| `fade-in` | Smooth fade in |
| `slide-up` | Slide up with fade |
| `scale-in` | Scale up with fade |

---

## 🔄 State Management

### Zustand Stores

Used for client-side state that needs to persist across components:
- User authentication state
- UI preferences (theme, sidebar state)
- Graph filter selections

### React Query

Used for server state:
- Document fetching and caching
- Graph data with automatic refetching
- Chat history management

---

## 🗄 Database Schema

### Tables (Supabase PostgreSQL)

| Table | Description |
|-------|-------------|
| **profiles** | User profiles (id, email, full_name, avatar_url) |
| **documents** | Uploaded documents (title, content, file_url, status) |
| **nodes** | Knowledge graph nodes (type, label, properties) |
| **edges** | Graph relationships (source_id, target_id, type, weight) |
| **document_chunks** | Text chunks with embeddings for RAG |
| **chat_messages** | Chat history with sources |

### TypeScript Types (from `src/types/index.ts`)

```typescript
// Core entities
Profile, Document, Node, Edge, DocumentChunk, ChatMessage

// Graph visualization
GraphNode, GraphEdge, GraphData

// AI processing
ConceptExtractionResult, ChatResponse

// UI state
Toast, UploadProgress
```

---

## 🤖 AI Integration

### Google Gemini API (`src/lib/gemini.ts`)

- **Concept Extraction**: Analyze documents to extract key concepts
- **Entity Recognition**: Identify people, organizations, locations
- **Q&A Generation**: Answer questions using RAG pipeline
- **Embedding Generation**: Create vector embeddings for semantic search

### Supabase Integration (`src/lib/supabase.ts`)

- Authentication (Google OAuth, Email/Password)
- Real-time subscriptions for live updates
- Storage for document files
- Database operations with RLS

---

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

---

## 🚀 Deployment Strategy

### Frontend: Cloudflare Pages (FREE)
- Zero-config deployment from Git
- Global CDN distribution
- Unlimited bandwidth
- Custom domain support

### Backend: Supabase (FREE Tier)
- 500MB database storage
- 2GB file storage
- 50K monthly active users
- Unlimited API requests

### Vector DB: Fly.io (FREE)
- Self-hosted Qdrant
- 3 free VMs
- Persistent volumes

### CI/CD: GitHub Actions (FREE)
- Automated builds on push
- Type checking and linting
- Preview deployments

---

## 📚 Additional Documentation

- [Setup Guide](./SETUP.md) - Complete installation instructions
- [Architecture](./ARCHITECTURE.md) - System architecture deep dive
- [API Documentation](./API.md) - API endpoints and usage
- [Design System](./DESIGN_SYSTEM.md) - Component styling guide
- [Contributing](./CONTRIBUTING.md) - How to contribute
- [Quick Start](./QUICK_START.md) - Get running in 5 minutes

---

## 🔒 Security Features

- **Row-Level Security (RLS)**: User data isolation
- **JWT Authentication**: Secure token-based auth
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **OAuth 2.0**: Google sign-in integration
- **Input Validation**: XSS and injection prevention

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Time to Interactive | < 3 seconds |
| 3D Graph (1K nodes) | 60 FPS |
| 3D Graph (10K nodes) | 30+ FPS |
| Initial Bundle | < 500KB |

---

## 🎯 Node.js Requirements

```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

**Built with ❤️ for enterprise-grade knowledge management**

*Last Updated: January 2026*
