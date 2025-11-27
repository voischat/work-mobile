<script setup lang="ts">
import type { Member } from '~/types/management'
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import EditMemberModal from './EditMemberModal.vue'
import MemberStateToggle from './MemberStateToggle.vue'
import Modal from './Modal.vue'
import ResetPasswordModal from './ResetPasswordModal.vue'

const props = defineProps<{
  member: Member
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const { showToast } = useToast()

// 删除确认模态框
const showDeleteModal = ref(false)
// 编辑成员弹窗
const showEditModal = ref(false)
// 重置密码弹窗
const showResetPasswordModal = ref(false)

// 处理编辑
function handleEdit() {
  showEditModal.value = true
}

// 处理编辑成功
function handleEditSuccess() {
  emit('refresh')
}

// 处理重置密码成功
function handleResetPasswordSuccess() {
  // 密码重置成功，不需要刷新列表
}

// 处理删除确认
async function handleDeleteConfirm() {
  try {
    await weilaApi.v2.fetch('/corp/address/delete-member', {
      body: {
        user_id: props.member.user_id,
      },
    })
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
  showResetPasswordModal.value = true
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
