# Notes: Realtime Location Tab Switching Issue

## Root Cause Analysis

### The Problem

When switching tabs (dept ↔ group) in the realtime location page, a loading state appears. This does NOT happen in the track page.

### Key Differences

#### Realtime Location Page (src/pages/workbench/realtime-location/index.vue)

**State management:**

- Single `selectedNodes` ref shared between both tabs
- `selectedType` uses `useRouteQuery` to track current tab
- When `selectedType` changes, it clears `selectedNodes` and resets `sessionId` to -1

**The problematic code (lines 31-34):**

```ts
watch(selectedType, () => {
  selectedNodes.value = []
  sessionId.value = -1
})
```

**Query structure (lines 42-52):**

```ts
const { data: realtimeData, status, error, refetch } = useQuery({
  key: () => ['realtime-location', sessionId.value, sessionType.value],
  //                                         ^^^^^^^^^^^^^^^^^^
  query: () => weilaFetch<RealtimeLocationsResponse>('/corp/loc/get-realtime-location', {
    method: 'POST',
    body: {
      session_id: sessionId.value,
      session_type: sessionType.value, // Changes when tab changes
    },
  }),
  enabled: isValid,
})
```

**Issue:** When `selectedType` changes:

1. `sessionType` changes (20 → 18 or 18 → 20)
2. This changes the query key
3. Even though `isValid` becomes false (sessionId=-1), the query status goes through transitions
4. The UI shows "加载中..." (loading) during this transition

#### Track Page (src/pages/workbench/track/index.vue)

**State management:**

- Separate components: `DeptMemberTreeSelector` and `GroupMemberTreeSelector`
- Each component maintains its own internal state
- `selectedTab` is just for UI, doesn't affect the query key

**Query structure (lines 67-77):**

```ts
const { data: trackData, status, error } = useQuery({
  key: () => ['track', userId.value, date.value],
  // No tab type in the key!
  query: () => weilaFetch<TrackResponse>('/corp/loc/get-track', {
    method: 'POST',
    body: {
      user_id: userId.value,
      date: date.value,
    },
  }),
  enabled: isValid,
})
```

**Why no loading:** The query key doesn't include the tab type. The tree selectors handle their own data loading internally, so switching tabs doesn't trigger a query refetch.

### TreeSelector Structure

Realtime location uses a single `TreeSelector` component with different loaders:

- `deptLoader` - loads dept/group tree
- `groupLoader` - loads group/member tree

Track page uses separate components:

- `DeptMemberTreeSelector` - self-contained, loads dept + members
- `GroupMemberTreeSelector` - self-contained, loads group + members

## Solution Options

### Option 1: Separate State for Each Tab Type

Create separate state for dept and group:

```ts
const selectedDeptId = useRouteQuery('deptId', -1, { transform: Number })
const selectedGroupId = useRouteQuery('groupId', -1, { transform: Number })
```

Pros:

- Each tab maintains its own selection
- No loading when switching tabs
- More intuitive UX

Cons:

- More state to manage
- Need to handle which ID to use based on selectedType

### Option 2: Separate Tree Selector Components

Follow track page pattern - create `DeptTreeSelector` and `GroupTreeSelector` components.

Pros:

- Matches existing pattern in track page
- Each component is self-contained
- Cleaner separation of concerns

Cons:

- More files/components to maintain
- Some code duplication (unless shared logic extracted)

### Option 3: Remove sessionType from Query Key

Don't include `sessionType` in the query key since it's determined by the session ID anyway.

Pros:

- Minimal change
- Fixes the loading issue

Cons:

- May have stale data issues if session ID can exist in both contexts
- Less explicit cache key

## Recommendation

**Option 1** (Separate State) is the best solution because:

1. Maintains the single `TreeSelector` component (less duplication)
2. Each tab remembers its selection
3. No loading state when switching
4. More flexible for future enhancements
