<script setup lang="ts">
import type { Member, TreeNode } from '~/types/management'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import { weilaFetch } from '~/shared/instances'
import Modal from './Modal.vue'
import TreeSelector from './TreeSelector.vue'

const userId = defineModel<number>({ required: true })

const isOpen = ref(false)
const selectedNodes = ref<TreeNode[]>([])

// Sync prop changes to selection
watch(userId, (newId, oldId) => {
  if (newId !== oldId) {
    if (newId > 0) {
      const currentNode = selectedNodes.value.find(n => n.id === newId)
      if (currentNode) {
        selectedNodes.value = [currentNode]
      }
      else {
        // userId changed but we don't have the member data yet
        // Clear selection and wait for user to select again
        selectedNodes.value = []
      }
    }
    else {
      selectedNodes.value = []
    }
  }
}, { immediate: true })

// Sync selection changes to prop
watch(selectedNodes, (newNodes) => {
  const [node] = newNodes
  const newId = node?.id || 0
  if (newId !== userId.value) {
    userId.value = newId
  }
}, { deep: true })

const member = computed(() => selectedNodes.value[0]?.raw_data as Member | undefined)

async function deptMemberLoader(ctx: TreeNode | null): Promise<TreeNode[]> {
  if (!ctx) {
    const depts = await weilaFetch<{ id: number, name: string, user_count: number }[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' })
    return depts.map(d => ({
      id: d.id,
      label: d.name,
      type: 'dept' as const,
      count: d.user_count,
      expandable: true,
      selectable: false,
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
</script>

<template>
  <button
    type="button"
    class="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors min-w-[120px]"
    @click="isOpen = true"
  >
    <span class="truncate">
      {{ member?.name || '选择成员' }}
    </span>
    <Icon icon="lucide:chevron-down" class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
  </button>

  <Modal
    v-model:open="isOpen"
    title="选择成员"
    confirm-text="确定"
    cancel-text="取消"
  >
    <div class="max-h-[60vh] overflow-y-auto">
      <TreeSelector
        v-model:selected-nodes="selectedNodes"
        :load-more="deptMemberLoader"
        :cache-key="['member-selector']"
        mode="single"
      />
    </div>
  </Modal>
</template>
