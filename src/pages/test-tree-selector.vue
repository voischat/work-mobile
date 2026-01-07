<script setup lang="ts">
import type { Member, TreeNode } from '~/types/management'
import { Icon } from '@iconify/vue'
import { TabsContent, TabsList, TabsRoot, TabsTrigger, ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import { ref, watch } from 'vue'
import TreeSelector from '~/components/TreeSelector.vue'
import { weilaFetch } from '~/shared/instances'

const selectedNodes = ref<TreeNode[]>([])
const mode = ref<'single' | 'multiple'>('single')
const activeTab = ref<'dept' | 'group'>('dept')

async function deptLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const depts = await weilaFetch<{ id: number, name: string, user_count: number }[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' })
    return depts.map(d => ({
      id: d.id,
      label: d.name,
      type: 'dept' as const,
      count: d.user_count,
      expandable: true,
      selectable: true,
      raw_data: d,
    }))
  }
  const members = await weilaFetch<{ user_id: number, name: string, avatar: string, user_num: string, dept_id: number }[]>('/corp/address/get-dept-all-member', {
    method: 'POST',
    body: { dept_id: ctx.id },
  })
  return members.map(m => ({
    id: m.user_id,
    label: m.name,
    type: 'member' as const,
    expandable: false,
    selectable: true,
    raw_data: m as Member,
  }))
}

async function groupLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const result = await weilaFetch<{ count: number, groups: { id: number, name: string, user_count: number }[] }>('/corp/group/get-my-manage-group-list?page=0&size=1000', { method: 'POST' })
    return result.groups.map(g => ({
      id: g.id,
      label: g.name,
      type: 'group' as const,
      count: g.user_count,
      expandable: true,
      selectable: true,
      raw_data: g,
    }))
  }
  const members = await weilaFetch<{ user_id: number, name: string, avatar: string, user_num: string }[]>('/corp/group/get-group-all-member', {
    method: 'POST',
    body: { group_id: ctx.id },
  })
  return members.map(m => ({
    id: m.user_id,
    label: m.name,
    type: 'member' as const,
    expandable: false,
    selectable: true,
    raw_data: m as Member,
  }))
}

watch(activeTab, () => {
  selectedNodes.value = []
})
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">
      TreeSelector Test
    </h1>

    <!-- Mode Toggle -->
    <div class="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border">
      <div class="flex items-center gap-4">
        <span class="text-sm font-medium text-gray-700">选择模式</span>
        <ToggleGroupRoot
          v-model="mode"
          type="single"
          class="inline-flex bg-gray-100 rounded-lg p-1"
        >
          <ToggleGroupItem
            value="single"
            class="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            单选
          </ToggleGroupItem>
          <ToggleGroupItem
            value="multiple"
            class="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=on]:bg-white data-[state=on]:shadow-sm"
          >
            多选
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </div>
      <div class="text-sm text-gray-500">
        已选中: {{ selectedNodes.length }} 项
      </div>
    </div>

    <!-- Dept/Group Tabs with Tree Selector -->
    <TabsRoot v-model="activeTab" class="w-full">
      <TabsList class="inline-flex h-10 items-center justify-center w-full mb-6 border-b border-gray-200">
        <TabsIndicator class="absolute bottom-0 left-0 h-[2px] bg-blue-500 transition-all duration-300" />
        <TabsTrigger
          value="dept"
          class="relative flex-1 inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:text-blue-500 hover:text-gray-700"
        >
          部门
        </TabsTrigger>
        <TabsTrigger
          value="group"
          class="relative flex-1 inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-500 transition-all duration-200 data-[state=active]:text-blue-500 hover:text-gray-700"
        >
          群组
        </TabsTrigger>
      </TabsList>

      <!-- Tree Selector -->
      <div class="border rounded-lg p-4 bg-white">
        <TabsContent value="dept" class="mt-0">
          <TreeSelector
            key="dept"
            v-model:selected-nodes="selectedNodes"
            :load-more="deptLoader"
            :mode="mode"
          />
        </TabsContent>
        <TabsContent value="group" class="mt-0">
          <TreeSelector
            key="group"
            v-model:selected-nodes="selectedNodes"
            :load-more="groupLoader"
            :mode="mode"
          />
        </TabsContent>
      </div>
    </TabsRoot>

    <!-- Selected Nodes Display -->
    <div class="mt-6 border rounded-lg p-4 bg-gray-50">
      <h2 class="text-lg font-semibold mb-3">
        选中节点
      </h2>
      <div v-if="selectedNodes.length === 0" class="text-sm text-gray-500 italic">
        未选中任何节点
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="node in selectedNodes"
          :key="node.id"
          class="flex items-center gap-2 text-sm"
        >
          <Icon :icon="node.type === 'dept' ? 'lucide:building-2' : node.type === 'group' ? 'lucide:users' : 'lucide:user'" class="w-4 h-4 text-gray-500" />
          <span class="font-medium">{{ typeof node.label === 'function' ? node.label() : node.label }}</span>
          <span class="text-gray-400">({{ node.type }})</span>
        </div>
      </div>
    </div>
  </div>
</template>
