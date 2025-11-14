<script setup lang="ts">
import type { Member } from '~/types/management'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import EditMemberModal from './EditMemberModal.vue'
import MemberStateToggle from './MemberStateToggle.vue'
import Modal from './Modal.vue'

const props = defineProps<{
  member: Member
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const router = useRouter()
const { showToast } = useToast()

// 删除确认模态框
const showDeleteModal = ref(false)
// 编辑成员弹窗
const showEditModal = ref(false)

// 删除成员 API
const { execute: deleteMember } = useWeilaFetch('/corp/address/delete-member', {
  immediate: false,
}).post(() => ({
  user_id: props.member.user_id,
})).json()

// 处理编辑
function handleEdit() {
  showEditModal.value = true
}

// 处理编辑成功
function handleEditSuccess() {
  emit('refresh')
}

// 处理删除确认
async function handleDeleteConfirm() {
  try {
    await deleteMember()
    showToast('删除成功')
    // 通知父组件刷新数据
    emit('refresh')
  }
  catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败')
  }
}

// 处理重置密码
function handleResetPassword() {
  router.push(`/members/reset-password-${props.member.user_id}`)
}

// 处理状态更新（不需要刷新列表，组件内部状态已更新）
function handleStateUpdated(_updatedMember: Member) {
  // 状态更新后，组件内部状态已同步，无需刷新列表
}
</script>

<template>
  <div class="flex items-center justify-end space-x-3">
    <button
      type="button"
      class="px-3 py-1.5 text-sm text-blue-600 bg-white border-0 hover:text-blue-700 focus:outline-none"
      @click="handleEdit"
    >
      编辑
    </button>
    <MemberStateToggle :member="member" @updated="handleStateUpdated" />
    <button
      type="button"
      class="px-3 py-1.5 text-sm text-orange-600 bg-white border-0 hover:text-orange-700 focus:outline-none"
      @click="handleResetPassword"
    >
      重置密码
    </button>
    <button
      type="button"
      class="px-3 py-1.5 text-sm text-red-600 bg-white border-0 hover:text-red-700 focus:outline-none"
      @click="showDeleteModal = true"
    >
      删除
    </button>
  </div>

  <Modal
    v-model:open="showDeleteModal"
    title="确认删除"
    :message="`确定要删除成员「${member.name}」吗？此操作不可恢复。`"
    confirm-button-type="danger"
    @confirm="handleDeleteConfirm"
  />

  <EditMemberModal
    v-model:open="showEditModal"
    :member="member"
    @success="handleEditSuccess"
  />
</template>
