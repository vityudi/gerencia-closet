# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gerencia Closet is a multi-store management dashboard built with Next.js 15 (App Router), React 19, Supabase, and shadcn/ui. The application enables users to manage multiple retail stores, track products, sales, customers, and team members.

## Development Commands

### Running the Application
```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Build for production
npm start          # Start production server
```

### Code Quality
```bash
npm run lint       # Run ESLint (uses eslint.config.mjs)
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router and React Server Components
- **Language**: TypeScript with strict mode enabled
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **UI**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API for global store selection
- **Data Tables**: TanStack Table (React Table v8)
- **Charts**: Recharts
- **Icons**: Tabler Icons React

### Path Aliases
The project uses `@/*` to reference the root directory:
```typescript
import { useStore } from '@/contexts/store-context'
import { Button } from '@/components/ui/button'
```

### Directory Structure
```
app/
  ├── api/              # API routes (Next.js Route Handlers)
  │   └── stores/[id]/  # Store-scoped endpoints (products, sales, customers, team)
  ├── dashboard/        # Dashboard pages with shared layout
  └── layout.tsx        # Root layout with theme provider
components/
  ├── ui/               # shadcn/ui base components (button, dialog, table, etc.)
  └── [features]        # Feature-specific components (app-sidebar, store-selector, etc.)
contexts/
  └── store-context.tsx # Global store selection state
hooks/
  └── use-store.ts      # Store selection and URL sync hooks
lib/
  ├── supabase/
  │   ├── client.ts     # Browser client for client components
  │   └── server.ts     # Server client for server components/API routes
  └── utils.ts          # Utility functions (cn for class merging)
```

### Key Architectural Patterns

#### Multi-Store Context
The application uses a global context (`StoreContext`) to manage the currently selected store across the dashboard:
- Store selection persists to `localStorage`
- URL query parameter `store_id` can override the stored selection
- Use `useStore()` hook to access `selectedStore`, `stores`, and selection methods
- Use `useSelectedStoreId()` hook to get the active store ID (context or URL)

#### Supabase Client Patterns
Different contexts require different Supabase clients:

**Server Components & API Routes:**
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server'
// Uses cookies for auth, respects RLS
```

**Service Role (Admin operations):**
```typescript
import { createSupabaseServiceClient } from '@/lib/supabase/server'
// Bypasses RLS, requires SUPABASE_SERVICE_ROLE_KEY env var
```

**Client Components:**
```typescript
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
// Browser-based auth with cookies
```

#### Database Schema
Core tables (see `sample-data.sql` for structure):
- `stores` - Store entities with name, address, etc.
- `products` - Products scoped to stores via `store_id`
- `customers` - Customers scoped to stores
- `sales` - Sales records with references to products and team members
- `team_members` - Staff members scoped to stores

Foreign key relationships:
- All domain tables have `store_id` referencing `stores(id)` with ON DELETE CASCADE
- `sales.team_member_id` references `team_members(id)`

#### API Route Patterns
API routes follow RESTful conventions:
- `GET /api/stores` - List all stores
- `GET /api/stores/[id]/products` - Get products for a specific store
- All store-scoped routes use `params.id` to filter by `store_id`
- Use service client for most data fetching to bypass RLS

Example pattern:
```typescript
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('store_id', id)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ items: data ?? [] })
}
```

#### UI Component Patterns
- Use shadcn/ui components from `@/components/ui/` as building blocks
- Tabler Icons for all iconography (import from `@tabler/icons-react`)
- Client components must have `"use client"` directive
- Use `cn()` utility from `@/lib/utils` for conditional className merging

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Public anon key for client auth
SUPABASE_SERVICE_ROLE_KEY=       # Service role key for admin operations
```

### Dashboard Layout
The dashboard uses a persistent layout (`app/dashboard/layout.tsx`) with:
- `StoreProvider` wrapping all dashboard routes
- `SidebarProvider` for collapsible sidebar state
- `AppSidebar` with navigation links
- `SiteHeader` with store selector and user menu

### Development Notes
- Next.js 15 uses async params: `const { id } = await params` in route handlers
- TypeScript strict mode is enabled
- ESLint configured with Next.js rules (typescript and core-web-vitals)
- The project uses Tailwind CSS v4 with PostCSS
