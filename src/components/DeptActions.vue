<script setup lang="ts">
import type { Dept } from '~/types/management'
import { useMutation, useQueryCache } from '@pinia/colada'
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'
import EditDeptModal from './EditDeptModal.vue'
import Modal from './Modal.vue'

const props = defineProps<{
  dept: Dept
}>()

const { showToast } = useToast()
const queryCache = useQueryCache()
const { t } = useI18n()

const showEditModal = ref(false)
const showDeleteModal = ref(false)

const { mutate: deleteDept } = useMutation({
  mutation: (deptId: number) => weilaFetch('/corp/address/delete-dept', {
    method: 'POST',
    body: { dept_id: deptId },
  }),
  onSuccess: () => {
    showToast(t('common.messages.deleteSuccess'))
    queryCache.invalidateQueries({ key: ['dept'] })
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
  queryCache.invalidateQueries({ key: ['dept'] })
}

async function handleDeleteConfirm() {
  await deleteDept(props.dept.id)
}
</script>

<template>
  <div class="flex items-center justify-end space-x-3">
    <button
      type="button"
      class="px-3 py-1.5 text-sm text-blue-600 bg-white border-0 hover:text-blue-700 focus:outline-none"
      @click="handleEdit"
    >
      {{ t('common.actions.edit') }}
    </button>
    <button
      type="button"
      class="px-3 py-1.5 text-sm text-red-600 bg-white border-0 hover:text-red-700 focus:outline-none"
      @click="showDeleteModal = true"
    >
      {{ t('common.actions.delete') }}
    </button>
  </div>

  <Modal
    v-model:open="showDeleteModal"
    :title="t('directory.department.confirmDelete')"
    :message="t('directory.department.confirmDeleteMessage', { name: dept.name })"
    confirm-button-type="danger"
    :on-confirm="handleDeleteConfirm"
  />

  <EditDeptModal
    v-model:open="showEditModal"
    :dept="dept"
    @success="handleEditSuccess"
  />
</template>
