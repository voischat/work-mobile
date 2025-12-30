# useWeilaFetch → Pinia Colada 迁移计划

> 迁移进度：18/29 文件已迁移 (62%)

## 📊 迁移概览

### ✅ 已完成迁移 (18 文件)

#### Components (15 个组件)
- [x] DeptActions.vue - useMutation for delete
- [x] DeptMemberTreeSelector.vue - useQuery (部分，需完成)
- [x] EditDeptForm.vue - useMutation + useQueryCache
- [x] EditGroupForm.vue - useMutation + useQuery
- [x] EditMemberForm.vue - useMutation + useQuery
- [x] GroupActions.vue - useMutation for delete
- [x] ImageVerifyCode.vue - useQuery for image
- [x] MemberActions.vue - useMutation for delete
- [x] MemberStateToggle.vue - useMutation
- [x] VipCard.vue - useQuery
- [x] forms/DeptAddForm.vue - useMutation
- [x] forms/DeviceAddForm.vue - useMutation + useQuery
- [x] forms/GroupAddForm.vue - useMutation + useQuery
- [x] forms/MemberAddForm.vue - useMutation + useQuery
- [x] forms/ResetPasswordForm.vue - useMutation

#### Pages (3 个页面)
- [x] pages/login.vue - useMutation
- [x] pages/me/index.vue - useQuery
- [x] pages/directory/members/index.vue - useQuery

---

## 🚀 待迁移任务

### Phase 1: 简单 POST 请求迁移 (优先级：高 ⭐⭐⭐)

> 这些是最简单的迁移，使用 useQuery 即可，预计 10 分钟

#### 1.1 组织信息页面
- [x] **pages/index.vue**
  - Endpoints:
    - `/corp/org/get-my-org` - 获取组织信息
    - `/corp/org/get-my-vip` - 获取 VIP 信息
  - Pattern: `useWeilaFetch().post().json()` → `useQuery()` with weilaFetch
  - 参考：`pages/directory/members/index.vue` 的 depts query 写法
  - 注意：虽然是 POST 请求，但语义上是查询操作

---

### Phase 2: 简单分页列表 (优先级：高 ⭐⭐⭐)

> 使用 useQuery + 手动累积模式（参考 members/index.vue），预计每个 20-30 分钟

**📌 分页标准模式**（照搬 `pages/directory/members/index.vue`）：
- `useQuery` + `currentPage` ref + `accumulatedData` ref
- `placeholderData: previousData => previousData` 保持旧数据
- watch `state.value` 手动累积数据（去重）
- watch `debouncedSearchKey` 重置分页
- `useInfiniteScroll` 触发 `loadNextPage()`
- `hasNextPage` computed 判断是否有更多数据

#### 2.1 部门列表
- [x] **pages/directory/departments/index.vue**
  - Endpoints:
    - `/corp/address/get-my-manage-dept-list?page={page}&size=20` - 分页获取部门
  - Current: 手动管理 `curPage.value++`, `allDepts.value.push(...)`
  - Target: 使用 `useQuery` + 手动累积模式
  - 迁移要点：
    ```ts
    // 1. 定义状态
    const currentPage = ref(0)
    const accumulatedDepts = ref<Dept[]>([])
    const searchKey = ref('')
    const debouncedSearchKey = refDebounced(searchKey, 1000)
    
    // 2. 使用 useQuery
    const { state, asyncStatus } = useQuery({
      key: () => ['dept', 'list', { key: debouncedSearchKey.value, page: currentPage.value }],
      query: async () => {
        return await weilaFetch<DeptListResponse>(
          `/corp/address/get-my-manage-dept-list?page=${currentPage.value}&size=20`,
          { method: 'POST', body: { key: debouncedSearchKey.value } }
        )
      },
      placeholderData: previousData => previousData,
    })
    
    // 3. watch state 累积数据
    watch(() => state.value, (state) => {
      if (state?.status === 'success' && state.data) {
        if (currentPage.value === 0) {
          accumulatedDepts.value = state.data.list || []
        } else {
          const newItems = state.data.list || []
          const existingIds = new Set(accumulatedDepts.value.map(d => d.id))
          const uniqueNew = newItems.filter(d => !existingIds.has(d.id))
          accumulatedDepts.value = [...accumulatedDepts.value, ...uniqueNew]
        }
      }
    })
    
    // 4. 搜索重置
    watch(debouncedSearchKey, () => {
      currentPage.value = 0
      accumulatedDepts.value = []
    })
    
    // 5. 加载更多
    const hasNextPage = computed(() => {
      if (!state.value?.data) return false
      return accumulatedDepts.value.length < (state.value.data.count || 0)
    })
    
    function loadNextPage() {
      if (hasNextPage.value && asyncStatus.value !== 'loading')
        currentPage.value += 1
    }
    
    // 6. 无限滚动
    const loadMoreEl = useTemplateRef('load-more')
    useInfiniteScroll(loadMoreEl, loadNextPage, { distance: 100 })
    ```

