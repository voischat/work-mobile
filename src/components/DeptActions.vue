<script setup lang="ts">
import type { Dept } from '~/types/management'
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import EditDeptModal from './EditDeptModal.vue'
import Modal from './Modal.vue'

const props = defineProps<{
  dept: Dept
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const { showToast } = useToast()

// 删除确认模态框
const showDeleteModal = ref(false)
// 编辑部门弹窗
const showEditModal = ref(false)

// 删除部门 API
const { execute: deleteDept } = useWeilaFetch('/corp/address/delete-dept', {
  immediate: false,
}).post(() => ({
  dept_id: props.dept.id,
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
    await deleteDept()
    showToast('删除成功')
    // 通知父组件刷新数据
    emit('refresh')
  }
  catch (error) {
    console.error('删除失败:', error)
    showToast('删除失败')
  }
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
    :message="`确定要删除部门「${dept.name}」吗？此操作不可恢复。`"
    confirm-button-type="danger"
    @confirm="handleDeleteConfirm"
  />

  <EditDeptModal
    v-model:open="showEditModal"
    :dept="dept"
    @success="handleEditSuccess"
  />
</template>
