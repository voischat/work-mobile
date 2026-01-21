<script setup lang="ts">
import type { Group, GroupListResponse } from '~/types/management'
import { useQuery } from '@pinia/colada'
import { useInfiniteScroll } from '@vueuse/core'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import Avatar from '~/components/Avatar.vue'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import GroupAddForm from '~/components/forms/GroupAddForm.vue'
import GroupActions from '~/components/GroupActions.vue'
import Modal from '~/components/Modal.vue'
import { weilaFetch } from '~/shared/instances'

const router = useRouter()

const groupAddFormRef = ref<InstanceType<typeof GroupAddForm>>()
const isGroupModalOpen = ref(false)
const { t } = useI18n()

const currentPage = ref(0)
const accumulatedGroups = ref<Group[]>([])
const pageSize = 10

const {
  data,
  status,
} = useQuery({
  key: () => ['group', 'list', { page: currentPage.value }],
  query: async () => {
    return await weilaFetch<GroupListResponse>(
      `/corp/group/get-my-manage-group-list?page=${currentPage.value}&size=${pageSize}`,
      { method: 'POST' },
    )
  },
  placeholderData: previousData => previousData,
})

watch(data, (newData) => {
  if (newData) {
    if (currentPage.value === 0) {
      accumulatedGroups.value = newData.groups || []
    }
    else {
      const newGroups = newData.groups || []
      const existingIds = new Set(accumulatedGroups.value.map(g => g.id))
      const uniqueNewGroups = newGroups.filter(g => !existingIds.has(g.id))
      accumulatedGroups.value = [...accumulatedGroups.value, ...uniqueNewGroups]
    }
  }
}, { immediate: true })

const hasNextPage = computed(() => {
  if (!data.value)
    return false
  const loadedCount = accumulatedGroups.value.length
  return loadedCount < (data.value.count || 0)
})

function loadNextPage() {
  if (hasNextPage.value)
    currentPage.value += 1
}

const loadMoreEl = useTemplateRef('load-more')
useInfiniteScroll(loadMoreEl, loadNextPage, { distance: 100 })

async function handleRefresh() {
  currentPage.value = 0
  accumulatedGroups.value = []
}

function handleAddGroup() {
  isGroupModalOpen.value = true
}

async function handleGroupConfirm() {
  const result = await groupAddFormRef.value?.submit()
  if (result) {
    await handleRefresh()
    isGroupModalOpen.value = false
  }
}

function handleGroupCancel() {
  groupAddFormRef.value?.reset()
  isGroupModalOpen.value = false
}
</script>

<template>
  <BackLayout title="群组管理">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: t('directory.title'), route: '/directory' },
          { name: t('directory.group.management') },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <div class="mb-4">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            @click="handleAddGroup"
          >
            {{ t('directory.group.create') }}
          </button>
        </div>

        <div v-if="status === 'pending' && accumulatedGroups.length === 0" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            {{ t('common.status.loading') }}
          </div>
        </div>

        <div v-if="accumulatedGroups.length === 0 && status !== 'pending'" class="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          {{ t('directory.group.noData') }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="group in accumulatedGroups"
            :key="group.id"
            class="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            @click="router.push(`/directory/groups/${group.id}/members`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 flex-1 min-w-0">
                <Avatar
                  :src="group.avatar"
                  :alt="group.name"
                  size="md"
                  shape="rounded"
                />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium text-gray-900 mb-1 truncate">
                    {{ group.name }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ t('directory.group.memberCount') }}{{ t('common.punctuation.colon') }} {{ group.user_count }}
                  </p>
                </div>
              </div>
              <div @click.stop>
                <GroupActions :group="group" @refresh="handleRefresh" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasNextPage" ref="load-more" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-600 text-sm">
            {{ t('common.messages.loadMoreLoading') }}
          </div>
        </div>

        <div v-else-if="accumulatedGroups.length > 0" class="mt-4 flex items-center justify-center py-4">
          <div class="text-gray-400 text-sm">
            {{ t('common.messages.loadMoreEnd', { count: data?.count || 0 }) }}
          </div>
        </div>
      </div>
    </div>

    <Modal
      v-model:open="isGroupModalOpen"
      :title="t('directory.group.create')"
      :confirm-text="t('common.actions.confirmCreate')"
      :cancel-text="t('common.actions.cancel')"
      :on-confirm="handleGroupConfirm"
      :on-cancel="handleGroupCancel"
    >
      <GroupAddForm
        ref="groupAddFormRef"
      />
    </Modal>
  </BackLayout>
</template>
