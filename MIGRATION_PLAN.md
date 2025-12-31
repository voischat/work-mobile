# useWeilaFetch → Pinia Colada 迁移计划

> 迁移进度：已完成核心页面迁移 ✅

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

#### 其他已迁移 (18 个组件/页面)
- [x] 各种 Actions 组件 (DeptActions, GroupActions, MemberActions)
- [x] 各种 Form 组件 (AddForm, EditForm, ResetPasswordForm)
- [x] 其他组件 (ImageVerifyCode, VipCard, MemberStateToggle)
- [x] 用户页面 (login.vue, me/index.vue, me/bind-phone.vue)

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

> **状态**: 进行中 🚧  
> **策略**: 逐步升级，每个任务完成后验证再进行下一步

### 📊 任务概览

| 任务 | 文件 | 复杂度 | 状态 | 验证者 |
|-----|------|--------|------|--------|
| Task 1 | `pages/me/change-password.vue` | 🟢 简单 | ✅ 已完成 | @user |
| Task 2 | `pages/me/bind-email.vue` | 🟡 中等 | ⏳ 待开始 | @user |
| Task 3 | `pages/me/UnregistPhone.vue` | 🔴 复杂 | ⏳ 待开始 | @user |
| Task 4 | `pages/me/UnregistEmail.vue` | 🔴 复杂 | ⏳ 待开始 | @user |
| Task 5 | `types/auth.ts` | 🟢 简单 | ⏳ 待开始 | @user |

### 🎯 升级目标

1. **迁移到 Pinia Colada**: 所有页面从 `useWeilaFetch` 迁移到 `useMutation`
2. **统一验证码流程**: 所有需要验证码的场景添加图形验证码 + 发送验证码按钮
3. **优化错误处理**: 添加 Toast 提示，提升用户体验
4. **对齐表单风格**: 参考 `bind-phone.vue` 和 `MemberAddForm.vue`

### 🔍 当前问题分析

#### 1. **bind-email.vue** - 缺失验证码发送流程
**现状**: 
- ❌ 只有邮箱输入框 + 验证码输入框
- ❌ 用户需要自己去获取验证码

**目标**:
- ✅ 邮箱输入框
- ✅ 图形验证码组件（`ImageVerifyCode`）
- ✅ 邮箱验证码输入框 + 发送按钮（`CountDownButton`）

#### 2. **UnregistPhone.vue & UnregistEmail.vue** - 缺失验证码发送流程
**现状**:
- ❌ 只有输入框，没有发送验证码的交互
- ❌ 用户体验不友好

**目标**:
- ✅ 手机号/邮箱输入框
- ✅ 图形验证码组件
- ✅ 短信/邮箱验证码输入框 + 发送按钮
- ✅ 危险操作警告提示

#### 3. **change-password.vue** - 只需迁移
**现状**:
- ✅ 逻辑简单，不需要验证码
- ❌ 使用旧的 `useWeilaFetch`

**目标**:
- ✅ 迁移到 `useMutation`
- ✅ 优化错误处理

---

### 📝 Task 1: 升级 `change-password.vue`（最简单）

**文件**: `src/pages/me/change-password.vue`  
**复杂度**: 🟢 简单  
**预计改动**: ~20 行

#### 改动内容

1. **迁移 API 调用**
   ```ts
   // ❌ 旧代码
   const { error, isFetching, isFinished, data, execute: changePassword } = useWeilaFetch(...)
   watch([data, isFinished, error], ...)
   
   // ✅ 新代码
   const { mutate: changePassword, isPending: isFetching, error } = useMutation({
     mutation: (params) => weilaFetch(...),
     onSuccess() {
       showToast('密码修改成功')
       router.push('/me')
     },
     onError(error) {
       showToast(error.message || '密码修改失败')
     },
   })
   ```

2. **优化表单提交**
   ```ts
   function handleSubmit() {
     if (!validate(formData.value)) {
       showToast(Object.values(errors.value)?.[0] || '表单验证失败')
       return
     }
     changePassword({
       old_password: md5(formData.value.old_password),
       new_password: md5(formData.value.new_password),
     })
   }
   ```

3. **清理冗余代码**
   - 移除不必要的 `computed`
   - 移除冗余注释
   - 简化 imports

#### 验收标准
- [x] 能正常提交修改密码
- [x] 成功时显示 Toast 并跳转
- [x] 失败时显示 Toast 提示错误信息
- [x] 表单验证失败时显示 Toast
- [x] 无 lint 错误

#### ✅ 完成状态
**状态**: ✅ 已完成并验证  
**完成时间**: 2025-12-31  
**额外改进**: 同时优化了 `login.vue` 页面，添加了 Toast 提示

