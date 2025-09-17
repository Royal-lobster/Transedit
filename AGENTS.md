## Project Overview
**TransEdit** is a Next.js web application for reviewing and editing translation files (locale JSONs) in a portable, local-first workflow.

**Key Features:**
- Upload translation files (e.g., `en.json` and a target language JSON) to generate a `.transedit` review file.
- Open a review dashboard to edit translations with autosave, undo, and snapshots.
- Export updated locale JSON files after review.
- All operations happen locally in the browser—no server or external database required. Data is stored in IndexedDB (Dexie).
- Modern UI using shadcn/ui components, lucide icons, and Tailwind CSS.

---

## Component Structure

## Hook Structure
- Custom Hooks for Logic: Extracting complex logic into custom hooks (like usePagination, useClosePositions, usePositionModals).
- Single Responsibility: Each hook should handle one specific concern or related set of functionality.
- Clean API: Hooks should return a clean, well-structured object with named properties rather than arrays or complex nested structures.
- Reusability: Hooks should be designed for reuse across different components when possible.
- Separation from UI: Business logic should live in hooks, keeping components focused on rendering.
- Use tanstack query for async functions. When ever you see isLoading, isFetching, isSuccess, isError, etc. its a sign that you should use tanstack query.

## Overall Code Style
- Readability First: Code should be easy to understand at a glance, avoiding clever tricks that sacrifice clarity.
- Explicit over Implicit: Prefer explicit, descriptive code over implicit or overly concise approaches.
- Consistent Patterns: Following consistent patterns throughout the codebase for similar functionality.
- Modular Design: Breaking down complex features into modular, composable pieces.
- Avoiding Repetition: Using composition and abstraction to avoid duplicating code.
- This approach results in a codebase that's more maintainable, testable, and easier for team members to understand and contribute to.

## Folder Structure Rules

### Page Organization
- Use route groups (in parentheses) to organize related pages and shared layouts
- Co-locate components, hooks, and schemas with their respective pages in dedicated folders:
  - `_components/`: UI components specific to the page
  - `_hooks/`: Custom hooks specific to the page functionality
  - `_schema/`: Zod schemas and TypeScript types for the page
  - `_actions.ts`: Server actions for the page
- Keep files under 500 lines of code - if a file exceeds this limit, break it down into smaller, more focused components

### Component Naming Conventions
- Use `.server.tsx` suffix for server components
- Use `.loading.tsx` suffix for loading state components
- Name components based on their functionality, not their visual appearance
- Group related component variants with consistent naming (e.g., `agents-table.tsx`, `agents-table.server.tsx`, `agents-table.loading.tsx`)
- Use kebab-case for filenames (e.g., `use-create-review.ts`, `review-client.tsx`)

### Feature Organization
- Organize complex features into nested directories with their own _components, _hooks, and _schema folders
- For deeply nested features (like agent proposals), maintain consistent structure at each level
- Use layout.tsx files to define shared UI elements for nested routes

### Internationalization
- Ensure all user-facing text is wrapped in translation functions
- Store translations in src/messages/{locale}.json files
- Keep translation keys organized by feature/page for easier maintenance
- Update all language files when adding new text

### Shared Components
- Place truly reusable components in the root `/components` directory
- Organize UI primitives in `/components/ui`
- Place shared icons in `/components/icons`
- Use `/components/shared` for business-specific reusable components

### API Routes
- Organize API routes by domain/entity (e.g., `/api/agents`, `/api/prices`)
- Co-locate related schemas and utilities with their API routes
- Use consistent response formats across all API endpoints

### Asset Organization
- Store static assets in `/public/assets` organized by type:
  - `/public/assets/chains`: Chain-specific icons
  - `/public/assets/fonts`: Custom fonts
  - `/public/assets/icons`: General icons
  - `/public/assets/illustrations`: Larger illustrations
  - `/public/assets/images`: Photos and other images

### Code Organization Principles
- Prefer co-location over centralization for better discoverability
- Keep related code close together in the file tree
- Maintain consistent patterns at each level of nesting
- Split complex components into smaller pieces rather than creating large files
- Use explicit naming over clever abbreviations

---

## Refactor Notes (2025-09-17)

- Co-located page-specific logic in custom hooks under `_hooks/`:
  - `app/create/_hooks/useCreateReview.ts`: encapsulates form state, JSON validation, file reading, and `.transedit` generation + share URL.
  - `app/review/_hooks/useReview.ts`: encapsulates loading `.transedit` (from file or URL hash), autosave to IndexedDB, snapshot management, derived search/filter, and live progress.
- Updated `app/create/page.tsx` and `app/review/page.tsx` to use these hooks, keeping components focused on rendering.

Additional updates:
- Extracted client-only UI into `_components` and converted pages to server components:
  - `app/create/_components/create-client.tsx` rendered by `app/create/page.tsx` (server component)
  - `app/review/_components/review-client.tsx` rendered by `app/review/page.tsx` (server component)
- Standardized hook filenames to kebab-case and added shim files for transitional compatibility.

Suggested next steps:
- Extract small UI pieces from `app/review/page.tsx` into `_components/` (e.g., `translations-list.tsx`, `snapshots-panel.tsx`).
- Add zod schemas in `_schema/` if additional validation is needed for review inputs.
- Introduce basic unit tests for `lib/transedit` helpers (flatten/unflatten, mergeProgress, stats).
- Consider TanStack Query for any future async IO beyond Dexie calls, per guidelines.