#### 2.2 分组列表
- [x] **pages/directory/groups/index.vue**
  - Endpoints:
    - `/corp/group/get-my-manage-group-list?page={page}&size=20` - 分页获取分组
  - Pattern: 完全照搬 2.1 的模式
  - 迁移要点：同 2.1，只需替换 endpoint 和类型

---

### Phase 3: 复杂页面（分页 + Mutations）(优先级：高 ⭐⭐⭐)

> 混合了分页查询、搜索、模态框数据获取、以及添加成员操作
> 使用 useQuery + 手动累积模式（参考 members/index.vue）+ useMutation

#### 3.1 部门成员页
- [ ] **pages/directory/departments/[id]/members.vue**
  - Endpoints:
    - `/corp/address/get-dept-member-list` - 分页成员列表（带搜索）
    - `/corp/address/get-my-manage-all-dept` - 部门列表（已有 useQuery，保持）
    - `/corp/address/add-dept-members` - 添加成员（mutation）
    - `/corp/address/get-dept-all-member` - 获取部门所有成员（模态框）
  - 迁移策略：
    1. 成员列表 → `useQuery` + 手动累积（照搬 members/index.vue）
       - key: `['dept', deptId, 'members', 'list', { key: keyword, page }]`
    2. 添加成员 → `useMutation` + invalidate 成员列表
    3. 部门所有成员 → 保持现有 `immediate: false` 或改为 conditional `useQuery`

#### 3.2 分组成员页
- [ ] **pages/directory/groups/[id]/members.vue**
  - Endpoints:
    - `/corp/group/get-my-manage-group-list` - 分组信息
    - `/corp/group/get-group-member-list` - 分页成员列表
    - `/corp/address/get-my-manage-all-dept` - 部门列表
    - `/corp/group/add-group-members` - 添加成员
    - `/corp/group/get-group-all-member` - 获取分组所有成员
  - 迁移策略：同 3.1

---

### Phase 4: 特殊组件完善 (优先级：中 ⭐)

#### 4.1 部门成员树选择器
- [ ] **components/DeptMemberTreeSelector.vue**
  - Current: 混合使用 useQuery (部门列表) + useWeilaFetch (成员列表)
  - Endpoints:
    - `/corp/address/get-dept-all-member` - 根据 dept_id 获取成员
  - 迁移策略：
    - 移除 `Map<number, ReturnType<typeof useWeilaFetch>>`
    - 使用 `useQuery({ key: () => ['dept-members', deptId.value], enabled: computed(() => !!deptId.value) })`
    - 动态 key 确保每个部门独立缓存

---

### Phase 5: 用户相关 Mutations (优先级：低 ⭐)

> 简单的 immediate:false mutations，使用 useMutation
> **这些页面优先级最低**，可以最后处理或保持现有实现

#### 5.1 绑定手机
- [ ] **pages/me/bind-phone.vue**
  - Endpoints:
    - `/common/send-sms-verifycode` - 发送验证码
    - `/corp/user/bind-phone` - 绑定手机
  - Pattern: `useWeilaFetch(url, {immediate: false}).post()` → `useMutation()`
  - 迁移后：添加 query invalidation (userInfo)

#### 5.2 绑定邮箱
- [ ] **pages/me/bind-email.vue**
  - Endpoints:
    - `/corp/user/bind-email` - 绑定邮箱
  - Pattern: 同上
  - 迁移后：添加 query invalidation

#### 5.3 修改密码
- [ ] **pages/me/change-password.vue**
  - Endpoints:
    - `/corp/user/change-password` - 修改密码
  - Pattern: 同上
  - 迁移后：成功后跳转登录页

