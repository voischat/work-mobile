# useFetch (VueUse)

Reference for the underlying composition API used in `useWeilaFetch`.

## Key Concepts

- Reactive Fetch API wrapper
- Auto-refetch on URL change
- Request abortion support
- Interceptors (beforeFetch, afterFetch, onFetchError)
- Async/await support

## Basic Usage

```ts
const { data, error, isFetching } = useFetch(url).get().json()
```

## Reactive URL

```ts
const url = ref('https://api.com/user/1')
const { data } = useFetch(url, { refetch: true })

url.value = 'https://api.com/user/2' // Auto refetch
```

## Manual Execution

```ts
const { execute } = useFetch(url, { immediate: false })
execute() // Trigger manually
```

## Abort Request

```ts
const { abort, canAbort } = useFetch(url)
if (canAbort.value)
  abort()

// Or with timeout
const { data } = useFetch(url, { timeout: 5000 })
```

## Interceptors

```ts
// Before request
useFetch(url, {
  async beforeFetch({ url, options, cancel }) {
    const token = await getToken()
    if (!token)
      cancel()
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` }
    return { options }
  }
})

// After response
useFetch(url, {
  afterFetch(ctx) {
    ctx.data = transformData(ctx.data)
    return ctx
  }
})

// On error
useFetch(url, {
  updateDataOnError: true,
  onFetchError(ctx) {
    ctx.error = new Error('Custom error')
    return ctx
  }
})
```

## HTTP Methods

```ts
useFetch(url).get().json()
useFetch(url).post(data).json()
useFetch(url).put(data).text()
useFetch(url).delete().blob()

// Or via options
useFetch(url, { method: 'POST' }).json()
```

## Custom Instance (createFetch)

```ts
import { createFetch } from '@vueuse/core'

const useMyFetch = createFetch({
  baseUrl: 'https://api.com',
  options: {
    async beforeFetch({ options }) {
      const token = await getToken()
      options.headers.Authorization = `Bearer ${token}`
      return { options }
    }
  },
  fetchOptions: { mode: 'cors' }
})

const { data } = useMyFetch('users')
```

## Events

```ts
const { onFetchResponse, onFetchError } = useFetch(url)

onFetchResponse(response => console.log(response.status))
onFetchError(error => console.error(error.message))
```

## Token Refresh Pattern

```ts
const useMyFetch = createFetch({
  options: {
    afterFetch({ data, response, execute }) {
      if (needRefreshToken) {
        return new Promise((resolve) => {
          refreshToken().then(() => {
            execute().then(res => resolve({ data, response: res }))
          })
        })
      }
      return { data, response }
    }
  }
})
```

## Return Values

- `data` - Response data (ref)
- `error` - Error object (ref)
- `isFetching` - Loading state (ref)
- `canAbort` - Can abort (ref)
- `statusCode` - HTTP status (ref)
- `response` - Raw response (ref)
- `execute` - Manual trigger function
- `abort` - Abort function
- `onFetchResponse` - Response event
- `onFetchError` - Error event

## Notes

- In Nuxt 3, explicit import required: `import { useFetch } from '@vueuse/core'`
- For SSR, wrap async components in `<Suspense>`
- Use computed URLs for dynamic refetching
