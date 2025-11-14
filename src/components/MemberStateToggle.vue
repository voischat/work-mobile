<script setup lang="ts">
import type { Member } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const props = defineProps<{
  member: Member
}>()

const emit = defineEmits<{
  (e: 'updated', member: Member): void
}>()

const { showToast } = useToast()

// 使用 ref 管理状态（0=启用, 1=停用）
const state = ref(props.member.state)

// 监听 member 变化，同步状态
watch(() => props.member.state, (newState) => {
  state.value = newState
}, { immediate: true })

// 切换状态
const newState = computed(() => state.value === 0 ? 1 : 0)

// 调用修改状态 API
const { isFetching, execute: changeState } = useWeilaFetch('/corp/address/change-member-state', {
  immediate: false,
}).post(() => ({
  user_id: props.member.user_id,
  state: newState.value,
})).json()

async function handleToggle() {
  if (isFetching.value) {
    return
  }
  try {
    const result = await changeState()
    if (result) {
      state.value = newState.value
      showToast(state.value === 0 ? '已启用' : '已停用')
      emit('updated', { ...props.member, state: state.value })
    }
  }
  catch (error) {
    console.error('修改状态失败:', error)
    showToast('修改状态失败')
  }
}
</script>

<template>
  <button
    type="button"
    class="px-3 py-1.5 text-sm rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[
      state === 0
        ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
      isFetching ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    :disabled="isFetching"
    @click="handleToggle"
  >
    {{ state === 0 ? '启用' : '停用' }}
  </button>
</template>
