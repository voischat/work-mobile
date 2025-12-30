<script setup lang="ts">
import type { Dept, Member, MemberListResponse } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useQuery } from '@pinia/colada'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import { computed, ref } from 'vue'
import { weilaFetch } from '~/shared/instances'

const props = withDefaults(defineProps<{
  existingMemberIds?: number[]
}>(), {
  existingMemberIds: () => [],
})

const selectedMemberIds = defineModel<Set<number>>('selectedMemberIds', {
  default: () => new Set(),
  required: true,
})

const existingMemberIdsSet = computed(() => new Set(props.existingMemberIds))
const selectedMemberIdsSet = computed(() => new Set(selectedMemberIds.value))

const expandedDeptIds = ref<Set<number>>(new Set())
const deptMembersCache = ref<Map<number, Member[]>>(new Map())
const loadingDeptIds = ref<Set<number>>(new Set())

const {
  data: depts,
  status: deptsStatus,
} = useQuery({
  key: ['dept', 'my-manage'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-my-manage-all-dept', { method: 'POST' }),
})

async function toggleDept(deptId: number) {
  if (expandedDeptIds.value.has(deptId)) {
    expandedDeptIds.value.delete(deptId)
  }
  else {
    expandedDeptIds.value.add(deptId)
    if (!deptMembersCache.value.has(deptId)) {
      await loadDeptMembers(deptId)
    }
  }
}

async function loadDeptMembers(deptId: number) {
  if (loadingDeptIds.value.has(deptId))
    return

  loadingDeptIds.value.add(deptId)

  try {
    const result = await weilaFetch<MemberListResponse>('/corp/address/get-dept-all-member', {
      method: 'POST',
      body: { dept_id: deptId },
    })
    const members = Array.isArray(result) ? result : result?.members
    deptMembersCache.value.set(deptId, members || [])
  }
  catch (error) {
    console.error(`加载部门 ${deptId} 的成员失败:`, error)
    deptMembersCache.value.set(deptId, [])
  }
  finally {
    loadingDeptIds.value.delete(deptId)
  }
}

function toggleMember(memberId: number) {
  if (existingMemberIdsSet.value.has(memberId))
    return

  const newSelectedSet = new Set(selectedMemberIds.value)
  if (newSelectedSet.has(memberId))
    newSelectedSet.delete(memberId)
  else
    newSelectedSet.add(memberId)

  selectedMemberIds.value = newSelectedSet
}

function getDeptMembers(deptId: number): Member[] {
  return deptMembersCache.value.get(deptId) || []
}

function isDeptLoading(deptId: number): boolean {
  return loadingDeptIds.value.has(deptId)
}

function isMemberSelected(memberId: number): boolean {
  return selectedMemberIdsSet.value.has(memberId) || existingMemberIdsSet.value.has(memberId)
}

function isMemberExisting(memberId: number): boolean {
  return existingMemberIdsSet.value.has(memberId)
}

defineExpose({
  clearSelection: () => {
    selectedMemberIds.value = new Set()
  },
})
</script>

<template>
  <div>
    <div v-if="deptsStatus === 'pending'" class="flex items-center justify-center py-8">
      <div class="text-gray-600">
        加载部门列表中...
      </div>
    </div>

    <div v-else-if="depts && depts.length > 0" class="space-y-1">
      <div
        v-for="dept in depts"
        :key="dept.id"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          @click="toggleDept(dept.id)"
        >
          <div class="flex items-center space-x-3 flex-1">
            <Icon
              icon="lucide:chevron-right"
              class="w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-90': expandedDeptIds.has(dept.id) }"
            />
            <span class="font-medium text-gray-900">{{ dept.name }}</span>
            <span class="text-sm text-gray-500">({{ dept.user_count }}人)</span>
          </div>
        </div>

        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[1000px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[1000px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="expandedDeptIds.has(dept.id)" class="bg-white border-t border-gray-200">
            <div v-if="isDeptLoading(dept.id)" class="px-4 py-8 text-center text-gray-500 text-sm">
              加载成员中...
            </div>
            <div v-else-if="getDeptMembers(dept.id).length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
              该部门暂无成员
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="member in getDeptMembers(dept.id)"
                :key="member.user_id"
                class="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                @click.stop="toggleMember(member.user_id)"
              >
                <input
                  type="checkbox"
                  :checked="isMemberSelected(member.user_id)"
                  :disabled="isMemberExisting(member.user_id)"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  :class="{
                    'cursor-pointer': !isMemberExisting(member.user_id),
                    'cursor-not-allowed opacity-50': isMemberExisting(member.user_id),
                  }"
                  @click.stop="toggleMember(member.user_id)"
                >
                <AvatarRoot class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <AvatarImage
                    :src="member.avatar"
                    :alt="member.name"
                    class="w-full h-full object-cover"
                  />
                  <AvatarFallback class="w-full h-full flex items-center justify-center">
                    <Icon icon="lucide:user" class="w-5 h-5 text-gray-400" />
                  </AvatarFallback>
                </AvatarRoot>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-medium text-gray-900">
                      {{ member.name || '未命名' }}
                    </div>
                    <span
                      v-if="isMemberExisting(member.user_id)"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                    >
                      已添加
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ member.user_num }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      暂无部门数据
    </div>
  </div>
</template>
