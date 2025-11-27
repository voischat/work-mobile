<script setup lang="ts">
import type { Dept } from '~/types/management'
import { ref } from 'vue'
import EditDeptForm from '~/components/EditDeptForm.vue'
import Modal from '~/components/Modal.vue'
import { useToast } from '~/composables/useToast'

defineProps<{
  dept: Dept
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const open = defineModel('open', { type: Boolean, default: false })

const { showToast } = useToast()

// 表单组件的引用
const formRef = ref<InstanceType<typeof EditDeptForm> | null>(null)

// 处理确认
async function handleConfirm() {
  await formRef.value?.submit()
  showToast('部门修改成功')
  open.value = false
  emit('success')
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Modal
    v-model:open="open"
    title="编辑部门"
    confirm-text="确认保存"
    cancel-text="取消"
    :on-confirm="handleConfirm"
    :on-cancel="handleCancel"
  >
    <!-- 只在模态框打开时才渲染表单组件，这样表单组件才会请求数据 -->
    <EditDeptForm
      v-if="open"
      ref="formRef"
      :dept="dept"
    />
  </Modal>
</template>
