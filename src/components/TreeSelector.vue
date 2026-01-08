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

// UI mode helpers based on expandable/selectable
function shouldShowChevron(node: TreeNode): boolean {
  return node.expandable
}

function shouldShowCheckbox(node: TreeNode): boolean {
  return node.selectable
}

function getRowClickAction(node: TreeNode): 'expand' | 'select' | 'none' {
  if (node.expandable && !node.selectable)
    return 'expand'
  if (node.selectable && !existingNodeIdsSet.value.has(node.id))
    return 'select'
  return 'none'
}

function handleRowClick(node: TreeNode, event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('button') || target.tagName === 'INPUT')
    return

  const action = getRowClickAction(node)
  if (action === 'expand')
    toggleNode(node)
  else if (action === 'select')
    selectNode(node)
}

defineExpose({
  clearSelection: () => {
    selectedNodes.value = []
  },
})
</script>

<template>
  <div>
    <div v-if="rootStatus === 'pending'" class="flex items-center justify-center py-12">
      <Icon icon="lucide:loader-2" class="w-5 h-5 text-gray-400 animate-spin" />
    </div>

    <div v-else-if="rootNodes && rootNodes.length > 0" class="space-y-1">
      <div
        v-for="node in rootNodes"
        :key="node.id"
        class="group"
      >
        <div
          class="flex items-center px-3 py-3 rounded-lg transition-all duration-150"
          :class="{
            'hover:bg-gray-50 cursor-pointer': getRowClickAction(node) !== 'none',
            'bg-blue-50/50': isNodeSelected(node),
          }"
          @click="handleRowClick(node, $event)"
        >
          <!-- Expand/Collapse Button -->
          <button
            v-if="shouldShowChevron(node)"
            type="button"
            class="p-0.5 -ml-0.5 mr-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            @click.stop="toggleNode(node)"
          >
            <Icon
              icon="lucide:chevron-right"
              class="w-3.5 h-3.5 transition-transform duration-200"
              :class="{ 'rotate-90': expandedNodeIds.has(node.id) }"
            />
          </button>
          <div v-else class="w-4 mr-1 flex-shrink-0" />

          <!-- Selection Checkbox -->
          <button
            v-if="shouldShowCheckbox(node)"
            type="button"
            class="mr-2.5 flex-shrink-0"
            :class="{ 'cursor-not-allowed opacity-40': existingNodeIdsSet.has(node.id) }"
            :disabled="existingNodeIdsSet.has(node.id)"
            @click.stop="selectNode(node)"
          >
            <Icon
              :icon="isNodeSelected(node)
                ? (mode === 'single' ? 'lucide:circle-dot' : 'lucide:check-circle-2')
                : 'lucide:circle'"
              class="w-4.5 h-4.5 transition-all duration-150"
              :class="{
                'text-blue-500': isNodeSelected(node),
                'text-gray-300 group-hover:text-gray-400': !isNodeSelected(node),
              }"
            />
          </button>
          <div v-else class="w-4.5 mr-2.5 flex-shrink-0" />

          <!-- Content -->
          <div class="flex items-center flex-1 min-w-0 space-x-3">
            <!-- Avatar for members -->
            <AvatarRoot v-if="node.type === 'member'" class="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
              <AvatarImage
                :src="(node.raw_data as Member)?.avatar"
                :alt="toValue(node.label)"
                class="w-full h-full object-cover"
              />
              <AvatarFallback class="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                {{ (toValue(node.label) || '').charAt(0) }}
              </AvatarFallback>
            </AvatarRoot>

            <!-- Icon for non-members -->
            <Icon
              v-else
              :icon="getNodeIcon(node.type)"
              class="w-4 h-4 flex-shrink-0"
              :class="isNodeSelected(node) ? 'text-blue-500' : 'text-gray-400'"
            />

            <div class="flex-1 min-w-0">
              <span class="text-sm truncate block" :class="isNodeSelected(node) ? 'text-blue-600 font-medium' : 'text-gray-700'">
                {{ toValue(node.label) }}
              </span>
              <div v-if="node.type === 'member' && (node.raw_data as Member)?.user_num" class="text-xs text-gray-400 truncate">
                {{ (node.raw_data as Member).user_num }}
              </div>
            </div>

            <!-- Right side badges -->
            <div class="flex items-center space-x-2 flex-shrink-0">
              <span v-if="node.count !== undefined" class="text-xs text-gray-400">
                {{ node.count }}
              </span>
            </div>
          </div>
        </div>

        <!-- Children -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div v-if="expandedNodeIds.has(node.id)" class="ml-5 mt-1 space-y-1">
            <div v-if="loadingNodeIds.has(node.id)" class="px-3 py-4 text-center">
              <Icon icon="lucide:loader-2" class="w-4 h-4 text-gray-300 animate-spin mx-auto" />
            </div>
            <div v-else-if="nodeChildrenCache.get(node.id)?.length === 0" class="px-3 py-4 text-sm text-gray-400 text-center">
              暂无数据
            </div>
            <div v-else>
              <div
                v-for="child in nodeChildrenCache.get(node.id)"
                :key="child.id"
                class="group/child"
              >
                <div
                  class="flex items-center px-3 py-3 rounded-lg transition-all duration-150"
                  :class="{
                    'hover:bg-gray-50 cursor-pointer': getRowClickAction(child) !== 'none',
                    'bg-blue-50/50': isNodeSelected(child),
                  }"
                  @click="handleRowClick(child, $event)"
                >
                  <!-- Expand/Collapse Button -->
                  <button
                    v-if="shouldShowChevron(child)"
                    type="button"
                    class="p-0.5 -ml-0.5 mr-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    @click.stop="toggleNode(child)"
                  >
                    <Icon
                      icon="lucide:chevron-right"
                      class="w-3.5 h-3.5 transition-transform duration-200"
                      :class="{ 'rotate-90': expandedNodeIds.has(child.id) }"
                    />
                  </button>
                  <div v-else class="w-4 mr-1 flex-shrink-0" />

                  <!-- Selection Checkbox -->
                  <button
                    v-if="shouldShowCheckbox(child)"
                    type="button"
                    class="mr-2.5 flex-shrink-0"
                    :class="{ 'cursor-not-allowed opacity-40': existingNodeIdsSet.has(child.id) }"
                    :disabled="existingNodeIdsSet.has(child.id)"
                    @click.stop="selectNode(child)"
                  >
                    <Icon
                      :icon="isNodeSelected(child)
                        ? (mode === 'single' ? 'lucide:circle-dot' : 'lucide:check-circle-2')
                        : 'lucide:circle'"
                      class="w-4.5 h-4.5 transition-all duration-150"
                      :class="{
                        'text-blue-500': isNodeSelected(child),
                        'text-gray-300 group-hover/child:text-gray-400': !isNodeSelected(child),
                      }"
                    />
                  </button>
                  <div v-else class="w-4.5 mr-2.5 flex-shrink-0" />

                  <!-- Content -->
                  <div class="flex items-center flex-1 min-w-0 space-x-3">
                    <!-- Avatar for members -->
                    <AvatarRoot v-if="child.type === 'member'" class="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                      <AvatarImage
                        :src="(child.raw_data as Member)?.avatar"
                        :alt="toValue(child.label)"
                        class="w-full h-full object-cover"
                      />
                      <AvatarFallback class="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                        {{ (toValue(child.label) || '').charAt(0) }}
                      </AvatarFallback>
                    </AvatarRoot>

                    <!-- Icon for non-members -->
                    <Icon
                      v-else
                      :icon="getNodeIcon(child.type)"
                      class="w-4 h-4 flex-shrink-0"
                      :class="isNodeSelected(child) ? 'text-blue-500' : 'text-gray-400'"
                    />

                    <div class="flex-1 min-w-0">
                      <span class="text-sm truncate block" :class="isNodeSelected(child) ? 'text-blue-600 font-medium' : 'text-gray-700'">
                        {{ toValue(child.label) }}
                      </span>
                      <div v-if="child.type === 'member' && (child.raw_data as Member)?.user_num" class="text-xs text-gray-400 truncate">
                        {{ (child.raw_data as Member).user_num }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div v-else class="text-center py-12 text-sm text-gray-400">
      暂无数据
    </div>
  </div>
</template>
