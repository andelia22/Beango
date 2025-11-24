# City Scavenger Hunt App

## Overview

A social scavenger hunt mobile application designed for groups of friends to explore cities by completing location-based photo tasks. Users can create or join rooms, view an Instagram-style feed of tasks, mark tasks complete with a double-tap, and view final statistics. The project aims for a mobile-first design with intuitive gesture-based interactions, drawing inspiration from Instagram's feed patterns and Linear's clean design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

**Framework**: React with TypeScript (Vite).
**Routing**: Wouter.
**State Management**: TanStack Query for server state.
**UI**: shadcn/ui (Radix UI primitives), Tailwind CSS with custom design tokens.
**Design**: Mobile-first, single-column feed, Instagram-inspired gestures (double-tap to complete), Linear-inspired typography, Inter font.
**Key UI Patterns**: Card-based layouts, sticky headers, infinite scroll task feed, gradient backgrounds.

### Backend

**Server**: Express.js with TypeScript.
**Storage**: PostgreSQL via Drizzle ORM.
**API**: RESTful JSON endpoints for authentication, cities, challenges, completions, and user preferences. Session-based authentication via Firebase.
**City Catalog**: Cities and challenges defined in `server/data/cities.json`, validated with Zod on startup, easily extensible.

### Data Layer

**ORM**: Drizzle ORM for PostgreSQL, using `drizzle-zod` for runtime validation.
**Schema**: Defines users, beango_completions, and sessions tables, along with JSON schemas for City and Challenge data.
**Database**: Configured for Neon serverless PostgreSQL, with schema migrations via `drizzle-kit`.
**Session Management**: `connect-pg-simple` for PostgreSQL-backed sessions.

### Application State Management

**Client-Side**: `roomStore` for room codes, local task completion tracking, TanStack Query for data caching.
**Data Flow**: Authentication, city selection, room creation/joining, challenge fetching, local task completion, submission to database, and history/profile views.

### Route Structure

**Pages**:
- `/`: Landing (authentication).
- `/interests`: Interest selection/editing.
- `/welcome`: Create/join room options.
- `/create`: Room creation.
- `/join`: Room joining.
- `/hunt/:code`: Main task feed.
- `/stats/:code`: Completion statistics.
- `/profile`: User profile.
- `/history`: Completed BeanGos list.

### Asset Management

**Images**: Pre-generated challenge images in `attached_assets/generated_images/`, organized by city.
**Fonts**: Inter loaded via Google Fonts CDN.

### User Interests System

**Overview**: Persistent user preference system for personalization, supporting anonymous (localStorage) and authenticated (database) storage with migration.
**Features**: 13 interest categories.
**UI**: `PillSelector` component for multi-select.
**Modes**: Onboarding for new users, edit mode for existing users.
**Migration**: Anonymous interests in localStorage are migrated to the database upon user authentication.

## External Dependencies

### UI/Styling

- **Radix UI**: Headless accessible components.
- **shadcn/ui**: Styled components built on Radix.
- **Lucide React**: Icon library.
- **Tailwind CSS**: Utility-first styling.

### State & Data Management

- **TanStack Query**: Server state and caching.
- **Wouter**: Client-side routing.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.

### Database & ORM

- **Drizzle ORM**: Type-safe ORM for PostgreSQL.
- **@neondatabase/serverless**: Neon serverless Postgres client.
- **connect-pg-simple**: PostgreSQL session store.

### Build Tools

- **Vite**: Frontend build and dev server.
- **esbuild**: Server-side bundling.
- **TypeScript**: Type system.
- **PostCSS + Autoprefixer**: CSS processing.

### Utilities

- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.
- **ws**: WebSocket library.

### Authentication & Session Management

- **Firebase Authentication**: Production-ready OAuth with Google Sign-in.
  - **Provider**: Google.
  - **SDKs**: Firebase Client SDK (frontend), Firebase Admin SDK (backend).
  - **Session**: `express-session` with `connect-pg-simple` (PostgreSQL store).
- **Deployment Requirements**: Firebase environment variables and authorized domains configured for production.