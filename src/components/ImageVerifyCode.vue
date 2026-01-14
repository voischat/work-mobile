<script setup lang="ts">
import type { ImageVerifyCodeResponse } from '~/types/auth'
import { useQuery } from '@pinia/colada'

interface Props {
  width?: number
  height?: number
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: 120,
  height: 60,
  disabled: false,
  error: false,
})

// 使用 defineModel 来双向绑定验证码答案
const imageVerifyAnswer = defineModel<string>({ default: '' })

// 图形验证码相关状态
const imageVerifyCode = ref<string>('')
const verifyId = ref<string>('')
const { showToast } = useToast()

// 构建 query key (响应式)
const queryKey = computed(() => ['verifycode', 'image', props.width, props.height])

// 获取图形验证码（立即执行）
const { data: imageVerifyCodeData, refetch: fetchImageVerifyCode } = useQuery({
  key: queryKey,
  query: () => weilaFetch<ImageVerifyCodeResponse>(
    `/common/get-image-verifycode?width=${props.width}&height=${props.height}`,
    { method: 'GET' },
  ),
  staleTime: 0, // 验证码总是过期，每次都重新获取
})

// 监听图形验证码数据
watch(imageVerifyCodeData, (data) => {
  if (data) {
    imageVerifyCode.value = data.image
    verifyId.value = data.id
    imageVerifyAnswer.value = '' // 清空之前的答案
  }
}, { immediate: true })

// 获取图形验证码函数
async function loadImageVerifyCode() {
  try {
    await fetchImageVerifyCode()
  }
  catch (err) {
    console.error('获取图形验证码失败:', err)
    showToast('获取图形验证码失败，请重试')
  }
}

// 暴露验证码ID和刷新方法
defineExpose({
  get verifyId() {
    return verifyId.value
  },
  refresh: loadImageVerifyCode,
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <div
      class="flex-shrink-0 border border-gray-300 rounded-md transition-colors overflow-hidden"
      :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-500'"
      :style="{ width: `${props.width}px`, height: `${props.height}px` }"
      @click="!disabled && loadImageVerifyCode()"
    >
      <img
        v-if="imageVerifyCode"
        :src="imageVerifyCode"
        alt="图形验证码"
        class="w-full h-full object-contain"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs"
      >
        加载中...
      </div>
    </div>
    <input
      v-model="imageVerifyAnswer"
      type="text"
      placeholder="请输入验证码"
      class="flex-1 min-w-0 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      :class="error ? 'border-red-500' : 'border-gray-300'"
      :disabled="disabled"
    >
  </div>
</template>
