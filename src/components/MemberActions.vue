<script setup lang="ts">
import type { Member } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useMutation, useQueryCache } from '@pinia/colada'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'
import { useRouter } from 'vue-router'
import { weilaFetch } from '~/shared/instances'
import EditMemberModal from './EditMemberModal.vue'
import MemberStateToggle from './MemberStateToggle.vue'
import Modal from './Modal.vue'
import ResetPasswordModal from './ResetPasswordModal.vue'

const props = defineProps<{
  member: Member
  handleDelete?: (member: Member) => Promise<void>
  handleEditSuccess?: (updatedMember: Member) => void
  context?: {
    type: 'dept' | 'group'
    id: number
  }
}>()

const router = useRouter()
const { showToast } = useToast()
const queryCache = useQueryCache()
const { t } = useI18n()

const showDeleteModal = ref(false)
const showEditModal = ref(false)
const showResetPasswordModal = ref(false)

const { mutate: deleteMember } = useMutation({
  mutation: (userId: number) => weilaFetch('/corp/address/delete-member', {
    method: 'POST',
    body: { user_id: userId },
  }),
  onSuccess: () => {
    showToast(t('common.messages.deleteSuccess'))
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
    queryCache.invalidateQueries({ key: ['group'] })
  },
  onError: (error) => {
    console.error('删除失败:', error)
    showToast(t('common.messages.deleteFailed'))
  },
})

function handleEdit() {
  showEditModal.value = true
}

function handleEditSuccess() {
  if (props?.handleEditSuccess) {
    props.handleEditSuccess(props.member)
  }
}

function handleResetPasswordSuccess() {
}

async function handleDeleteConfirm() {
  if (props?.handleDelete) {
    await props.handleDelete(props.member)
  }
  else {
    await deleteMember(props.member.user_id)
  }
}

function handleResetPassword() {
  showResetPasswordModal.value = true
}

function handleStateUpdated(_updatedMember: Member) {
}

function handleViewTrack() {
  router.push(`/workbench/track?userId=${props.member.user_id}&userName=${encodeURIComponent(props.member.name)}`)
}

function handleViewRealtime() {
  if (props.context) {
    router.push(`/workbench/realtime-location?type=${props.context.type}&${props.context.type}Id=${props.context.id}`)
  }
  else {
    router.push(`/workbench/realtime-location?type=dept&deptId=${props.member.dept_id}`)
  }
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <MemberStateToggle v-if="member.type !== 255" :member="member" @updated="handleStateUpdated" />

    <button
      type="button"
      class="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
      @click="handleEdit"
    >
      <Icon icon="lucide:edit" class="w-3.5 h-3.5" />
      <span>{{ t('common.actions.edit') }}</span>
    </button>

    <button
      v-if="member.type !== 255"
      type="button"
      class="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
      @click="handleResetPassword"
    >
      <Icon icon="lucide:key" class="w-3.5 h-3.5" />
      <span>{{ t('directory.member.resetPassword') }}</span>
    </button>

    <DropdownMenuRoot v-if="member.type !== 255">
      <DropdownMenuTrigger
        class="inline-flex items-center justify-center rounded p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
      >
        <Icon icon="lucide:more-vertical" class="w-4 h-4" />
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          class="min-w-[140px] bg-white rounded-lg border border-gray-200 shadow-lg p-1 z-50"
          :side-offset="5"
          align="end"
        >
          <DropdownMenuItem
            class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-50 focus:bg-gray-50 outline-none transition-colors"
            @select="handleViewTrack"
          >
            <Icon icon="lucide:route" class="w-4 h-4" />
            <span>{{ t('directory.member.viewTrack') }}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 rounded cursor-pointer hover:bg-gray-50 focus:bg-gray-50 outline-none transition-colors"
            @select="handleViewRealtime"
          >
            <Icon icon="lucide:map-pin" class="w-4 h-4" />
            <span>{{ t('directory.member.viewLocation') }}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            class="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 rounded cursor-pointer hover:bg-red-50 focus:bg-red-50 outline-none transition-colors"
            @select="showDeleteModal = true"
          >
            <Icon icon="lucide:trash-2" class="w-4 h-4" />
            <span>{{ t('directory.member.delete') }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>

  <Modal
    v-model:open="showDeleteModal"
    :title="t('directory.member.confirmDelete')"
    :message="t('directory.member.confirmDeleteMessage', { name: member.name })"
    confirm-button-type="danger"
    :on-confirm="handleDeleteConfirm"
  />

  <EditMemberModal
    v-model:open="showEditModal"
    :member="member"
    @success="handleEditSuccess"
  />

  <ResetPasswordModal
    v-model:open="showResetPasswordModal"
    :member-id="member.user_id"
    :member-name="member.name"
    @success="handleResetPasswordSuccess"
  />
</template>
