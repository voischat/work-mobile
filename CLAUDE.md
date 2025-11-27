# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Weila Work WebView** - a Vue 3 corporate management web application for the "微喇" enterprise communication platform. It provides organization management, user authentication, department/group management, and member administration features.

## Development Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Run development server with hot reload
pnpm dev

# Build for production
pnpm build

# Build for staging environment
pnpm build:staging

# Run linting
pnpm lint

# Run TypeScript type checking
pnpm typecheck

# Run tests
pnpm test

# Update dependencies
pnpm up
```

## Architecture Overview

### Technology Stack

- **Frontend**: Vue 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite (not Bun - ignore any Bun references in existing docs)
- **Package Manager**: pnpm
- **Styling**: TailwindCSS with PostCSS
- **Language**: TypeScript with strict configuration
- **Routing**: File-based routing via `unplugin-vue-router`
- **HTTP Client**: Custom `useWeilaFetch` composable
- **Testing**: Vitest with Vue Test Utils

### Key Architectural Patterns

#### 1. File-Based Routing

Routes are automatically generated from the `src/pages/` directory structure:

- `src/pages/members/index.vue` → `/members/`
- `src/pages/departments/[id]/members.vue` → `/departments/:id/members`
- Uses hash-based routing (`createWebHashHistory`)

#### 2. Custom HTTP Client (`useWeilaFetch`)

Sophisticated fetch wrapper with:

- **V2 API Signature System**: MD5-based signatures with timestamps
- **Automatic Token Management**: Handles access/refresh tokens
- **Token Refresh Queue**: Prevents simultaneous refresh attempts
- **Error Handling**: Standardized `errcode`/`errmsg` format
- **Pagination Support**: Built-in page/size handling

Usage pattern:

```typescript
const { data, error, isFetching } = useWeilaFetch('/corp/address/members', {
  query: { page: 1, size: 20 }
})
```

#### 3. Modal System (`useModal`)

Global modal management with:

```typescript
const { showModal } = useModal()
showModal({
  title: '确认操作',
  message: '确定要执行此操作吗？',
  onConfirm: async () => { /* handle confirmation */ }
})
```

#### 4. Authentication Pattern (`useAuth`)

Simple localStorage-based auth with reactive tokens:

```typescript
const { saveAuth, clearAuth } = useAuth()
```

### API Integration

All APIs use `/v2/` prefix with query parameter authentication:

- Required params: `appid`, `et` (timestamp), `sign` (MD5 signature), `token`
- Response format: `{ errcode: number, errmsg: string, data: any }`
- Error code 31 triggers automatic token refresh

Key endpoint categories:

- **Auth**: `/corp/auth/*` (login, register, refresh)
- **Organization**: `/corp/org/*` (org management)
- **Address Book**: `/corp/address/*` (departments, members, groups)
- **User**: `/corp/user/*` (profile management)

### Data Fetching Patterns

**Pagination with Infinite Scroll** (see `members/index.vue`):

- Use `usePage()` composable for page/size management
- Accumulate results in `allMembers` array
- Use `isAtBottom` for scroll detection
- Implement debounced search (300ms)

**Search Integration**:

```typescript
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 300)
const url = computed(() => `/corp/address/members?keyword=${debouncedSearch.value}`)
```

### Project Structure

```
src/
├── components/     # Auto-imported Vue components
├── composables/    # Vue composition functions
│   ├── useAuth.ts          # Authentication management
│   ├── useModal.ts         # Global modal system
│   ├── useWeilaFetch.ts    # HTTP client with auth
│   └── usePage.ts          # Pagination helpers
├── pages/         # File-based routing pages
├── styles/        # Global styles and Tailwind config
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── shared/        # Shared resources
```

### TypeScript Configuration

- Strict mode enabled
- Path alias: `~/` → `src/`
- Auto-imports for Vue APIs and composables
- Component auto-imports from `src/components/`

### Development Guidelines

1. **Use Composition API**: Always use `<script setup>` syntax
2. **Follow File-Based Routing**: Create pages in `src/pages/` directory
3. **Use Custom Fetch**: Always use `useWeilaFetch` for API calls
4. **Handle Authentication**: Check token expiration and handle refresh
5. **Implement Error Handling**: Use standardized error responses
6. **Use Modal System**: Use `useModal` for confirmations and alerts
7. **Follow Pagination Pattern**: Use `usePage` for paginated endpoints
8. **Type Safety**: Define interfaces for all API responses

### Common Patterns

**Loading Data**:

```typescript
const { data, error, isFetching } = useWeilaFetch('/corp/address/members')
const members = computed(() => pickWeilaData(data.value) || [])
```

**Form Submission**:

```typescript
const { execute, isFetching } = useWeilaFetch('/corp/user/modify', {
  immediate: false,
  query: { name: newName.value }
}).post()
```

**Modal Confirmation**:

```typescript
const { showModal } = useModal()
async function confirmDelete() {
  const confirmed = await showModal({
    title: '删除确认',
    message: '确定要删除此项目吗？'
  })
  if (confirmed) {
    // Perform deletion
  }
}
```

### Important Notes

- **Vite Configuration**: Development proxy points to `demo.weila.hk`
- **Authentication**: Tokens are stored in localStorage with automatic refresh
- **Error Handling**: Always check `errcode` in API responses
- **Pagination**: Most list APIs support `page` and `size` parameters
- **Search**: Use debounced search for better UX
- **Styling**: Use TailwindCSS classes, avoid inline styles
- **Icons**: SVG icons are embedded directly in components
