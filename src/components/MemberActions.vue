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
import { weilaFetch } from '~/shared/instances'
import EditMemberModal from './EditMemberModal.vue'
import MemberStateToggle from './MemberStateToggle.vue'
import Modal from './Modal.vue'
import ResetPasswordModal from './ResetPasswordModal.vue'

const props = defineProps<{
  member: Member
  handleDelete?: (member: Member) => Promise<void>
  handleEditSuccess?: (updatedMember: Member) => void
}>()

const { showToast } = useToast()
const queryCache = useQueryCache()

const showDeleteModal = ref(false)
const showEditModal = ref(false)
const showResetPasswordModal = ref(false)

// 删除成员 API (only used if handleDelete is not provided)
const { mutate: deleteMember } = useMutation({
  mutation: (userId: number) => weilaFetch('/corp/address/delete-member', {
    method: 'POST',
    body: { user_id: userId },
  }),
  onSuccess: () => {
    showToast('注销成功')
    // Invalidate all member-related queries
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
    queryCache.invalidateQueries({ key: ['group'] })
  },
  onError: (error) => {
    console.error('删除失败:', error)
    showToast('注销失败')
  },
})

function handleEdit() {
  showEditModal.value = true
}

// 处理编辑成功 - Call custom handler if provided
function handleEditSuccess() {
  if (props?.handleEditSuccess) {
    // Custom handler will update accumulated members
    // Note: We don't have the updated member data here,
    // but EditMemberForm's optimistic update already handled the cache
    props.handleEditSuccess(props.member)
  }
}

function handleResetPasswordSuccess() {
  // 密码重置成功，不需要刷新列表
}

async function handleDeleteConfirm() {
  if (props?.handleDelete) {
    // Use custom delete handler if provided (handles optimistic updates)
    await props.handleDelete(props.member)
  }
  else {
    // Use default delete mutation (as fallback)
    await deleteMember(props.member.user_id)
  }
}

function handleResetPassword() {
  showResetPasswordModal.value = true
}

function handleStateUpdated(_updatedMember: Member) {
  // 状态更新后，组件内部状态已同步，无需刷新列表
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <!-- State Toggle -->
    <MemberStateToggle v-if="member.type !== 255" :member="member" @updated="handleStateUpdated" />

    <!-- Edit Button -->
    <button
      type="button"
      class="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
      @click="handleEdit"
    >
      <Icon icon="lucide:edit" class="w-3.5 h-3.5" />
      <span>编辑</span>
    </button>

    <!-- Reset Password Button -->
    <button
      v-if="member.type !== 255"
      type="button"
      class="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
      @click="handleResetPassword"
    >
      <Icon icon="lucide:key" class="w-3.5 h-3.5" />
      <span>重置密码</span>
    </button>

    <!-- More Actions Menu (Dangerous actions only) -->
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
          <!-- Delete -->
          <DropdownMenuItem
            class="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 rounded cursor-pointer hover:bg-red-50 focus:bg-red-50 outline-none transition-colors"
            @select="showDeleteModal = true"
          >
            <Icon icon="lucide:trash-2" class="w-4 h-4" />
            <span>注销账号</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>

  <!-- Delete Confirmation Modal -->
  <Modal
    v-model:open="showDeleteModal"
    title="确认注销"
    :message="`确定要注销成员「${member.name}」吗？此操作不可恢复。`"
    confirm-button-type="danger"
    :on-confirm="handleDeleteConfirm"
  />

  <!-- Edit Member Modal -->
  <EditMemberModal
    v-model:open="showEditModal"
    :member="member"
    @success="handleEditSuccess"
  />

  <!-- Reset Password Modal -->
  <ResetPasswordModal
    v-model:open="showResetPasswordModal"
    :member-id="member.user_id"
    :member-name="member.name"
    @success="handleResetPasswordSuccess"
  />
</template>
