# useWeilaFetch → Pinia Colada 迁移计划

> 迁移进度：已完成所有迁移 ✅✅✅

## 📊 迁移概览

### ✅ 已完成迁移

#### 核心页面 (6 个)
- [x] pages/index.vue - 组织和 VIP 信息
- [x] pages/directory/departments/index.vue - 部门列表（分页）
- [x] pages/directory/groups/index.vue - 群组列表（分页）
- [x] pages/directory/members/index.vue - 成员列表（分页 + 搜索）
- [x] pages/directory/departments/[id]/members.vue - 部门成员（分页 + 搜索 + mutations）
- [x] pages/directory/groups/[id]/members.vue - 群组成员（分页 + mutations）

#### 核心组件 (1 个)
- [x] components/DeptMemberTreeSelector.vue - 部门成员树选择器（简化为 useQuery + weilaFetch）

#### 其他已迁移 (23 个组件/页面/文件)
- [x] 各种 Actions 组件 (DeptActions, GroupActions, MemberActions)
- [x] 各种 Form 组件 (AddForm, EditForm, ResetPasswordForm)
- [x] 其他组件 (ImageVerifyCode, VipCard, MemberStateToggle)
- [x] 用户页面 (login.vue, me/index.vue, me/bind-phone.vue, me/bind-email.vue, me/change-password.vue, me/UnregistPhone.vue, me/UnregistEmail.vue)
- [x] 核心文件 (App.vue, queries/vip.ts, queries/org.ts)

---

## 🎯 正确的 Pinia Colada 模式

### 核心原则

1. **watch data 添加 immediate: true**
   ```ts
   watch(data, (newData) => {
     if (newData) {
       // 处理数据
     }
   }, { immediate: true })
   ```

2. **status 使用 'pending' 不是 'loading'**
   ```ts
   // ✅ 正确
   if (status.value === 'pending') { }
   
   // ❌ 错误
   if (status.value === 'loading') { }
   ```

3. **loadNextPage 不检查 status**
   ```ts
   // ✅ 正确
   function loadNextPage() {
     if (hasNextPage.value)
       currentPage.value += 1
   }
   
   // ❌ 错误
   function loadNextPage() {
     if (hasNextPage.value && status.value !== 'loading')
       currentPage.value += 1
   }
   ```

### 标准分页模式（参考 departments/index.vue）

```ts
// 1. 定义状态
const currentPage = ref(0)
const accumulatedItems = ref<Item[]>([])
const pageSize = 10

// 2. useQuery
const { data, status, error } = useQuery({
  key: () => ['items', 'list', { page: currentPage.value }],
  query: async () => {
    return await weilaFetch<Response>(
      `/endpoint?page=${currentPage.value}&size=${pageSize}`,
      { method: 'POST' }
    )
  },
})

// 3. watch data (immediate: true)
watch(data, (newData) => {
  if (newData) {
    if (currentPage.value === 0) {
      accumulatedItems.value = newData.items || []
    }
    else {
      const newItems = newData.items || []
      const existingIds = new Set(accumulatedItems.value.map(i => i.id))
      const uniqueNew = newItems.filter(i => !existingIds.has(i.id))
      accumulatedItems.value = [...accumulatedItems.value, ...uniqueNew]
    }
  }
}, { immediate: true })

// 4. hasNextPage
const hasNextPage = computed(() => {
  if (!data.value)
    return false
  const lastPageSize = data.value.items?.length || 0
  return lastPageSize >= pageSize
})

// 5. loadNextPage (不检查 status)
function loadNextPage() {
  if (hasNextPage.value)
    currentPage.value += 1
}

// 6. 无限滚动
const loadMoreEl = useTemplateRef('load-more')
useInfiniteScroll(loadMoreEl, loadNextPage, { distance: 100 })
```

### Template 状态检查

```vue
<template>
  <!-- 首次加载 -->
  <div v-if="status === 'pending' && items.length === 0">
    加载中...
  </div>
  
  <!-- 错误 -->
  <div v-else-if="error">
    错误: {{ error.message }}
  </div>
  
  <!-- 空数据 -->
  <div v-if="items.length === 0 && status !== 'pending'">
    暂无数据
  </div>
  
  <!-- 列表 -->
  <div v-else>
    <Item v-for="item in items" :key="item.id" :item="item" />
  </div>
  
  <!-- 加载更多 -->
  <div v-if="hasNextPage" ref="load-more">
    加载中...
  </div>
  
  <!-- 已加载完成 -->
  <div v-else-if="items.length > 0">
    已加载全部数据（共 {{ items.length }} 条）
  </div>
</template>
```

