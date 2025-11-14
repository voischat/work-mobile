<script setup lang="ts">
import { getRootUrl } from '@kvoon/utils'
import { computed, ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { generateV2Query } from '~/composables/useWeilaFetch'

const url = defineModel<string>({ default: '' })

const fileInputRef = ref<HTMLInputElement>()
const isUploading = ref(false)
const imageError = ref(false)
const { showToast } = useToast()

// 头像预览URL（用于显示预览，实际提交时使用 url）
const avatarPreview = computed(() => url.value || '')

// 处理文件选择
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件')
    return
  }

  // 验证文件大小（例如：5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    showToast('图片大小不能超过 5MB')
    return
  }

  uploadAvatar(file)
}

// 上传头像
async function uploadAvatar(file: File) {
  // 保存上传前的 URL，用于上传失败时恢复
  const previousUrl = url.value
  isUploading.value = true
  imageError.value = false

  try {
    const formData = new FormData()
    formData.append('file', file)

    // 使用 fetch 直接发送 FormData
    const queryParams = generateV2Query()
    const baseUrl = `${getRootUrl(window.location.href)}/v2`
    const urlObj = new URL(`${baseUrl}/common/upload-file`)
    Object.entries(queryParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value)
    })

    const response = await fetch(urlObj.toString(), {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (result.errcode === 0 && result.data?.url) {
      url.value = result.data.url
      showToast('上传成功')
    }
    else {
      throw new Error(result.errmsg || '上传失败')
    }
  }
  catch (error) {
    console.error('上传失败:', error)
    showToast(error instanceof Error ? error.message : '上传失败，请重试')
    // 上传失败时恢复之前的 URL
    url.value = previousUrl
  }
  finally {
    isUploading.value = false
    // 清空文件输入，以便可以重复选择同一文件
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

// 处理图片加载错误
function handleImageError() {
  imageError.value = true
}

// 删除头像（设置为空字符串）
function handleDelete(event: Event) {
  event.stopPropagation()
  url.value = ''
  showToast('已删除头像')
  imageError.value = false
}

// 触发文件选择
function triggerFileSelect() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div class="relative">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    >
    <button
      type="button"
      class="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors relative overflow-hidden"
      :disabled="isUploading"
      @click="triggerFileSelect"
    >
      <!-- 上传中状态 -->
      <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center bg-gray-100/80">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- 有图片且未上传中 -->
      <template v-else-if="avatarPreview && !imageError">
        <div class="w-full h-full rounded-lg overflow-hidden relative group">
          <img
            :src="avatarPreview"
            alt="头像预览"
            class="w-full h-full object-cover"
            @error="handleImageError"
          >
          <!-- 删除按钮（悬停时显示） -->
          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            @click.stop="handleDelete"
          >
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </div>
      </template>

      <!-- 图片加载错误占位 -->
      <div v-else-if="imageError" class="w-full h-full flex flex-col items-center justify-center text-gray-400">
        <svg
          class="w-8 h-8 mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span class="text-xs">加载失败</span>
      </div>

      <!-- 无图片占位 -->
      <div v-else class="text-3xl text-gray-400">
        +
      </div>
    </button>
  </div>
</template>
