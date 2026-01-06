# Notes: 实时位置页面重构 - 部门/群组选择器拆分

## Research Findings

### 现有组件分析

**MemberSelector (src/components/MemberSelector.vue):**

- Modal 包装器 + DeptMemberTreeSelector (单选模式)
- v-model:userId 双向绑定
- 内部维护 selectedMembers: Member[]

**DeptMemberTreeSelector (src/components/DeptMemberTreeSelector.vue):**

- API: `/corp/address/get-my-manage-all-dept` (获取部门列表)
- API: `/corp/address/get-dept-all-member` (获取部门成员)
- 支持 single/multiple 模式
- 树形结构，可展开部门查看成员
- v-model:selectedMembers 双向绑定 (Member[])

### 群组相关 API (从 groups/[id]/members.vue 分析)

- `/corp/group/get-my-manage-group-list` (获取我的群组列表)
- `/corp/group/get-group-all-member` (获取群组所有成员)
- 请求格式: `{ group_id: number }`

### reka-ui 组件使用情况

项目已使用的 reka-ui 组件:

- AvatarRoot, AvatarImage, AvatarFallback
- DropdownMenuRoot, DropdownMenuTrigger
- TreeRoot, TreeItem
- CollapsibleRoot, CollapsibleTrigger

**Select 组件未使用，但 reka-ui 提供:**

- SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValue

## 实现方案

### 1. 部门/群组类型选择

使用 reka-ui Select 组件，让用户选择:

- 部门 (sessionType = 20)
- 群组 (sessionType = 需确认)

### 2. DeptMemberSelector

基于 DeptMemberTreeSelector 的简化版本:

- 直接使用 DeptMemberTreeSelector (mode="single")
- 保持相同的 API 调用
- v-model:userId 绑定

### 3. GroupMemberSelector

参考 DeptMemberSelector 结构:

- 先获取群组列表 (选择哪个群组)
- 然后获取该群组的成员列表
- 单选模式

### 4. realtime-location/index.vue 修改

```ts
// 添加类型选择
const selectedType = useRouteQuery<'dept' | 'group'>('type', 'dept') // 'dept' | 'group'
const sessionType = computed(() => selectedType.value === 'dept' ? 20 : 30)
```

## API 端点总结

| 功能        | 部门                                              | 群组                                              |
| ----------- | ------------------------------------------------- | ------------------------------------------------- |
| 获取列表    | `/corp/address/get-my-manage-all-dept`            | `/corp/group/get-my-manage-group-list`            |
| 获取成员    | `/corp/address/get-dept-all-member` + `{dept_id}` | `/corp/group/get-group-all-member` + `{group_id}` |
| sessionType | 20                                                | 需确认                                            |