### Mutations 模式

```ts
const { mutate, isPending } = useMutation({
  mutation: (params: Params) =>
    weilaFetch('/endpoint', {
      method: 'POST',
      body: params,
    }),
  async onSuccess() {
    showToast('操作成功')
    await queryCache.invalidateQueries({ key: ['related-query'] })
  },
  onError(error) {
    showToast(error.message || '操作失败')
  },
})
```

### 交互式组件数据加载（参考 DeptMemberTreeSelector）

对于按需加载的交互式组件（树形、级联等）：

```ts
// ✅ 推荐：部门列表用 useQuery，成员数据用 weilaFetch + Map 缓存
const { data: depts, status } = useQuery({
  key: ['dept', 'my-manage'],
  query: () => weilaFetch<Dept[]>('/get-all-dept', { method: 'POST' }),
})

const deptMembersCache = ref<Map<number, Member[]>>(new Map())
const loadingDeptIds = ref<Set<number>>(new Set())

async function loadDeptMembers(deptId: number) {
  if (loadingDeptIds.value.has(deptId))
    return

  loadingDeptIds.value.add(deptId)
  try {
    const result = await weilaFetch<MemberListResponse>('/get-dept-members', {
      method: 'POST',
      body: { dept_id: deptId },
    })
    deptMembersCache.value.set(deptId, result.members || [])
  }
  finally {
    loadingDeptIds.value.delete(deptId)
  }
}
```

**原因**：
- 部门列表是组件加载时就需要的 → useQuery（缓存、自动管理）
- 部门成员是用户交互触发的 → weilaFetch（简单、可控、按需）

### 图片加载处理（使用 Reka UI Avatar）

```vue
<AvatarRoot class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
  <AvatarImage
    :src="user.avatar"
    :alt="user.name"
    class="w-full h-full object-cover"
  />
  <AvatarFallback class="w-full h-full flex items-center justify-center">
    <Icon icon="lucide:user" class="w-5 h-5 text-gray-400" />
  </AvatarFallback>
</AvatarRoot>
```

**优势**：
- 自动处理加载状态
- 自动处理加载失败
- 可选延迟显示 fallback (`delayMs`)
- 无需手动处理 `@error` 事件

---

## 🔄 Phase 5: Me 页面全面升级计划（方案 B - 完整升级）

> **状态**: ✅ 已完成
> **完成时间**: 2025-12-31
> **策略**: 逐步升级，每个任务完成后验证再进行下一步

### 📊 任务概览

| 任务 | 文件 | 复杂度 | 状态 | 完成时间 |
|-----|------|--------|------|---------|
| Task 1 | `pages/me/change-password.vue` | 🟢 简单 | ✅ 已完成 | 2025-12-31 |
| Task 2a | `pages/me/bind-phone.vue` | 🟡 中等 | ✅ 已完成 | 2025-12-31 |
| Task 2b | `pages/me/bind-email.vue` | 🟡 中等 | ✅ 已完成 | 2025-12-31 |
| Task 3 | `pages/me/UnregistPhone.vue` | 🔴 复杂 | ✅ 已完成 | 2025-12-31 |
| Task 4 | `pages/me/UnregistEmail.vue` | 🔴 复杂 | ✅ 已完成 | 2025-12-31 |
| Task 5 | `types/auth.ts` | 🟢 简单 | ✅ 已完成 | 2025-12-31 |

### ✅ 升级成果

1. **迁移到 Pinia Colada**: ✅ 所有页面从 `useWeilaFetch` 迁移到 `useMutation`
2. **统一验证码流程**: ✅ 所有需要验证码的场景添加图形验证码 + 发送验证码按钮
3. **优化错误处理**: ✅ 添加 Toast 提示，提升用户体验
4. **对齐表单风格**: ✅ 参考 `bind-phone.vue` 统一了所有表单样式

### 🎯 关键改进

#### 1. change-password.vue
- ✅ 迁移到 `useMutation`
- ✅ 添加 Toast 提示（成功、失败、验证错误）
- ✅ 清理冗余代码（watch、computed）
- ✅ 代码行数: 170 → 158 (-12 lines)

