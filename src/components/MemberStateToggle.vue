<script setup lang="ts">
import type { Member } from '~/types/management'
import { useMutation, useQueryCache } from '@pinia/colada'
import { computed, ref, watch } from 'vue'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const props = defineProps<{
  member: Member
}>()

const emit = defineEmits<{
  (e: 'updated', member: Member): void
}>()

const { showToast } = useToast()
const { t } = useI18n()

const state = ref(props.member.state)

watch(() => props.member.state, (newState) => {
  state.value = newState
}, { immediate: true })

const newState = computed(() => state.value === 0 ? 1 : 0)

const { mutate: changeState, isLoading: isFetching } = useMutation({
  mutation: (payload: { user_id: number, state: number }) => weilaFetch('/corp/address/change-member-state', {
    method: 'POST',
    body: payload,
  }),
  onMutate(payload) {
    const queryCache = useQueryCache()

    const updateMemberState = (list: any[] | undefined) => {
      if (!list)
        return list
      return list.map(item =>
        item.user_id === payload.user_id
          ? { ...item, state: payload.state }
          : item,
      )
    }

    const entries = queryCache.getEntries()
    const oldData: Record<string, any> = {}

    entries.forEach((entry) => {
      const key = entry.key
      if (Array.isArray(key)
        && ((key[0] === 'member' && key[1] === 'list')
          || (key[0] === 'dept' && key[2] === 'members')
          || (key[0] === 'group' && key[2] === 'members'))) {
        const data = queryCache.getQueryData<{ members: Member[], count: number }>(key)
        if (data?.members) {
          oldData[JSON.stringify(key)] = data
          queryCache.setQueryData(key, {
            ...data,
            members: updateMemberState(data.members),
          })
        }
      }
    })

    queryCache.cancelQueries({ key: ['member', 'list'] })
    queryCache.cancelQueries({ key: ['dept'] })
    queryCache.cancelQueries({ key: ['group'] })

    return { oldData, oldState: state.value }
  },
  onSuccess(_data, payload) {
    const queryCache = useQueryCache()
    state.value = payload.state
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
    queryCache.invalidateQueries({ key: ['group'] })
  },
  onError(_error, _payload, context) {
    const queryCache = useQueryCache()

    if (context?.oldState !== undefined) {
      state.value = context.oldState
    }

    if (context?.oldData) {
      Object.entries(context.oldData).forEach(([keyStr, data]) => {
        const key = JSON.parse(keyStr)
        queryCache.setQueryData(key, data)
      })
    }
  },
})

async function handleToggle() {
  if (isFetching.value) {
    return
  }
  try {
    await changeState({
      user_id: props.member.user_id,
      state: newState.value,
    })
    showToast(newState.value === 0 ? t('directory.member.stateEnabled') : t('directory.member.stateDisabled'))
    emit('updated', { ...props.member, state: newState.value })
  }
  catch (error) {
    console.error('修改状态失败:', error)
    showToast(t('directory.member.stateChangeFailed'))
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
    {{ state === 0 ? t('common.actions.enable') : t('common.actions.disable') }}
  </button>
</template>
