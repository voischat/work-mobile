<script setup lang="ts">
import type { Member } from '~/types/management'
import EditMemberForm from '~/components/EditMemberForm.vue'
import Modal from '~/components/Modal.vue'

const props = defineProps<{
  member: Member
}>()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const open = defineModel('open', { type: Boolean, default: false })

const { showToast } = useToast()

// 表单组件的引用
const formRef = ref<InstanceType<typeof EditMemberForm> | null>(null)

// 判断是否为设备（type === 1）
const isDevice = computed(() => props.member?.type === 1)

// 处理提交
async function handleSubmit() {
  await formRef.value?.submit()
  // 提交成功后的处理
  showToast(isDevice.value ? '设备修改成功' : '成员修改成功')
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
    :title="isDevice ? '编辑设备' : '编辑成员'"
    confirm-text="确认保存"
    cancel-text="取消"
    :on-confirm="handleSubmit"
    :on-cancel="handleCancel"
  >
    <!-- 只在模态框打开时才渲染表单组件，这样表单组件才会请求数据 -->
    <EditMemberForm
      v-if="open"
      ref="formRef"
      :member="member"
    />
  </Modal>
</template>
