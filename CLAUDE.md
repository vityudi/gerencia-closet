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

### Dashboard Pages

#### Products Page (`app/dashboard/products/page.tsx`)
- Displays products in a table with search functionality
- Search filters: product name, SKU
- Columns: Product name, SKU, Stock (color-coded badges), Price (BRL), Actions
- Uses `ProductsTable` component from `@/components/products-table.tsx`

#### Customers Page (`app/dashboard/customers/page.tsx`)
- Displays customers in a table with search functionality
- Search filters: name, email, phone
- Columns: Full name, Email (with icon), Phone (with icon), Actions
- Uses `CustomersTable` component from `@/components/customers-table.tsx`

#### Sales Page (`app/dashboard/sales/page.tsx`)
- Displays sales in a table with search functionality
- Search filters: date, time, seller name, payment method, amount
- Columns: Date/Time, Value (BRL), Payment method, Seller (with role), Status (color-coded), Actions
- Includes join with `team_members` to display seller information
- Uses `SalesTable` component from `@/components/sales-table.tsx`

#### Team Page (`app/dashboard/team/page.tsx`)
- Displays team members with sales performance statistics
- Shows member details: name, email, phone, role, hire date, status
- Displays sales statistics: total sales, sales count, average ticket
- Uses card-based layout (not table)

#### Settings Page (`app/dashboard/settings/page.tsx`)
**Purpose**: Central configuration hub for the entire application

The settings page allows users to configure:

1. **Product Properties Configuration**
   - Define custom product attributes and fields
   - Configure which product properties are displayed/hidden
   - Set validation rules for product data
   - Manage product categorization and SKU formats

2. **Page-Specific Settings**
   - Configure table columns visibility and order
   - Set default filters and sorting preferences
   - Customize pagination and display options
   - Configure data refresh intervals

3. **Integration Settings**
   - **Messaging API**: Configure chat/messaging integrations for customer communication
   - **Payment Gateways**: Set up payment method configurations
   - **Email/SMS**: Configure notification services
   - **Third-party APIs**: Manage external service integrations
   - API keys and authentication credentials management

4. **Store Configuration**
   - Store-specific settings and preferences
   - Business hours and operational parameters
   - Tax and currency settings
   - Multi-store synchronization options

5. **User Preferences**
   - Theme and display preferences
   - Language and localization
   - Notification preferences
   - Dashboard customization

**Implementation Notes**:
- Settings should be scoped per store (use `store_id`)
- Store settings in a dedicated `settings` or `store_settings` table in Supabase
- Use form validation with Zod schemas
- Consider using tabs or accordion for organizing different settings sections
- Implement real-time updates when settings change (use Supabase real-time subscriptions)
- Cache settings in React Context or local state for performance

### Table Component Patterns

All data tables follow a consistent pattern using TanStack Table v8:

**Common Features**:
- Search input with icon positioned inside the field
- Multi-field filtering (searches across multiple columns)
- Sortable columns
- Pagination with "Anterior/Próximo" buttons
- Item count display
- Empty state handling
- Actions dropdown menu on each row

**Standard Table Structure**:
```typescript
// 1. Define type matching database schema
type Item = {
  id: string
  // ... other fields
}

// 2. Define columns with custom filter functions
const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "field_name",
    header: "Display Name",
    cell: ({ row }) => <div>{row.getValue("field_name")}</div>,
    filterFn: (row, id, value) => {
      // Custom multi-field search logic
      return field1.includes(value) || field2.includes(value)
    },
  },
  // ... more columns
]

// 3. Use table hooks with filtering
const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
const table = useReactTable({
  data,
  columns,
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: { columnFilters },
  // ... other config
})

// 4. Render search input and table
<Input
  placeholder="Search across fields..."
  value={(table.getColumn("main_field")?.getFilterValue() as string) ?? ""}
  onChange={(event) => table.getColumn("main_field")?.setFilterValue(event.target.value)}
  className="pl-8"
/>
```

### Development Notes
- Next.js 15 uses async params: `const { id } = await params` in route handlers
- TypeScript strict mode is enabled
- ESLint configured with Next.js rules (typescript and core-web-vitals)
- The project uses Tailwind CSS v4 with PostCSS
- All currency values should be formatted as Brazilian Real (BRL) using `Intl.NumberFormat`
- All dates should be formatted using pt-BR locale
- Color-coded badges are used for status indicators across the application
