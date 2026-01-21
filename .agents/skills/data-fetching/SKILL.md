---
name: data-fetching
description: Data fetching patterns for Weila Work WebView
---

# Data Fetching

## Quick Reference

**Response Format**: `{ errcode: 0, errmsg: "", data: {...} }`

- `errcode: 0` = success
- `errcode: 31` = auto token refresh
- Other codes = error with `errmsg`

**Choose Your Pattern**:

- `useWeilaFetch` → Display/reactive data
- `weilaApi.v2.fetch` → Simple actions (create/update/delete)

## CRITICAL Conventions

You should ask me for providing a url examples when `api-examples.md` is missing.

1. **All APIs default to POST**
2. **URL format**: Use `/corp/endpoint` (omit base URL and auth params like `appid`, `et`, `sign`, `token` - auto-handled)
3. **api-examples.md format**:
   - Line 1: Full URL with query params (reference only)
   - Line 2-N: First `{...}` = request body params
   - Line N+1: Second `{...}` = response body
4. **Query params in URL**: For pagination/filters, add to URL: `?page=0&size=20`

## Pattern 1: useWeilaFetch (Reactive Data)

```ts
// Basic (defaults to POST, no .json() needed)
const { data, error, isFetching } = useWeilaFetch<Type>('/corp/endpoint').json()

// With body params
const { data } = useWeilaFetch<Type>('/corp/endpoint')
  .post(() => ({ param: value }))
  .json()

// With query params (pagination/filters)
const url = computed(() => `/corp/address/get-dept-list?page=${page.value}&size=20`)
const { data } = useWeilaFetch<Type>(url).json()

// Error handling
watch(error, err => err && showToast(err.message))
```

**Data Auto-extraction**: `pickWeilaData` returns deepest nested value from `data` property

## Pattern 2: weilaApi (Simple Actions)

```ts
// Basic action (POST by default)
await weilaApi.v2.fetch('/corp/address/create-dept', {
  body: { name: '研发部' }
})

// With error handling
try {
  await weilaApi.v2.fetch('/corp/address/change-member', {
    body: { user_id: 123, name: 'New Name' }
  })
  showToast('操作成功')
  emit('refresh')
}
catch (error: any) {
  const msg = parseMaybeWeilaErrorString(error.message)
  showToast(msg)
}
```

## Reading api-examples.md

Example structure:

```
http://localhost:8090/v2/corp/address/create-dept?appid=...&token=...  ← Ignore (reference)
{                                                                        ← Request body
  "name": "研发部4"
}
{                                                                        ← Response body
  "errcode": 0,
  "data": { "dept": { "id": 31, "name": "研发部1" } }
}
```

Usage: `weilaApi.v2.fetch('/corp/address/create-dept', { body: { name: '研发部' } })`

## Common Endpoints

See `api-examples.md` for full examples:

- `/corp/auth/*` - Auth (login, register, reset-password)
- `/corp/org/*` - Organization (get-my-org, get-my-vip, create-org, change-org)
- `/corp/address/*` - Departments/members (CRUD operations)
- `/corp/user/*` - User profile (get-selfinfo, change-password, bind-phone/email)
- `/corp/group/*` - Groups (CRUD, add/remove members)
- `/common/*` - Utilities (image-verifycode, send-sms/email-verifycode)

## Best Practices

1. **Always check api-examples.md first** - Verify endpoint exists and understand request/response
2. **Define TypeScript interfaces** - For response types
3. **Use computed refs** - For dynamic URLs with query params
4. **Handle errors properly** - User-friendly messages with `parseMaybeWeilaErrorString`
5. **Refresh after mutations** - Use `emit('refresh')` to notify parent
6. **Debounce search** - 300ms for better UX
7. **All APIs use POST** - Unless query params indicate read-only operation
