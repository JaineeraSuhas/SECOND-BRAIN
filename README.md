# Second Brain AI

Enterprise-grade AI-powered knowledge management system with 3D graph visualization and macOS Liquid Glass design.

## Features

- AI-Powered Knowledge Extraction using Google Gemini
- 3D Knowledge Graph with interactive WebGL visualization
- Intelligent Q&A with RAG-based question answering
- macOS Liquid Glass UI with premium design
- Enterprise Security with row-level security and encryption
- Fully Responsive design for desktop, tablet, and mobile

## Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- TailwindCSS for styling
- Framer Motion for animations
- react-force-graph-3d for 3D visualization
- Zustand for state management
- React Query for server state

### Backend
- Supabase (PostgreSQL database, authentication, storage)
- Google Gemini 2.0 (AI concept extraction and Q&A)
- Qdrant (Vector database for semantic search)

### Deployment
- Cloudflare Pages or Vercel (Frontend hosting)
- Fly.io (Vector database hosting)
- GitHub Actions (CI/CD pipeline)

## Installation

### Prerequisites
- Node.js 20+ and npm
- Git
- Supabase account
- Google Gemini API key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/JaineeraSuhas/SECOND-BRAIN.git
cd SECOND-BRAIN

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## Configuration

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- Supabase project setup
- Google Gemini API key
- Database migration execution
- Cloudflare Pages or Vercel deployment

## Documentation

- [Setup Guide](./SETUP.md) - Complete installation instructions
- [Architecture](./docs/ARCHITECTURE.md) - System architecture overview
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Design System](./docs/DESIGN_SYSTEM.md) - macOS Liquid Glass components
- [Deployment Guide](./DEPLOYMENT.md) - Vercel deployment instructions

## Development Commands

```bash
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
```

## Deployment

### Vercel

```bash
npm run build
# Connect to Vercel via dashboard or CLI
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Security

- Row-Level Security (RLS) for user-scoped data access
- Encryption: AES-256 at rest, TLS 1.3 in transit
- Authentication: Google OAuth, Email/Password with MFA
- Rate Limiting and DDoS protection
- Input Validation for XSS and injection prevention

## Performance

- Page Load: < 2 seconds
- Time to Interactive: < 3 seconds
- 3D Graph: 60 FPS with 1K nodes, 30+ FPS with 10K nodes
- Bundle Size: < 500KB initial load

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## License

MIT License - see [LICENSE](./LICENSE) for details

## Acknowledgments

- Apple for macOS design inspiration
- Supabase for amazing free tier
- Google for Gemini API
- Open source community