#### 5.4 注销账号（邮箱）
- [ ] **pages/me/UnregistEmail.vue**
  - Endpoints:
    - `/corp/user/unregist-by-email` - 通过邮箱注销
  - Pattern: 同上
  - 迁移后：成功后清理认证并跳转

#### 5.5 注销账号（手机）
- [ ] **pages/me/UnregistPhone.vue**
  - Endpoints:
    - `/corp/user/unregist` - 通过手机注销
  - Pattern: 同上
  - 迁移后：成功后清理认证并跳转

---

### Phase 6: Query Invalidation 系统 (优先级：高 ⭐⭐⭐)

> 在完成所有 mutations 迁移后，统一添加 query invalidation 逻辑

- [ ] **建立 Query Key 规范**
  ```ts
  // 统一的 query key 定义
  export const queryKeys = {
    // 组织相关
    org: ['org'] as const,
    vip: ['vip'] as const,
    
    // 部门相关
    departments: ['departments'] as const,
    departmentList: (page: number, keyword?: string) => ['departments', 'list', page, keyword] as const,
    department: (id: number) => ['departments', id] as const,
    departmentMembers: (id: number, keyword?: string) => ['departments', id, 'members', keyword] as const,
    
    // 分组相关
    groups: ['groups'] as const,
    groupList: (page: number, keyword?: string) => ['groups', 'list', page, keyword] as const,
    group: (id: number) => ['groups', id] as const,
    groupMembers: (id: number) => ['groups', id, 'members'] as const,
    
    // 成员相关
    members: ['members'] as const,
    member: (id: number) => ['members', id] as const,
    
    // 用户相关
    userInfo: ['user', 'info'] as const,
  }
  ```

- [ ] **为所有 Mutations 添加 Invalidation**
  - 创建/编辑/删除部门 → invalidate `queryKeys.departments`
  - 创建/编辑/删除分组 → invalidate `queryKeys.groups`
  - 添加/删除成员 → invalidate 相关的 `departmentMembers` / `groupMembers`
  - 修改用户信息 → invalidate `queryKeys.userInfo`

- [ ] **测试 Invalidation 逻辑**
  - 确保创建后列表自动刷新
  - 确保编辑后详情自动刷新
  - 确保删除后列表自动更新

---

### Phase 7: 清理工作 (优先级：低 ⭐)

- [ ] **移除 useWeilaFetch 相关代码**
  - 确认所有页面都已迁移
  - 删除或标记 `composables/useWeilaFetch.ts` 为 deprecated
  - 更新文档

- [ ] **优化性能**
  - 添加 `staleTime` 配置，减少不必要的重新请求
  - 添加 `gcTime` (原 cacheTime) 配置
  - 评估是否需要 prefetch

- [ ] **完善错误处理**
  - 统一错误提示样式
  - 添加重试逻辑（retry）
  - 添加离线提示

---

## 🔧 迁移模式参考

### 模式 1: Simple Query (POST → useQuery)

**Before:**
```ts
const { data, error, isFetching } = useWeilaFetch<Type>('/corp/endpoint')
  .post()
  .json()
```

**After:**
```ts
const { data, error, isPending } = useQuery({
  key: ['endpoint'],
  query: () => weilaApi.v2.fetch('/corp/endpoint', { method: 'POST' }),
})
```

---

### 模式 2: Mutation (immediate: false → useMutation)

**Before:**
```ts
const { execute: doAction } = useWeilaFetch('/corp/endpoint', { immediate: false })
  .post(() => ({ param: value.value }))
  .json()
```

**After:**
```ts
const queryCache = useQueryCache()
const { mutate: doAction, isPending } = useMutation({
  mutation: (params: ParamsType) => 
    weilaApi.v2.fetch('/corp/endpoint', { body: params }),
  async onSettled() {
    await queryCache.invalidateQueries({ key: ['related-query'] })
  },
})
```

---

### 模式 3: Pagination (useQuery + 手动累积) ⭐ 标准模式

> **参考实现**：`pages/directory/members/index.vue`

**Before:**
```ts
const curPage = ref(0)
const allItems = ref<Item[]>([])

const url = computed(() => `/corp/endpoint?page=${curPage.value}&size=20`)
const { data: pageData } = useWeilaFetch<Response>(url).post().json()

watch(pageData, (data) => {
  if (data?.list) {
    allItems.value.push(...data.list)
  }
})

function loadMore() {
  curPage.value++
}
```

