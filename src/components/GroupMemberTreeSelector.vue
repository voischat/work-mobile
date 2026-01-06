<script setup lang="ts">
import type { GroupListResponse, Member, MemberListResponse } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useQuery } from '@pinia/colada'
import { AvatarFallback, AvatarImage, AvatarRoot } from 'reka-ui'
import { computed, ref } from 'vue'
import { weilaFetch } from '~/shared/instances'

const props = withDefaults(defineProps<{
  existingMemberIds?: number[]
  mode?: 'single' | 'multiple'
}>(), {
  existingMemberIds: () => [],
  mode: 'multiple',
})

const selectedMembers = defineModel<Member[]>('selectedMembers', {
  default: () => [],
  required: true,
})

const existingMemberIdsSet = computed(() => new Set(props.existingMemberIds))
const selectedMemberIdsSet = computed(() => new Set(selectedMembers.value.map(m => m.user_id)))

const expandedGroupIds = ref<Set<number>>(new Set())
const groupMembersCache = ref<Map<number, Member[]>>(new Map())
const loadingGroupIds = ref<Set<number>>(new Set())

const {
  data: groups,
  status: groupsStatus,
} = useQuery({
  key: ['group', 'my-manage'],
  query: () => weilaFetch<GroupListResponse>('/corp/group/get-my-manage-group-list?page=0&size=1000', { method: 'POST' }),
})

async function toggleGroup(groupId: number) {
  if (expandedGroupIds.value.has(groupId)) {
    expandedGroupIds.value.delete(groupId)
  }
  else {
    expandedGroupIds.value.add(groupId)
    if (!groupMembersCache.value.has(groupId)) {
      await loadGroupMembers(groupId)
    }
  }
}

async function loadGroupMembers(groupId: number) {
  if (loadingGroupIds.value.has(groupId))
    return

  loadingGroupIds.value.add(groupId)

  try {
    const result = await weilaFetch<MemberListResponse>('/corp/group/get-group-all-member', {
      method: 'POST',
      body: { group_id: groupId },
    })
    const members = Array.isArray(result) ? result : result?.members
    groupMembersCache.value.set(groupId, members || [])
  }
  catch (error) {
    console.error(`加载群组 ${groupId} 的成员失败:`, error)
    groupMembersCache.value.set(groupId, [])
  }
  finally {
    loadingGroupIds.value.delete(groupId)
  }
}

function toggleMember(memberId: number) {
  if (existingMemberIdsSet.value.has(memberId))
    return

  // Find the member from cache
  let member: Member | undefined
  for (const members of groupMembersCache.value.values()) {
    member = members.find(m => m.user_id === memberId)
    if (member)
      break
  }
  if (!member)
    return

  if (props.mode === 'single') {
    const isSelected = selectedMembers.value.some(m => m.user_id === memberId)
    selectedMembers.value = isSelected ? [] : [member]
  }
  else {
    const isSelected = selectedMembers.value.some(m => m.user_id === memberId)
    selectedMembers.value = isSelected
      ? selectedMembers.value.filter(m => m.user_id !== memberId)
      : [...selectedMembers.value, member]
  }
}

function getGroupMembers(groupId: number): Member[] {
  return groupMembersCache.value.get(groupId) || []
}

function isGroupLoading(groupId: number): boolean {
  return loadingGroupIds.value.has(groupId)
}

function isMemberSelected(memberId: number): boolean {
  return selectedMemberIdsSet.value.has(memberId) || existingMemberIdsSet.value.has(memberId)
}

function isMemberExisting(memberId: number): boolean {
  return existingMemberIdsSet.value.has(memberId)
}

defineExpose({
  clearSelection: () => {
    selectedMembers.value = []
  },
})
</script>

<template>
  <div>
    <div v-if="groupsStatus === 'pending'" class="flex items-center justify-center py-8">
      <div class="text-gray-600">
        加载群组列表中...
      </div>
    </div>

    <div v-else-if="groups?.groups && groups.groups.length > 0" class="space-y-1">
      <div
        v-for="group in groups.groups"
        :key="group.id"
        class="border border-gray-200 rounded-lg overflow-hidden"
      >
        <div
          class="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          @click="toggleGroup(group.id)"
        >
          <div class="flex items-center space-x-3 flex-1">
            <Icon
              icon="lucide:chevron-right"
              class="w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-90': expandedGroupIds.has(group.id) }"
            />
            <span class="font-medium text-gray-900">{{ group.name }}</span>
            <span class="text-sm text-gray-500">({{ group.user_count }}人)</span>
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
          <div v-if="expandedGroupIds.has(group.id)" class="bg-white border-t border-gray-200">
            <div v-if="isGroupLoading(group.id)" class="px-4 py-8 text-center text-gray-500 text-sm">
              加载成员中...
            </div>
            <div v-else-if="getGroupMembers(group.id).length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
              该群组暂无成员
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="member in getGroupMembers(group.id)"
                :key="member.user_id"
                class="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                @click.stop="toggleMember(member.user_id)"
              >
                <input
                  :type="mode === 'single' ? 'radio' : 'checkbox'"
                  :checked="isMemberSelected(member.user_id)"
                  :disabled="isMemberExisting(member.user_id)"
                  :name="mode === 'single' ? 'member-select' : undefined"
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
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
      暂无群组数据
    </div>
  </div>
</template>
