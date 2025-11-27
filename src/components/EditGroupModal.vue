<script setup lang="ts">
import type { Group } from '~/types/management'
import { ref } from 'vue'
import EditGroupForm from '~/components/EditGroupForm.vue'
import Modal from '~/components/Modal.vue'
import { useToast } from '~/composables/useToast'

defineProps<{
  group: Group
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const open = defineModel('open', { type: Boolean, default: false })

const { showToast } = useToast()

// 表单组件的引用
const formRef = ref<InstanceType<typeof EditGroupForm> | null>(null)

// 处理提交
async function handleSubmit() {
  await formRef.value?.submit()
  // 提交成功后的处理
  showToast('群组修改成功')
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
    title="编辑群组"
    confirm-text="确认保存"
    cancel-text="取消"
    :on-confirm="handleSubmit"
    :on-cancel="handleCancel"
  >
    <!-- 只在模态框打开时才渲染表单组件，这样表单组件才会请求数据 -->
    <EditGroupForm
      v-if="open"
      ref="formRef"
      :group="group"
    />
  </Modal>
</template>
