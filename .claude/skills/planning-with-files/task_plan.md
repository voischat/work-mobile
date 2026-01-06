# Task Plan: Generic Tree Selector Design

## Goal

Create a generic tree selector component with `loadMore` function for departments/groups and their members.

## Design

### GenericTreeSelector Component

- Takes a `loadMore` function: `(ctx: NodeData | null) => Promise<NodeData[]>`
- When `ctx` is null, returns root level (departments or groups)
- When `ctx` is a dept/group node, returns its members
- Supports single/multiple selection modes
- Tracks selected nodes and their IDs

### NodeData Type

```ts
interface NodeData {
  id: number
  name: string
  type: 'dept' | 'group' | 'member'
  user_count?: number
  // member specific
  avatar?: string
  user_num?: string
}
```

### Usage Examples

#### Department/Group Selection (for realtime-location)

```ts
async function deptLoader(ctx: NodeData | null) {
  if (!ctx) {
    // Load departments
    return await weilaFetch<Dept[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' })
  }
  // Load members of this department
  return await weilaFetch<Member[]>('/corp/address/get-dept-all-member', {
    method: 'POST',
    body: { dept_id: ctx.id }
  })
}
```

#### Member Selection (for track)

```ts
// Same loader but returns different node types
// Selection is on member nodes, not dept/group nodes
```

## Phases

- [x] Phase 1: Define types for NodeData and generic selector
- [ ] Phase 2: Create GenericTreeSelector component
- [ ] Phase 3: Create loader functions for dept/group
- [ ] Phase 4: Update realtime-location page
- [ ] Phase 5: Update track page
- [ ] Phase 6: Type check and verify

## Status

**Currently in Phase 2** - Creating TreeSelector component

## Implementation Plan

### reka-ui Select 组件用法

```vue
<script setup lang="ts">
// nuxt will auto import reka ui
const selectedType = ref('dept')
</script>

<template>
  <SelectRoot v-model="selectedType">
    <SelectTrigger>
      <SelectValue placeholder="选择类型" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="dept">
        <SelectItemText>部门</SelectItemText>
      </SelectItem>
      <SelectItem value="group">
        <SelectItemText>群组</SelectItemText>
      </SelectItem>
    </SelectContent>
  </SelectRoot>
</template>
```

### 组件创建

- **GroupMemberTreeSelector**: 参考 DeptMemberTreeSelector，API 为 `/corp/group/get-my-manage-group-list` + `/corp/group/get-group-all-member`

## Decisions Made

- **简化实现**: 不创建额外的 DeptMemberSelector，直接使用现有的 DeptMemberTreeSelector
- **新组件**: 只创建 GroupMemberTreeSelector 组件（参考 DeptMemberTreeSelector）
- **类型选择**: 在 realtime-location 页面使用 reka-ui Select 切换部门/群组
- **动态显示**: 根据类型选择动态显示 DeptMemberTreeSelector 或 GroupMemberTreeSelector
- **支持模式**: 两个选择器都保持原有的单选/多选支持

## Errors Encountered

-

## Status

**Currently in Phase 7** - 已完成所有开发工作，typecheck 通过，等待用户测试验证
