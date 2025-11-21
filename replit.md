# City Scavenger Hunt App

## Overview

A social scavenger hunt application where groups of friends explore cities together by completing location-based photo tasks. Users can create or join rooms for specific cities, view Instagram-style task feeds with images, mark tasks as complete with double-tap interactions, and see final statistics when all tasks are finished.

The application emphasizes mobile-first design with gesture-based interactions, following Instagram's familiar feed patterns for navigation and Linear's clean design principles for clarity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens following a reference-based design system (Instagram + Linear influences)

**Design Philosophy**:
- Mobile-first responsive design (320px minimum viewport)
- Single-column feed layout with max-width constraints
- Instagram-inspired gesture interactions (double-tap to mark complete)
- Linear-inspired typography and spacing precision
- Inter font family from Google Fonts CDN

**Key UI Patterns**:
- Card-based layouts for all major screens
- Sticky headers for persistent context (city name, room code)
- Instagram-style task feed with infinite scroll container
- Double-tap interaction pattern for task completion
- Gradient backgrounds for visual hierarchy

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- **Development Server**: Vite middleware integration for HMR
- **Production Server**: Static file serving with bundled server code via esbuild
- **Module System**: ES modules (type: "module" in package.json)

**Current Storage**: In-memory storage implementation (MemStorage class)
- User CRUD operations
- City catalog loaded from JSON file with Zod validation
- Room validation via client-side roomStore
- Designed for easy migration to database-backed storage

**API Design**:
- RESTful endpoints prefixed with `/api`
- JSON request/response format
- City endpoints: GET /api/cities, GET /api/cities/:cityId/challenges
- Session-based request logging middleware
- Raw body capture for webhook support

**City Catalog System**:
- Cities and challenges stored in `server/data/cities.json`
- Validated on server startup using Zod schemas
- challengeCount auto-calculated from challenges array length
- Returns 404 for unknown cityId (frontend shows error UI)
- Easily expandable: add city data + images, restart server (no code changes needed)

### Data Layer

**ORM**: Drizzle ORM configured for PostgreSQL
- Schema definitions in `shared/schema.ts` using Drizzle's type-safe API
- Zod integration for runtime validation via `drizzle-zod`
- Current schema defines:
  - User model (id, username, password)
  - City schema (id, name, description, country, challengeCount)
  - Challenge schema (id, caption, imageUrl)

**Database Strategy**:
- Configured for Neon serverless PostgreSQL
- WebSocket-based connection pooling
- Schema migrations managed via `drizzle-kit`
- Shared types between client and server for type safety

**Note**: While Drizzle is configured for PostgreSQL (Neon), the application currently uses in-memory storage. The database infrastructure is prepared but not yet actively used for persistence.

### Application State Management

**Client-Side State**:
- Room codes stored in `roomStore` (Set-based validation)
- Task completion status tracked locally per feed
- Query client configured with infinite stale time (no automatic refetching)

**Data Flow**:
1. Server loads and validates city catalog from JSON on startup
2. Room creation: user selects city from API-fetched list
3. Room code generated (6-character alphanumeric, ABC-123 format)
4. Room stored in sessionStorage with cityId reference
5. Hunt page fetches challenges from API using room's cityId
6. Local state tracks task completion per user
7. Submit (all tasks complete) triggers navigation to stats page

### Route Structure

**Pages**:
- `/` - Welcome screen (create or join options)
- `/create` - Room creation flow with city selection
- `/join` - Room join flow with code input
- `/hunt/:code` - Main task feed interface
- `/stats/:code` - Completion statistics and leaderboard

**Navigation Flow**:
- Welcome → Create → Code Display → Hunt
- Welcome → Join (with validation) → Hunt
- Hunt → Stats (on submit completion)

### Asset Management

**Images**: Pre-generated challenge images stored in `attached_assets/generated_images/`
- Organized by city folder (e.g., `attached_assets/generated_images/caracas/`)
- Current cities: Caracas (24 PNG images), Test City (3 JPG images, reused)
- Image paths in catalog use format: `/attached_assets/generated_images/[city]/[filename]`
- Asset path aliasing (`@assets`) configured in vite.config.ts

**Adding New Cities**:
- See `CITIES.md` for comprehensive guide
- Place 24 images in new city folder
- Add city data to `server/data/cities.json`
- Restart server (validation ensures data integrity)

**Font Loading**: Google Fonts CDN links in HTML head
- Inter (primary UI font)
- DM Sans, Architects Daughter, Fira Code, Geist Mono (available)

## External Dependencies

### UI Component Libraries
- **Radix UI**: Headless accessible component primitives (20+ components)
- **shadcn/ui**: Pre-styled component implementations using Radix
- **Lucide React**: Icon library for UI elements
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Utility for merging Tailwind classes

### State & Data Management
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form state management
- **Zod**: Schema validation and type inference

### Database & ORM
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect
- **@neondatabase/serverless**: Neon serverless Postgres client with WebSocket support
- **connect-pg-simple**: PostgreSQL session store (configured but not active)

### Build Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type system across client/server/shared code
- **PostCSS + Autoprefixer**: CSS processing
- **Tailwind CSS**: Utility-first styling framework

### Development Tools (Replit-specific)
- **@replit/vite-plugin-runtime-error-modal**: Error overlay
- **@replit/vite-plugin-cartographer**: Code navigation
- **@replit/vite-plugin-dev-banner**: Development indicators

### Utilities
- **date-fns**: Date manipulation library
- **nanoid**: Unique ID generation (used in dev server)
- **ws**: WebSocket library for Neon database connections

### Session Management
Session infrastructure is configured via `connect-pg-simple` but not actively implemented. The storage interface supports user operations but lacks authentication middleware.