#### 2. bind-phone.vue
- ✅ 添加国家代码融合设计 (+86 with chevron-down icon)
- ✅ 修复布局溢出问题 (min-w-0, flex-shrink-0)
- ✅ 更新 smstype 为 'work-bind-phone'

#### 3. bind-email.vue
- ✅ 完整重写，添加完整验证码流程
- ✅ 图形验证码 (ImageVerifyCode)
- ✅ 邮箱验证码发送 (CountDownButton, 60s)
- ✅ Toast 通知所有操作
- ✅ 响应式布局（无溢出）
- ✅ 代码行数: 148 → 223 (+75 lines, 功能完整)

#### 4. UnregistPhone.vue
- ✅ 添加完整验证码流程
- ✅ 国家代码融合设计
- ✅ 迁移到 Pinia Colada
- ✅ 保留确认模态框（危险操作）
- ✅ 使用 `smstype: 'work-unregist'`
- ✅ 注销成功后 clearAuth() + 跳转 /login

#### 5. UnregistEmail.vue
- ✅ 添加完整验证码流程
- ✅ 迁移到 Pinia Colada
- ✅ 保留确认模态框
- ✅ 使用 `emailtype: 'work-unregist'`
- ✅ 注销成功后 clearAuth() + 跳转 /login

#### 6. types/auth.ts
- ✅ 添加 `SendSmsVerifyCodeRequest`
- ✅ 添加 `SendEmailVerifyCodeRequest`
- ✅ 定义所有 smstype 和 emailtype 枚举值

### 🎨 建立的设计模式

#### 1. 国家代码融合模式
```vue
<div class="flex items-center">
  <div class="flex items-center px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
    <span class="text-gray-700">+86</span>
    <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-400 ml-1" />
  </div>
  <input class="flex-1 min-w-0 px-3 py-2 border..." />
</div>
```

#### 2. 验证码流程模式
```
Contact Input → Image Verify Code → Send Code Button (60s countdown) → Submit
```

#### 3. 危险操作模式
```ts
async function handleSubmit() {
  if (!validate()) return
  await showModal({
    title: '确认注销',
    message: '此操作不可恢复！',
    confirmButtonType: 'danger',
    onConfirm() {
      mutate(params)
    },
  })
}
```

---

## 🔄 Phase 6: 剩余文件迁移（核心基础设施）

> **状态**: ✅ 已完成
> **完成时间**: 2025-12-31

### 📊 已完成迁移

| 文件 | 改动内容 | 状态 |
|-----|---------|------|
| `queries/vip.ts` | 从 `useWeilaFetch` 改为 `weilaFetch` | ✅ |
| `queries/org.ts` | 从 `useWeilaFetch` 改为 `weilaFetch` | ✅ |
| `App.vue` | 登录/刷新 token 从 `useWeilaFetch` 迁移到 `useMutation` | ✅ |

### 关键改进

#### queries/vip.ts & queries/org.ts
**改动前**:
```ts
const { data, error } = await useWeilaFetch<Response>('/endpoint')
  .post()
  .json()

if (error.value) throw new Error(...)
return data.value.field
```

**改动后**:
```ts
const response = await weilaFetch<Response>('/endpoint', {
  method: 'POST',
})
return response.field
```

**优势**:
- 代码更简洁（从 8 行 → 4 行）
- 无需处理 ref 包装
- weilaFetch 会自动抛出错误，无需手动检查
- 错误处理由 Pinia Colada 的 useQuery 统一管理

#### App.vue 登录/刷新逻辑
**改动前**:
- 使用 `useWeilaFetch` + `execute()` + 多个 `watch`
- 需要手动 stop watcher
- 代码复杂，逻辑分散

**改动后**:
- 使用 `useMutation` with `onSuccess/onError`
- 逻辑集中在 mutation 回调中
- 代码更清晰、更易维护
- 从 125 行 → 98 行 (-27 lines)

---

## 🎉 迁移完成总结

### ✅ 迁移统计

**总计迁移文件数**: 30+ 文件
- 核心页面: 6 个
- 核心组件: 1 个  
- Me 页面: 5 个
- 其他组件: 15+ 个
- 核心基础设施: 3 个