**login.vue 改进**:
- ✅ 添加登录成功的 Toast 提示
- ✅ 添加登录失败的 Toast 提示
- ✅ 添加表单验证失败的 Toast 提示
- ✅ 移除模板中冗余的错误信息显示
- ✅ 清理不必要的 `watch`、`computed` 代码
- ✅ 代码行数: 140 → 118 (-22 lines)

---

### 📝 Task 2: 升级 `bind-email.vue`（中等复杂度）

**文件**: `src/pages/me/bind-email.vue`  
**复杂度**: 🟡 中等  
**预计改动**: ~80 行

#### ⚠️ 需要确认的 API 信息

在开始前需要确认：

1. **发送邮箱验证码的 API 端点**
   - 推测: `/common/send-email-verifycode`
   - 请求参数格式:
     ```ts
     {
       email: string
       countrycode: string  // ❓ 邮箱验证码是否需要国家代码？
       verify_id: string
       verify_answer: string
       emailtype: 'work-bind'  // ❓ 请确认参数名和值
     }
     ```

2. **是否需要图形验证码？**
   - 参考 `bind-phone` 使用了图形验证码
   - ❓ 确认 `bind-email` 是否也需要

#### 改动内容

1. **UI 结构调整**
   ```vue
   <template>
     <!-- 邮箱输入框 -->
     <div>...</div>
     
     <!-- 图形验证码 -->
     <div>
       <ImageVerifyCode
         ref="imageVerifyCodeRef"
         v-model="formData.imageVerifyAnswer"
         :disabled="isFetching"
         :error="!!errors.imageVerifyAnswer"
       />
     </div>
     
     <!-- 邮箱验证码 + 发送按钮 -->
     <div class="flex items-center space-x-2">
       <input v-model="formData.verifycode" ... />
       <CountDownButton
         ref="countDownButtonRef"
         :disabled="!canSendEmail"
         :loading="isSendingEmail"
         @click="handleSendEmailVerifyCode"
       />
     </div>
   </template>
   ```

2. **表单数据扩展**
   ```ts
   const formData = ref({
     email: '',
     imageVerifyAnswer: '',  // 新增
     verifycode: '',
   })
   ```

3. **添加发送邮箱验证码逻辑**
   ```ts
   const { mutate: sendEmailVerifyCode, isPending: isSendingEmail } = useMutation({
     mutation: (params: SendEmailVerifyCodeRequest) =>
       weilaFetch('/common/send-email-verifycode', {
         method: 'POST',
         body: params,
       }),
     onSuccess() {
       showToast('验证码已发送')
       countDownButtonRef.value?.startCountdown()
     },
     onError(error) {
       showToast(error.message || '发送验证码失败')
       imageVerifyCodeRef.value?.refresh()
     },
   })
   
   const canSendEmail = computed(() => {
     return formData.value.email
       && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
       && formData.value.imageVerifyAnswer
       && !isSendingEmail.value
   })
   ```

4. **迁移绑定邮箱逻辑**
   ```ts
   const { mutate: bindEmail, isPending: isFetching, error } = useMutation({
     mutation: (params: BindEmailRequest) =>
       weilaFetch('/corp/user/bind-email', {
         method: 'POST',
         body: params,
       }),
     onSuccess() {
       showToast('邮箱绑定成功')
       router.push('/me')
     },
     onError(error) {
       showToast(error.message || '邮箱绑定失败')
     },
   })
   ```

#### 验收标准
- [ ] 图形验证码正常显示和刷新
- [ ] 填写邮箱和图形验证码后，发送按钮可点击
- [ ] 点击发送按钮后，能收到邮箱验证码
- [ ] 发送成功后开始倒计时
- [ ] 填写验证码后能成功绑定邮箱
- [ ] 所有错误都有 Toast 提示
- [ ] 无 lint 错误

---

### 📝 Task 3: 升级 `UnregistPhone.vue`（复杂）

**文件**: `src/pages/me/UnregistPhone.vue`  
**复杂度**: 🔴 复杂  
**预计改动**: ~90 行

#### ⚠️ 需要确认的 API 信息

1. **发送注销短信验证码的 smstype**
   - 绑定手机使用: `'work-bind'`
   - 注销账号使用: `'work-unregist'` ❓ 请确认

2. **是否需要图形验证码？**
   - ❓ 确认注销流程是否需要图形验证码

#### 改动内容

1. **UI 结构调整**（同 Task 2 模式）
   - 添加图形验证码组件
   - 添加发送验证码按钮
   - 添加危险操作警告

