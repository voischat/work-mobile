<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const url = defineModel<string>({ default: '' })

const fileInputRef = ref<HTMLInputElement>()
const isUploading = ref(false)
const imageError = ref(false)
const { showToast } = useToast()
const { t } = useI18n()

const imagePreview = computed(() => url.value || '')

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  if (!file.type.startsWith('image/')) {
    showToast(t('common.messages.selectImageFile'))
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    showToast(t('common.messages.imageSizeLimit'))
    return
  }

  uploadImage(file)
}

async function uploadImage(file: File) {
  const previousUrl = url.value
  isUploading.value = true
  imageError.value = false

  try {
    const formData = new FormData()
    formData.append('file', file)

    const uploadedUrl = await weilaFetch<string>('/common/upload-file', {
      method: 'POST',
      body: formData,
    })

    if (!uploadedUrl)
      throw new Error(t('common.messages.uploadFailed'))

    url.value = uploadedUrl
    showToast(t('common.messages.uploadSuccess'))
  }
  catch (error) {
    console.error('上传失败:', error)
    showToast(error instanceof Error ? error.message : t('common.messages.uploadFailed'))
    url.value = previousUrl
  }
  finally {
    isUploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function handleImageError() {
  imageError.value = true
}

function handleDelete(event: Event) {
  event.stopPropagation()
  url.value = ''
  showToast(t('common.messages.imageDeleted'))
  imageError.value = false
}

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
      class="w-full h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors relative overflow-hidden"
      :disabled="isUploading"
      @click="triggerFileSelect"
    >
      <!-- 上传中 -->
      <div v-if="isUploading" class="absolute left-0 right-0 top-0 bottom-0 flex items-center justify-center bg-gray-100/80">
        <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- 有图片 -->
      <template v-else-if="imagePreview && !imageError">
        <div class="w-full h-full rounded-lg overflow-hidden relative group">
          <img
            :src="imagePreview"
            alt="营业执照预览"
            class="w-full h-full object-contain"
            @error="handleImageError"
          >
          <!-- 删除按钮 -->
          <div
            class="absolute left-0 right-0 top-0 bottom-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            @click.stop="handleDelete"
          >
            <svg
              class="w-8 h-8 text-white"
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

      <!-- 图片加载错误 -->
      <div v-else-if="imageError" class="w-full h-full flex flex-col items-center justify-center text-gray-400">
        <svg
          class="w-12 h-12 mb-2"
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
        <span class="text-sm">{{ t('common.messages.loadFailed') }}</span>
      </div>

      <!-- 无图片 -->
      <div v-else class="flex flex-col items-center justify-center text-gray-400">
        <svg
          class="w-12 h-12 mb-2"
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
        <span class="text-sm">{{ t('organization.uploadLicense') }}</span>
        <span class="text-xs text-gray-400 mt-1">{{ t('organization.uploadLicenseTip') }}</span>
      </div>
    </button>
  </div>
</template>
