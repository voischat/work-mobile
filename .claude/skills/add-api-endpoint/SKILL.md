---
name: add-api-endpoint
description: Add new backend API endpoints for backend functionality
---

# Add API Endpoint Skill

## Overview

This skill helps you add new backend API endpoints to the Weila Work WebView application. There are two main patterns for API integration:

1. **useWeilaFetch**: For fetching data with reactive state management
2. **weilaApi**: For simple actions where you don't care about the response

## API Response Format

All Weila APIs return responses in this format:

```json
{
  "errcode": 0,
  "errmsg": "",
  "data": { /* actual data */ }
}
```

- `errcode: 0` means success
- `errcode: 31` triggers automatic token refresh
- Other `errcode` values throw errors with `errmsg`

## Pattern 1: Data Fetching with useWeilaFetch

### Basic Usage

```typescript
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// Define response type
interface ApiResponse {
  id: number
  name: string
}

// In component
const {
  data: apiData,
  error: apiError,
  isFetching: isApiFetching,
  execute: refetchApi
} = useWeilaFetch<ApiResponse>('/corp/your/endpoint')
  .get() // or .post(), .put(), .delete()
  .json()

// Access data (automatically picked from nested structure)
const result = computed(() => apiData.value)
```

### With Parameters

```typescript
const { data, error, isFetching } = useWeilaFetch<ApiResponse>('/corp/your/endpoint')
  .post(() => ({
    param1: value1,
    param2: value2
  }))
  .json()
```

### With Query Parameters

```typescript
import { computed } from 'vue'

const currentPage = ref(1)
const pageSize = ref(20)
const searchQuery = ref('')

// Build dynamic URL with query parameters
const apiUrl = computed(() => `/corp/your/endpoint?page=${currentPage.value}&size=${pageSize.value}&keyword=${searchQuery.value}`)

const { data, error, isFetching } = useWeilaFetch<ApiResponse>(apiUrl)
  .get()
  .json()
```

### Error Handling

```typescript
watch(error, (newError) => {
  if (newError) {
    showToast(newError.message)
  }
})
```

## Pattern 2: Simple Actions with weilaApi

### Basic Usage

```typescript
import { weilaApi } from '~/utils/weilaApi'

async function handleAction() {
  try {
    await weilaApi.v2.fetch('/corp/your/endpoint', {
      body: {
        param1: value1,
        param2: value2
      }
    })
    showToast('操作成功')
    // Refresh data if needed
    emit('refresh')
  }
  catch (error) {
    console.error('操作失败:', error)
    showToast('操作失败')
  }
}
```

### Different HTTP Methods

```typescript
// GET request
await weilaApi.v2.fetch('/corp/your/endpoint?param=value')

// POST request
await weilaApi.v2.fetch('/corp/your/endpoint', {
  method: 'POST',
  body: { key: 'value' }
})

// PUT request
await weilaApi.v2.fetch('/corp/your/endpoint', {
  method: 'PUT',
  body: { key: 'value' }
})

// DELETE request
await weilaApi.v2.fetch('/corp/your/endpoint', {
  method: 'DELETE',
  body: { id: itemId }
})
```

## Data Transformation

### useWeilaFetch Auto-picking

The `pickWeilaData` function automatically extracts nested data:

```typescript
// API Response: { errcode: 0, errmsg: '', data: { user: { id: 1, name: 'John' } } }
// Result: { id: 1, name: 'John' }

// API Response: { errcode: 0, errmsg: '', data: { items: [...] } }
// Result: [...] (the items array)
```

### Manual Data Access

If you need the full response structure:

```typescript
const { data: rawData } = useWeilaFetch<WeilaApiResponse>('/corp/your/endpoint').get().json()
const fullResponse = computed(() => rawData.value)
```

## Error Message Parsing

Errors from weilaApi are stringified JSON. Use `parseMaybeWeilaErrorString` to extract the error message:

```typescript
import { parseMaybeWeilaErrorString } from '~/utils/error'

try {
  await weilaApi.v2.fetch('/corp/your/endpoint', { body: data })
}
catch (error: any) {
  const errorString = parseMaybeWeilaErrorString(error.message)
  showToast(errorString)
}
```

## Common Endpoint Patterns

### Authentication Required

All endpoints require authentication via the V2 signature system:

- `appid`: Application ID
- `et`: Timestamp (seconds)
- `sign`: MD5 signature
- `token`: User access token
- `uuid`: Unique identifier

These are automatically added by `useWeilaFetch` and `weilaApi`.

### Common Endpoint Categories

- `/corp/auth/*`: Authentication endpoints
- `/corp/org/*`: Organization management
- `/corp/address/*`: Address book (departments, members, groups)
- `/corp/user/*`: User profile management

## Examples

### 1. Fetching User Profile

```typescript
interface UserProfile {
  id: number
  name: string
  email: string
  avatar: string
}

const { data: profile, error, isFetching } = useWeilaFetch<UserProfile>('/corp/user/profile')
  .get()
  .json()

const userProfile = computed(() => profile.value)
```

### 2. Updating Department

```typescript
async function updateDepartment(deptId: number, newName: string) {
  try {
    await weilaApi.v2.fetch('/corp/address/update-department', {
      body: {
        department_id: deptId,
        name: newName
      }
    })
    showToast('部门更新成功')
    // Refresh department list
    refreshDepartments()
  }
  catch (error) {
    console.error('更新失败:', error)
    showToast('更新失败')
  }
}
```

### 3. Search with Pagination

```typescript
import { computed } from 'vue'

interface SearchResponse {
  total: number
  items: Array<{ id: number, name: string }>
}

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// Build dynamic URL with query parameters (including search)
const searchUrl = computed(() =>
  `/corp/address/search?keyword=${searchQuery.value}&page=${currentPage.value}&size=${pageSize.value}`
)

const { data: searchResults, error, isFetching } = useWeilaFetch<SearchResponse>(searchUrl)
  .get()
  .json()

const results = computed(() => searchResults.value?.items || [])
const total = computed(() => searchResults.value?.total || 0)
```

## Best Practices

1. **Confirm Examples** always make sure to confirm the API examples existed first before using them
2. **Always define TypeScript interfaces** for API responses
3. **Use computed refs** for reactive data access
4. **Handle errors appropriately** with user-friendly messages
5. **Use debounced search** for better UX (300ms delay)
6. **Implement loading states** with `isFetching`
7. **Use emit('refresh')** to notify parent components of data changes
8. **Choose the right pattern**:
   - `useWeilaFetch` for data you need to display/react to
   - `weilaApi` for simple actions (create, update, delete)
9. **Follow existing naming conventions** in the codebase