**After:**
```ts
import { useQuery } from '@pinia/colada'
import { useInfiniteScroll, refDebounced } from '@vueuse/core'
import { weilaFetch } from '~/shared/instances'

// 1. 状态定义
const currentPage = ref(0)
const accumulatedItems = ref<Item[]>([])
const searchKey = shallowRef('')
const debouncedSearchKey = refDebounced(searchKey, 1000)

// 2. useQuery 定义
const { state, asyncStatus, error } = useQuery({
  key: () => ['items', 'list', { key: debouncedSearchKey.value, page: currentPage.value }],
  query: async () => {
    return await weilaFetch<Response>(
      `/corp/endpoint?page=${currentPage.value}&size=20`,
      {
        method: 'POST',
        body: { key: debouncedSearchKey.value },
      }
    )
  },
  placeholderData: previousData => previousData, // 保持旧数据显示
})

// 3. watch state 手动累积数据
watch(() => state.value, (state) => {
  if (state?.status === 'success' && state.data) {
    if (currentPage.value === 0) {
      // 首页：直接替换
      accumulatedItems.value = state.data.list || []
    } else {
      // 翻页：追加（去重）
      const newItems = state.data.list || []
      const existingIds = new Set(accumulatedItems.value.map(item => item.id))
      const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id))
      accumulatedItems.value = [...accumulatedItems.value, ...uniqueNewItems]
    }
  }
})

// 4. 搜索关键词变化时重置
watch(debouncedSearchKey, () => {
  currentPage.value = 0
  accumulatedItems.value = []
})

// 5. 计算是否有下一页
const hasNextPage = computed(() => {
  if (!state.value?.data) return false
  const loadedCount = accumulatedItems.value.length
  return loadedCount < (state.value.data.count || 0)
})

// 6. 加载下一页
function loadNextPage() {
  if (hasNextPage.value && asyncStatus.value !== 'loading')
    currentPage.value += 1
}

// 7. 无限滚动
const loadMoreEl = useTemplateRef('load-more')
useInfiniteScroll(loadMoreEl, loadNextPage, { distance: 100 })
```

**Template:**
```vue
<template>
  <div>
    <!-- 搜索框 -->
    <input v-model="searchKey" placeholder="搜索..." />
    
    <!-- Loading (首次) -->
    <div v-if="asyncStatus === 'loading' && accumulatedItems.length === 0">
      加载中...
    </div>
    
    <!-- 错误 -->
    <div v-else-if="error">
      错误: {{ error.message }}
    </div>
    
    <!-- 空状态 -->
    <div v-if="accumulatedItems.length === 0 && asyncStatus !== 'loading'">
      暂无数据
    </div>
    
    <!-- 列表 -->
    <div v-else>
      <div v-for="item in accumulatedItems" :key="item.id">
        {{ item.name }}
      </div>
    </div>
    
    <!-- 加载更多指示器 -->
    <div v-if="hasNextPage" ref="load-more">
      加载中...
    </div>
    
    <!-- 已加载完成 -->
    <div v-else-if="accumulatedItems.length > 0">
      已加载全部数据（共 {{ state?.data?.count || 0 }} 条）
    </div>
  </div>
</template>
```

**关键点**：
1. ✅ 使用 `placeholderData` 保持旧数据显示
2. ✅ watch `state.value` 而不是 `data`，检查 `status === 'success'`
3. ✅ 手动累积数据，page=0 时替换，page>0 时追加（去重）
4. ✅ 搜索关键词变化时重置 page 和累积数据
5. ✅ 使用 `useInfiniteScroll` 自动触发加载
6. ✅ `asyncStatus === 'loading'` 判断加载状态

---

### 模式 4: Conditional Query (模态框数据)

**Before:**
```ts
const { data, execute } = useWeilaFetch('/corp/endpoint', { immediate: false })
  .post()
  .json()

function openModal() {
  showModal.value = true
  execute()
}
```

**After:**
```ts
const showModal = ref(false)

const { data, isPending } = useQuery({
  key: ['modal-data'],
  query: () => weilaApi.v2.fetch('/corp/endpoint', { method: 'POST' }),
  enabled: computed(() => showModal.value),
})

// 当 showModal.value 变为 true 时，自动触发请求
```

