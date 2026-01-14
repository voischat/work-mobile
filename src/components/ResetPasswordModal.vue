<script setup lang="ts">
import ResetPasswordForm from '~/components/forms/ResetPasswordForm.vue'
import Modal from '~/components/Modal.vue'

defineProps<{
  memberId: number
  memberName: string
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const open = defineModel('open', { type: Boolean, default: false })

const { showToast } = useToast()

// 表单组件的引用
const formRef = ref<InstanceType<typeof ResetPasswordForm> | null>(null)

// 处理提交
async function handleSubmit() {
  await formRef.value?.submit()
  // 提交成功后的处理
  showToast('密码重置成功')
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
    title="重置密码"
    confirm-text="确认重置"
    cancel-text="取消"
    :on-confirm="handleSubmit"
    :on-cancel="handleCancel"
  >
    <!-- 只在模态框打开时才渲染表单组件 -->
    <ResetPasswordForm
      v-if="open"
      ref="formRef"
      :member-id="memberId"
    />
  </Modal>
</template>
