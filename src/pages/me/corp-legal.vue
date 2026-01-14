<script setup lang="ts">
import type { LegalInfo, LegalRequest } from '~/types/legal'
import { useMutation, useQuery } from '@pinia/colada'
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
import LicenseUpload from '~/components/LicenseUpload.vue'

const router = useRouter()
const { showToast } = useToast()

// 获取企业认证信息
const {
  data: legalInfo,
  error: legalError,
  isPending: isLoading,
  refetch,
} = useQuery({
  key: ['legal-info'],
  query: () => weilaFetch<LegalInfo>('/corp/legal/get-legal', { method: 'POST' }),
})

// 表单数据
const formData = ref<LegalRequest>({
  name: '',
  identify: '',
  business_license: '',
})

// 监听数据加载，填充表单
watch(() => legalInfo.value, (data) => {
  if (data) {
    formData.value = {
      id: data.id,
      name: data.name,
      identify: data.identify,
      business_license: data.business_license,
    }
  }
}, { immediate: true })

// 计算认证状态
const authStatus = computed(() => {
  if (!legalInfo.value)
    return 'none'
  if (legalInfo.value.state === 8)
    return 'verified'
  if (legalInfo.value.state === 9)
    return 'failed'
  return 'pending'
})

const statusText = computed(() => {
  switch (authStatus.value) {
    case 'verified':
      return '已认证'
    case 'failed':
      return '审核失败'
    case 'pending':
      return '待审核'
    default:
      return '未认证'
  }
})

const statusColor = computed(() => {
  switch (authStatus.value) {
    case 'verified':
      return 'text-green-600 bg-green-50'
    case 'failed':
      return 'text-red-600 bg-red-50'
    case 'pending':
      return 'text-orange-600 bg-orange-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
})

// 提交认证
const isSubmitting = ref(false)

const { mutate: submitLegal } = useMutation({
  mutation: async (data: LegalRequest) => {
    const endpoint = data.id ? '/corp/legal/change-corp-legal' : '/corp/legal/add-corp-legal'
    return weilaFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  onSuccess: () => {
    isSubmitting.value = false
    showToast('提交成功')
    refetch()
  },
  onError: (error) => {
    isSubmitting.value = false
    showToast(error instanceof Error ? error.message : '提交失败，请重试')
  },
})

// 验证统一社会信用代码格式
function validateIdentify(value: string): boolean {
  return /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/.test(value)
}

// 提交表单
function handleSubmit() {
  // 表单验证
  if (!formData.value.name.trim()) {
    showToast('请输入企业名称')
    return
  }

  if (!formData.value.identify.trim()) {
    showToast('请输入统一社会信用代码')
    return
  }

  if (!validateIdentify(formData.value.identify)) {
    showToast('统一社会信用代码格式不正确')
    return
  }

  if (!formData.value.business_license) {
    showToast('请上传营业执照')
    return
  }

  isSubmitting.value = true
  submitLegal(formData.value)
}
</script>

<template>
  <BackLayout title="企业认证">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '我的', route: '/me' },
          { name: '企业认证' },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-2xl mx-auto">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="legalError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>获取认证信息失败: {{ legalError.message }}</p>
          </div>
        </div>

        <!-- 表单 -->
        <div v-else class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <!-- 认证状态 -->
          <div class="flex items-center justify-between pb-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900">
              企业认证信息
            </h2>
            <span class="px-3 py-1 rounded-full text-sm font-medium" :class="[statusColor]">
              {{ statusText }}
            </span>
          </div>

          <!-- 待审核/已认证/审核失败提示 -->
          <div v-if="authStatus === 'pending'" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p class="text-orange-800 text-sm">
              您的企业认证正在审核中，可以继续修改认证信息
            </p>
          </div>

          <div v-if="authStatus === 'verified'" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 text-sm">
              您的企业已通过认证，可以修改认证信息
            </p>
          </div>

          <div v-if="authStatus === 'failed'" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 text-sm">
              您的企业认证审核失败，请修改后重新提交
            </p>
          </div>

          <!-- 企业名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              企业名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="请输入企业名称"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- 统一社会信用代码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              统一社会信用代码 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.identify"
              type="text"
              placeholder="请输入18位统一社会信用代码"
              maxlength="18"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <p class="text-xs text-gray-500 mt-1">
              18位统一社会信用代码，由数字、大写英文字母组成
            </p>
          </div>

          <!-- 营业执照 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              营业执照 <span class="text-red-500">*</span>
            </label>
            <LicenseUpload v-model="formData.business_license" />
          </div>

          <!-- 提交按钮 -->
          <div class="flex space-x-4 pt-4">
            <button
              type="button"
              class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              @click="router.back()"
            >
              取消
            </button>
            <button
              type="button"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              {{ isSubmitting ? '提交中...' : (legalInfo?.id ? '更新认证信息' : '提交认证') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
