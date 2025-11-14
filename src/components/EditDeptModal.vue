<script setup lang="ts">
import type { Dept } from '~/types/management'
import { computed, ref } from 'vue'
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

// 获取表单的提交状态
const isSubmitting = computed(() => formRef.value?.isFetching ?? false)

// 处理提交
async function handleSubmit() {
  if (!formRef.value) {
    return
  }

  try {
    await formRef.value.submit()
    // 提交成功后的处理
    showToast('部门修改成功')
    open.value = false
    emit('success')
  }
  catch (error) {
    // 错误已经在表单组件中显示，这里不需要额外处理
    console.error('提交失败:', error)
  }
}

function handleCancel() {
  open.value = false
}
</script>

<template>
  <Modal v-model:open="open" @cancel="handleCancel">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        编辑部门
      </h3>
    </template>

    <template #content>
      <!-- 只在模态框打开时才渲染表单组件，这样表单组件才会请求数据 -->
      <EditDeptForm
        v-if="open"
        ref="formRef"
        :dept="dept"
      />
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          {{ isSubmitting ? '保存中...' : '确认保存' }}
        </button>
      </div>
    </template>
  </Modal>
</template>