**代码改进**:
- 移除所有 `useWeilaFetch` 使用（除 AvatarUpload.vue 保留）
- 统一使用 Pinia Colada (`useQuery`, `useMutation`)
- 统一使用 `weilaFetch` 作为底层 HTTP 客户端
- 添加 Toast 通知提升 UX
- 建立标准化表单模式和验证码流程

**未迁移文件**:
- `components/AvatarUpload.vue` - 用户要求保留，使用特殊的文件上传逻辑

### 🎯 达成目标

1. ✅ **统一状态管理**: 所有数据获取使用 Pinia Colada
2. ✅ **统一 HTTP 客户端**: 所有 API 调用使用 `weilaFetch`
3. ✅ **优化用户体验**: 添加 Toast、验证码流程、错误处理
4. ✅ **代码质量**: 移除冗余代码、统一模式、通过 lint 检查
5. ✅ **响应式设计**: 修复所有布局溢出问题

### 📚 建立的最佳实践

1. **分页模式**: `departments/index.vue` ⭐⭐⭐
2. **搜索+分页**: `members/index.vue`
3. **Mutations+Query**: `departments/[id]/members.vue`
4. **交互式组件**: `DeptMemberTreeSelector.vue`
5. **验证码流程**: `bind-phone.vue`, `bind-email.vue`
6. **危险操作**: `UnregistPhone.vue`, `UnregistEmail.vue`
7. **简单表单**: `change-password.vue`

---

## 🎨 表单风格规范

参考 `bind-phone.vue` 和 `MemberAddForm.vue`：

### 1. **表单验证错误处理**

```ts
function handleSubmit() {
  if (!validate(formData.value)) {
    // 显示第一个验证错误
    showToast(Object.values(errors.value)?.[0] || '表单验证失败')
    return
  }
  // 提交表单
  submitMutation(formData.value)
}
```

### 2. **API 错误处理**

```ts
const { mutate, isPending, error } = useMutation({
  mutation: (params) => weilaFetch(...),
  onSuccess() {
    showToast('操作成功')
    // 其他成功逻辑
  },
  onError(error) {
    showToast(error.message || '操作失败')
  },
})
```

### 3. **验证码发送流程**

```vue
<template>
  <!-- 图形验证码 -->
  <div>
    <label>图形验证码</label>
    <ImageVerifyCode
      ref="imageVerifyCodeRef"
      v-model="formData.imageVerifyAnswer"
      :disabled="isFetching"
      :error="!!errors.imageVerifyAnswer"
    />
    <p class="text-xs text-gray-500">点击图片可刷新验证码</p>
  </div>

  <!-- 短信/邮箱验证码 -->
  <div>
    <label>验证码</label>
    <div class="flex items-center space-x-2">
      <input v-model="formData.verifycode" ... />
      <CountDownButton
        ref="countDownButtonRef"
        :disabled="!canSendCode"
        :loading="isSendingCode"
        @click="handleSendCode"
      />
    </div>
    <p class="text-xs text-gray-500">请先输入图形验证码，然后点击发送验证码</p>
  </div>
</template>
```

### 4. **按钮状态管理**

```ts
const canSendCode = computed(() => {
  return formData.value.contact  // 手机号或邮箱
    && isValidContact.value       // 格式验证
    && formData.value.imageVerifyAnswer
    && !isSendingCode.value
})
```

---

## 📋 迁移检查清单

每次迁移文件时确保：

- [ ] 移除 `useWeilaFetch` import
- [ ] 添加 `useQuery/useMutation` import
- [ ] 添加 `weilaFetch` import
- [ ] watch data 添加 `{ immediate: true }`
- [ ] 使用 `status === 'pending'` 而不是 `'loading'`
- [ ] `loadNextPage` 不检查 status
- [ ] Template 中使用正确的状态检查
- [ ] 运行 `pnpm lint` 确保无错误
- [ ] 测试功能正常

---

## 📚 参考文件

- **标准分页实现**: `src/pages/directory/departments/index.vue` ⭐⭐⭐
- **搜索 + 分页**: `src/pages/directory/members/index.vue`
- **Mutations + Query**: `src/pages/directory/departments/[id]/members.vue`
- **交互式组件**: `src/components/DeptMemberTreeSelector.vue`
- **用户操作**: `src/pages/me/bind-phone.vue`
