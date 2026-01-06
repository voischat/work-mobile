<script setup lang="ts">
import type { Member, TreeNode } from '~/types/management'
import { toArray } from '@antfu/utils'
import { Icon } from '@iconify/vue'
import { useQuery } from '@pinia/colada'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import { computed, ref, toValue } from 'vue'

const props = withDefaults(defineProps<{
  loadMore: (ctx: TreeNode | null) => Promise<TreeNode[]>
  mode?: 'single' | 'multiple'
  cacheKey?: string | string[]
  existingNodeIds?: number[]
}>(), {
  mode: 'multiple',
  cacheKey: 'tree-selector-root',
  existingNodeIds: () => [],
})

const emit = defineEmits<{
  select: [node: TreeNode]
}>()

const selectedNodes = defineModel<TreeNode[]>('selectedNodes', {
  default: () => [],
  required: true,
})

const expandedNodeIds = ref<Set<number>>(new Set())
const nodeChildrenCache = ref<Map<number, TreeNode[]>>(new Map())
const loadingNodeIds = ref<Set<number>>(new Set())

const selectedNodeIdsSet = computed(() => new Set(selectedNodes.value.map(n => n.id)))
const existingNodeIdsSet = computed(() => new Set(props.existingNodeIds || []))

const {
  data: rootNodes,
  status: rootStatus,
} = useQuery({
  key: toArray(props.cacheKey),
  query: () => props.loadMore(null),
})

async function toggleNode(node: TreeNode) {
  if (!node.expandable)
    return

  if (expandedNodeIds.value.has(node.id)) {
    expandedNodeIds.value.delete(node.id)
  }
  else {
    expandedNodeIds.value.add(node.id)
    if (!nodeChildrenCache.value.has(node.id)) {
      await loadNodeChildren(node)
    }
  }
}

async function loadNodeChildren(node: TreeNode) {
  if (loadingNodeIds.value.has(node.id))
    return

  loadingNodeIds.value.add(node.id)

  try {
    const children = await props.loadMore(node)
    nodeChildrenCache.value.set(node.id, children || [])
  }
  catch (error) {
    console.error(`加载节点 ${node.id} 的子节点失败:`, error)
    nodeChildrenCache.value.set(node.id, [])
  }
  finally {
    loadingNodeIds.value.delete(node.id)
  }
}

async function selectNode(node: TreeNode) {
  if (!node.selectable || existingNodeIdsSet.value.has(node.id))
    return

  if (props.mode === 'single') {
    const isSelected = selectedNodes.value.some(n => n.id === node.id)
    selectedNodes.value = isSelected ? [] : [node]
    if (!isSelected)
      emit('select', node)
    return
  }

  // Multiple mode with parent-child sync
  const isSelected = selectedNodes.value.some(n => n.id === node.id)
  const selectedIds = new Set(selectedNodes.value.map(n => n.id))

  if (node.expandable) {
    // Load children if not loaded
    if (!nodeChildrenCache.value.has(node.id)) {
      await loadNodeChildren(node)
    }

    const children = nodeChildrenCache.value.get(node.id) || []
    const selectableChildren = children.filter(c => c.selectable)

    if (isSelected) {
      // Deselect node and all children
      selectedNodes.value = selectedNodes.value.filter(n => n.id !== node.id && !selectableChildren.some(c => c.id === n.id))
    }
    else {
      // Select node and all selectable children
      const toAdd = [node, ...selectableChildren].filter(n => !selectedIds.has(n.id))
      selectedNodes.value = [...selectedNodes.value, ...toAdd]
    }
  }
  else {
    // Leaf node (no children)
    selectedNodes.value = isSelected
      ? selectedNodes.value.filter(n => n.id !== node.id)
      : [...selectedNodes.value, node]
  }
}

function isNodeSelected(node: TreeNode): boolean {
  return selectedNodeIdsSet.value.has(node.id)
}

function getNodeIcon(type: TreeNode['type']): string {
  const icons = {
    dept: 'lucide:building-2',
    group: 'lucide:users',
    member: 'lucide:user',
  }
  return icons[type] || 'lucide:circle'
}

defineExpose({
  clearSelection: () => {
    selectedNodes.value = []
  },
})
</script>

