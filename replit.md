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

**Storage**: DatabaseStorage class using PostgreSQL
- All user and completion data persists to database via Drizzle ORM
- City catalog loaded from JSON file with Zod validation (by design)
- Room validation via client-side roomStore
- Production-ready persistence with proper error handling

**API Design**:
- RESTful endpoints prefixed with `/api`
- JSON request/response format
- Authentication: GET /api/auth/user, POST /api/auth/logout
- City endpoints: GET /api/cities, GET /api/cities/:cityId/challenges
- Completion endpoints: POST /api/beango-completions, GET /api/beango-completions
- User preferences: PATCH /api/auth/user/interests
- Session-based authentication via Replit Auth
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
  - users table (id, email, firstName, lastName, profileImageUrl, interests, createdAt, updatedAt)
  - beango_completions table (id, userId, cityId, cityName, cityImageUrl, roomCode, participantCount, completedAt)
  - sessions table (sid, sess, expire) - managed by connect-pg-simple
  - City schema (id, name, description, country, challengeCount) - JSON-based
  - Challenge schema (id, caption, imageUrl) - JSON-based

**Database Strategy**:
- Configured for Neon serverless PostgreSQL
- WebSocket-based connection pooling
- Schema migrations managed via `drizzle-kit`
- Shared types between client and server for type safety

**Active Database Usage**:
- All user data and BeanGo completions persist to PostgreSQL
- DatabaseStorage class implements IStorage interface using Drizzle ORM
- Sessions managed via connect-pg-simple (PostgreSQL-backed)
- Proper defaults injected: participantCount=1, cityImageUrl handled as nullable
- Completions ordered by completed_at descending
- UUID generation for missing IDs in upsertUser

### Application State Management

**Client-Side State**:
- Room codes stored in `roomStore` (Set-based validation)
- Task completion status tracked locally per feed
- Query client configured with infinite stale time (no automatic refetching)

**Data Flow**:
1. User authenticates via Replit Auth (OAuth or email/password)
2. Server loads and validates city catalog from JSON on startup
3. Room creation: authenticated user selects city from API-fetched list
4. Room code generated (6-character alphanumeric, ABC-123 format)
5. Room stored in sessionStorage with cityId reference
6. Hunt page fetches challenges from API using room's cityId
7. Local state tracks task completion per user
8. Submit (all tasks complete) saves to database and triggers navigation to stats page
9. History and Profile pages query database for user's completions

### Route Structure

**Pages**:
- `/` - Landing page with authentication (sign in required)
- `/interests` - Interest selection page (onboarding for new users)
- `/interests?edit=true` - Interest editing page (from profile)
- `/welcome` - Welcome screen (create or join options) - protected
- `/create` - Room creation flow with city selection - protected
- `/join` - Room join flow with code input - protected
- `/hunt/:code` - Main task feed interface - protected
- `/stats/:code` - Completion statistics and leaderboard - protected
- `/profile` - User profile with stats and interests - protected
- `/history` - List of user's completed BeanGos with city images - protected

**Navigation Flow**:
- Landing (unauthenticated) → Interests (onboarding) → Welcome
- Landing (unauthenticated) → Sign In → LoadingScreen (migration) → Welcome
- Welcome → Profile / History (footer navigation)
- Profile → Interests?edit=true (edit mode) → Profile
- Welcome → Create → Code Display → Hunt
- Welcome → Join (with validation) → Hunt
- Hunt → Stats (on submit completion)
- Stats → History (via navigation)
- Any protected page → Landing (if not authenticated)

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

### Authentication & Session Management

**Replit Auth Integration**:
- OAuth providers: Google, GitHub, Facebook
- Email/password authentication via Replit's hosted UI
- Session management via express-session with PostgreSQL store (connect-pg-simple)
- Session secret stored in environment variable SESSION_SECRET

**Authentication Flow**:
1. User clicks "Sign In to Start" on Landing page
2. Redirected to /api/auth/login endpoint
3. Replit Auth handles OAuth/email login
4. User redirected back with authenticated session
5. useAuth hook fetches user data from GET /api/auth/user
6. Protected routes guard access to authenticated pages

**Frontend Auth Infrastructure**:
- `useAuth()` hook: Returns user object, loading/error states, isAuthenticated/isUnauthenticated flags
- `ProtectedRoute`: Redirects to Landing if not authenticated, shows error UI on fetch failures
- Proper 401 handling: Treats unauthorized as null user (not error state)
- Error recovery: Retry button on auth failures

**Backend Auth Middleware**:
- `requireAuth`: Middleware that returns 401 if no session user
- Applied to all protected API endpoints (completions, user data)
- User ID from session used for database queries

**Database Integration**:
- User records created/updated on login via upsertUser
- Completions linked to user via foreign key (user_id references users.id)
- Sessions persisted to PostgreSQL sessions table
- Proper cleanup on logout (session destroyed)

### User Interests System

**Overview**:
- Persistent user preference system for personalizing the BeanGo experience
- Supports both anonymous (localStorage) and authenticated (database) storage
- Seamless migration from anonymous to authenticated state
- 13 interest categories: Food & Drink, Art & Creativity, Photo & Video Challenges, Nature & Outdoors, Culture & History, Shopping & Markets, Puzzles & Clues, Social & Interaction, Movement & Exploration, Sports & Play, Nightlife & Ambience, Audio / Sound-Based, Group Challenges

**Database Schema**:
- interests field in users table: text().array() for storing string array
- Nullable to support users who haven't selected interests yet
- Updated via PATCH /api/auth/user/interests endpoint

**Interest Selection UI** (`/interests`):
- **Onboarding Mode** (default): New users select interests during first-time setup
  - Displays "Next" and "Skip for now" buttons
  - Anonymous users: Saves to localStorage (key: "userInterests")
  - Authenticated users: Saves to database via API
  - Navigates to /welcome after completion
- **Edit Mode** (?edit=true): Existing users update their interests from profile
  - Displays "Save Changes" and "Cancel" buttons
  - Pre-populates current interests from database
  - Saves changes to database
  - Navigates back to /profile after save/cancel

**PillSelector Component**:
- Reusable component for multi-select interest pills
- Uses useEffect to sync with initialSelected prop for async data loading
- Supports minimum selection requirement (configurable)
- Visual feedback for selected/unselected states

**Data Migration**:
- Triggered in LoadingScreen when user transitions from anonymous to authenticated
- migrateAnonymousDataToAccount() in client/src/lib/dataMigration.ts
- Reads interests from localStorage (key: "userInterests")
- Saves to database via PATCH /api/auth/user/interests
- Clears localStorage after successful migration
- Uses useRef to ensure migration only runs once per session

**Profile Display**:
- Shows interests as read-only badges if user has selected any
- "Edit" button navigates to /interests?edit=true for updates
- Empty state displays "Add Interests" button with personalization message
- Seamlessly integrates with existing profile stats (BeanGos completed, cities explored)