---

### 模式 5: Search with Pagination (useQuery + 手动累积)

> 搜索关键词变化时，自动重置分页（参考模式 3）

**After:**
```ts
const searchKey = shallowRef('')
const debouncedSearchKey = refDebounced(searchKey, 1000)
const currentPage = ref(0)
const accumulatedItems = ref<Item[]>([])

const { state, asyncStatus } = useQuery({
  // key 中包含 searchKey，但累积逻辑通过 watch 处理
  key: () => ['items', 'list', { key: debouncedSearchKey.value, page: currentPage.value }],
  query: async () => {
    return await weilaFetch<Response>(
      `/corp/endpoint?page=${currentPage.value}&size=20`,
      { method: 'POST', body: { key: debouncedSearchKey.value } }
    )
  },
  placeholderData: previousData => previousData,
})

// 手动累积（同模式 3）
watch(() => state.value, (state) => {
  if (state?.status === 'success' && state.data) {
    if (currentPage.value === 0) {
      accumulatedItems.value = state.data.list || []
    } else {
      const newItems = state.data.list || []
      const existingIds = new Set(accumulatedItems.value.map(item => item.id))
      const uniqueNew = newItems.filter(item => !existingIds.has(item.id))
      accumulatedItems.value = [...accumulatedItems.value, ...uniqueNew]
    }
  }
})

// 搜索关键词变化时，重置分页
watch(debouncedSearchKey, () => {
  currentPage.value = 0
  accumulatedItems.value = []
})
```

**关键点**：
- ✅ 搜索关键词包含在 query key 中
- ✅ 使用 `refDebounced` 防抖（1000ms）
- ✅ watch 搜索关键词变化，重置 `currentPage` 和 `accumulatedItems`
- ✅ key 变化会触发新请求，但累积逻辑由 watch 控制

---

## 📝 注意事项

1. **渐进式迁移**：按 Phase 顺序进行，每个 Phase 完成后测试
2. **保持向后兼容**：迁移期间保留 `useWeilaFetch`，确保其他页面正常运行
3. **测试充分**：每迁移一个页面，测试所有功能点（列表、搜索、分页、CRUD）
4. **错误处理**：pinia-colada 的 `error` 是 ref，直接使用即可（已解构）
5. **Loading 状态**：`isFetching` → `asyncStatus` (query: 'loading' | 'idle'), `isLoading` (mutation)
6. **Query Keys**：遵循规范，确保 invalidation 准确
7. **使用 weilaFetch**：所有请求通过 `weilaFetch` (from `~/shared/instances`)，而非 `weilaApi.v2.fetch()`
8. **分页模式**：统一使用 `useQuery` + 手动累积模式（参考 members/index.vue），不使用 useInfiniteQuery

---

## ⚡ 快速检查清单

迁移每个文件时，确保：

- [ ] 移除 `import { useWeilaFetch } from '~/composables/useWeilaFetch'`
- [ ] 添加 `import { useQuery, useMutation, useQueryCache } from '@pinia/colada'`
- [ ] 添加 `import { weilaFetch } from '~/shared/instances'`
- [ ] 更新 loading 状态：`isFetching` → `asyncStatus`
- [ ] 错误访问：直接使用解构后的 `error`（已是值）
- [ ] 添加 query invalidation (mutations)
- [ ] 定义清晰的 query keys
- [ ] 分页使用手动累积模式（watch state.value）
- [ ] 测试所有功能（CRUD、分页、搜索）
- [ ] 检查 TypeScript 类型
- [ ] 在 checkbox 上打勾 ✅

---

## 📚 参考资源

- **标准分页实现**：`src/pages/directory/members/index.vue` ⭐⭐⭐
- [Pinia Colada 官方文档](https://github.com/posva/pinia-colada)
- [Query Keys 最佳实践](https://github.com/posva/pinia-colada/blob/main/docs/guide/query-keys.md)
- [Pagination Guide](https://github.com/posva/pinia-colada/blob/main/docs/guide/paginated-queries.md)
- [Query Invalidation](https://github.com/posva/pinia-colada/blob/main/docs/guide/query-invalidation.md)
- 项目内部：`.claude/skills/data-fetching/SKILL.md`