<template>
  <div>
    <div v-if="rootStatus === 'pending'" class="flex items-center justify-center py-8">
      <div class="text-gray-600">
        加载中...
      </div>
    </div>

    <div v-else-if="rootNodes && rootNodes.length > 0" class="space-y-1">
      <div
        v-for="node in rootNodes"
        :key="node.id"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div class="flex items-center px-4 py-3 bg-gray-50">
          <!-- Expand/Collapse Button -->
          <button
            v-if="node.expandable"
            type="button"
            class="mr-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            @click="toggleNode(node)"
          >
            <Icon
              icon="lucide:chevron-right"
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-90': expandedNodeIds.has(node.id) }"
            />
          </button>
          <div v-else class="w-8 mr-2 flex-shrink-0" />

          <!-- Selection Input -->
          <input
            v-if="node.selectable"
            :type="mode === 'single' ? 'radio' : 'checkbox'"
            :checked="isNodeSelected(node)"
            :disabled="existingNodeIdsSet.has(node.id)"
            :name="mode === 'single' ? 'node-select' : undefined"
            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3 flex-shrink-0"
            :class="{
              'cursor-pointer': !existingNodeIdsSet.has(node.id),
              'cursor-not-allowed opacity-50': existingNodeIdsSet.has(node.id),
            }"
            @change="selectNode(node)"
          >

          <!-- Clickable Area (Icon + Avatar + Content) -->
          <div
            class="flex items-center flex-1 min-w-0"
            :class="{
              'cursor-pointer': node.selectable && !existingNodeIdsSet.has(node.id),
              'cursor-default': !node.selectable || existingNodeIdsSet.has(node.id),
            }"
            @click="selectNode(node)"
          >
            <!-- Node Icon -->
            <Icon :icon="getNodeIcon(node.type)" class="w-5 h-5 text-gray-500 flex-shrink-0 mr-3" />

            <!-- Avatar for members -->
            <AvatarRoot v-if="node.type === 'member'" class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden mr-3">
              <AvatarImage
                :src="(node.raw_data as Member)?.avatar"
                :alt="toValue(node.label)"
                class="w-full h-full object-cover"
              />
              <AvatarFallback class="w-full h-full flex items-center justify-center">
                <Icon icon="lucide:user" class="w-5 h-5 text-gray-400" />
              </AvatarFallback>
            </AvatarRoot>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-900">{{ toValue(node.label) }}</span>
                <span
                  v-if="existingNodeIdsSet.has(node.id)"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                >
                  已添加
                </span>
                <span v-if="node.count !== undefined" class="text-sm text-gray-500">({{ node.count }}人)</span>
              </div>
              <div v-if="node.type === 'member' && (node.raw_data as Member)?.user_num" class="text-xs text-gray-500">
                {{ (node.raw_data as Member).user_num }}
              </div>
            </div>
          </div>
        </div>

        <!-- Children -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[1000px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[1000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedNodeIds.has(node.id)" class="bg-white border-t border-gray-200">
            <div v-if="loadingNodeIds.has(node.id)" class="px-4 py-8 text-center text-gray-500 text-sm">
              加载中...
            </div>
            <div v-else-if="nodeChildrenCache.get(node.id)?.length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
              暂无数据
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="child in nodeChildrenCache.get(node.id)"
                :key="child.id"
                class="flex items-center px-4 py-3 hover:bg-gray-50"
              >
                <div class="w-8 mr-2 flex-shrink-0" />

                <!-- Selection Input -->
                <input
                  v-if="child.selectable"
                  :type="mode === 'single' ? 'radio' : 'checkbox'"
                  :checked="isNodeSelected(child)"
                  :disabled="existingNodeIdsSet.has(child.id)"
                  :name="mode === 'single' ? 'node-select' : undefined"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3 flex-shrink-0"
                  :class="{
                    'cursor-pointer': !existingNodeIdsSet.has(child.id),
                    'cursor-not-allowed opacity-50': existingNodeIdsSet.has(child.id),
                  }"
                  @change="selectNode(child)"
                >

                <!-- Clickable Area (Icon + Avatar + Content) -->
                <div
                  class="flex items-center flex-1 min-w-0"
                  :class="{
                    'cursor-pointer': child.selectable && !existingNodeIdsSet.has(child.id),
                    'cursor-default': !child.selectable || existingNodeIdsSet.has(child.id),
                  }"
                  @click="selectNode(child)"
                >
                  <Icon :icon="getNodeIcon(child.type)" class="w-5 h-5 text-gray-400 flex-shrink-0 mr-3" />

                  <!-- Avatar for members -->
                  <AvatarRoot v-if="child.type === 'member'" class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden mr-3">
                    <AvatarImage
                      :src="(child.raw_data as Member)?.avatar"
                      :alt="toValue(child.label)"
                      class="w-full h-full object-cover"
                    />
                    <AvatarFallback class="w-full h-full flex items-center justify-center">
                      <Icon icon="lucide:user" class="w-5 h-5 text-gray-400" />
                    </AvatarFallback>
                  </AvatarRoot>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2">
                      <div class="text-sm font-medium text-gray-900">
                        {{ toValue(child.label) }}
                      </div>
                      <span
                        v-if="existingNodeIdsSet.has(child.id)"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                      >
                        已添加
                      </span>
                    </div>
                    <div v-if="child.type === 'member' && (child.raw_data as Member)?.user_num" class="text-xs text-gray-500">
                      {{ (child.raw_data as Member).user_num }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      暂无数据
    </div>
  </div>
</template>