2. **表单数据扩展**
   ```ts
   const formData = ref({
     phone: '',
     country_code: '86',
     imageVerifyAnswer: '',  // 新增
     verifycode: '',
   })
   ```

3. **添加发送短信验证码逻辑**
   ```ts
   const { mutate: sendSmsVerifyCode, isPending: isSendingSms } = useMutation({
     mutation: (params: SendSmsVerifyCodeRequest) =>
       weilaFetch('/common/send-sms-verifycode', {
         method: 'POST',
         body: params,
       }),
     onSuccess() {
       showToast('验证码已发送')
       countDownButtonRef.value?.startCountdown()
     },
     onError(error) {
       showToast(error.message || '发送验证码失败')
       imageVerifyCodeRef.value?.refresh()
     },
   })
   ```

4. **迁移注销逻辑**（保留确认对话框）
   ```ts
   const { mutate: unregister, isPending: isFetching, error } = useMutation({
     mutation: (params: UnregistRequest) =>
       weilaFetch('/corp/user/unregist', {
         method: 'POST',
         body: params,
       }),
     onSuccess() {
       showToast('账号注销成功')
       clearAuth()
       router.push('/login')
     },
     onError(error) {
       showToast(error.message || '账号注销失败')
     },
   })
   ```

#### 验收标准
- [ ] 图形验证码正常显示
- [ ] 能发送短信验证码
- [ ] 倒计时功能正常
- [ ] 提交时显示确认对话框
- [ ] 注销成功后清除登录状态并跳转
- [ ] 所有错误都有 Toast 提示
- [ ] 无 lint 错误

---

### 📝 Task 4: 升级 `UnregistEmail.vue`（复杂）

**文件**: `src/pages/me/UnregistEmail.vue`  
**复杂度**: 🔴 复杂  
**预计改动**: ~90 行

#### ⚠️ 需要确认的 API 信息

1. **发送注销邮箱验证码的 emailtype**
   - 注销账号使用: `'work-unregist'` ❓ 请确认

2. **是否需要图形验证码？**
   - ❓ 确认注销流程是否需要图形验证码

#### 改动内容

与 Task 3 类似，但使用邮箱验证码：
1. 添加图形验证码 + 邮箱验证码发送流程
2. 迁移到 Pinia Colada
3. 保留确认对话框

#### 验收标准
- [ ] 图形验证码正常显示
- [ ] 能发送邮箱验证码
- [ ] 倒计时功能正常
- [ ] 提交时显示确认对话框
- [ ] 注销成功后清除登录状态并跳转
- [ ] 所有错误都有 Toast 提示
- [ ] 无 lint 错误

---

### 📝 Task 5: 补充类型定义

**文件**: `src/types/auth.ts`  
**复杂度**: 🟢 简单  
**预计改动**: ~10 行

#### 改动内容

```ts
// 发送邮箱验证码请求参数
export interface SendEmailVerifyCodeRequest {
  email: string
  countrycode?: string  // 根据实际 API 确定是否需要
  verify_id: string
  verify_answer: string
  emailtype: string  // 'work-bind' | 'work-unregist'
}
```

#### 验收标准
- [ ] 类型定义准确
- [ ] 所有引用处无类型错误
- [ ] 无 lint 错误

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

## ❓ 待确认的 API 信息

在开始实施前，请确认以下信息：

### 1. **邮箱验证码 API**
```ts
// 端点
POST /common/send-email-verifycode

// 请求参数
{
  email: string
  countrycode?: string        // ❓ 是否需要？
  verify_id: string
  verify_answer: string
  emailtype: 'work-bind' | 'work-unregist'  // ❓ 请确认参数名和值
}
```

### 2. **短信验证码类型**
```ts
// 绑定手机
smstype: 'work-bind'  // ✅ 已确认（参考 bind-phone.vue）

// 注销账号
smstype: 'work-unregist'  // ❓ 请确认
```

### 3. **图形验证码需求**
- ❓ bind-email 是否需要图形验证码？
- ❓ 注销流程是否需要图形验证码？

### 4. **其他**
- ❓ 是否有其他需要调整的交互细节？
- ❓ 按钮文案、提示信息是否需要特定的内容？

---

## 🚦 执行流程

1. **开始 Task 1**（最简单，用于验证流程）
   - Agent 完成代码修改
   - 提交代码
   - 等待 User 验证

2. **User 验证 Task 1**
   - ✅ 通过 → 继续 Task 2
   - ❌ 需要调整 → Agent 修改 → 重新验证

3. **依次完成 Task 2-5**
   - 每个任务完成后都需要 User 验证
   - 确保每一步都正确后再进行下一步

4. **全部完成后**
   - 更新文档
   - 运行完整测试
   - 确认所有页面正常工作

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
