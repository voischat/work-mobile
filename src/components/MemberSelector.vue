<script setup lang="ts">
import type { Member } from '~/types/management'
import { Icon } from '@iconify/vue'
import { computed, ref, watch } from 'vue'
import DeptMemberTreeSelector from './DeptMemberTreeSelector.vue'
import Modal from './Modal.vue'

const props = defineProps<{
  userId: number
}>()

const emit = defineEmits<{
  'update:userId': [value: number]
}>()

const isOpen = ref(false)
const selectedMembers = ref<Member[]>([])

// Sync prop changes to selection
watch(() => props.userId, (newId, oldId) => {
  if (newId !== oldId) {
    if (newId > 0) {
      const currentMember = selectedMembers.value.find(m => m.user_id === newId)
      if (currentMember) {
        selectedMembers.value = [currentMember]
      }
      else {
        // userId changed but we don't have the member data yet
        // Clear selection and wait for user to select again
        selectedMembers.value = []
      }
    }
    else {
      selectedMembers.value = []
    }
  }
}, { immediate: true })

// Sync selection changes to prop
watch(selectedMembers, (newMembers) => {
  const [member] = newMembers
  const newId = member?.user_id || 0
  if (newId !== props.userId) {
    emit('update:userId', newId)
  }
}, { deep: true })

const member = computed(() => selectedMembers.value[0])
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
      <DeptMemberTreeSelector
        v-model:selected-members="selectedMembers"
        mode="single"
      />
    </div>
  </Modal>
</template>
