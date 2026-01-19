<script setup lang="ts">
import type { Dept, Member } from '~/types/management'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const { showToast } = useToast()
const { hasQuickSupport } = useVip()
const { t } = useI18n()

// 表单验证 schema
const addDeviceSchema = z.object({
  name: z.string().min(1, t('directory.device.validation.nameRequired')),
  dept_id: z.number().int().min(0, t('directory.device.validation.deptRequired')),
  job_num: z.string().optional(),
  verifycode: z.string().min(1, t('directory.device.validation.verifyCodeRequired')),
  phone: z.string().regex(/^1[3-9]\d{9}$/, t('directory.device.validation.phoneInvalid')).optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')),
  loc_share: z.number().int().min(0).max(1),
  track: z.number().int().min(0).max(4),
})

type AddDeviceForm = z.infer<typeof addDeviceSchema>

// 获取部门列表
const { data: depts } = useQuery({
  key: ['dept', 'all'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-all-dept', { method: 'POST' }),
})

// 表单数据
const formData = ref<AddDeviceForm>({
  name: '',
  dept_id: 0,
  job_num: '',
  verifycode: '',
  phone: '',
  avatar: '',
  loc_share: 0,
  track: 0,
})

// 表单验证
const { errors, validate } = useForm(addDeviceSchema)

// 加载状态
const isLoading = ref(false)

// 调用添加设备 API
const { mutateAsync: addDevice, error } = useMutation({
  mutation: (payload: AddDeviceForm) => weilaFetch<{ member: Member }>('/corp/address/add-device', {
    method: 'POST',
    body: {
      name: payload.name,
      dept_id: payload.dept_id,
      job_num: payload.job_num || '',
      verifycode: payload.verifycode,
      phone: payload.phone || '',
      avatar: payload.avatar || 'http://favicon.weila.hk/default/group.png',
      loc_share: payload.loc_share,
      track: payload.track,
    },
  }),
  onSuccess: () => {
    // Invalidate all member-related queries on success (devices are members with type=1)
    const queryCache = useQueryCache()
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 主要提交方法 - 暴露给父组件
async function submit(): Promise<false | { member: Member }> {
  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || t('directory.device.validationFailed'))
  }

  isLoading.value = true

  try {
    const result = await addDevice(formData.value)

    if (error.value) {
      showToast(error.value.message || t('directory.device.addFailed'))
      return false
    }

    if (result) {
      showToast(t('directory.device.addSuccess'))
      return result
    }

    return false
  }
  catch (err) {
    console.error('添加设备失败:', err)
    showToast(t('directory.device.addFailed'))
    return false
  }
  finally {
    isLoading.value = false
  }
}

// 重置表单
function reset() {
  formData.value = {
    name: '',
    dept_id: 0,
    job_num: '',
    verifycode: '',
    phone: '',
    avatar: '',
    loc_share: 0,
    track: 0,
  }
}

// 暴露方法给父组件
defineExpose({
  submit,
  reset,
})
</script>

<template>
  <div class="space-y-4">
    <!-- 名称输入框 -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.name') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        :placeholder="t('directory.device.placeholders.name')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.name ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </div>
    </div>

    <!-- 部门选择 -->
    <div>
      <label for="dept_id" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.department') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <select
        id="dept_id"
        v-model.number="formData.dept_id"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.dept_id ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          {{ t('directory.department.noDepartment') }}
        </option>
        <option
          v-for="dept in depts"
          :key="dept.id"
          :value="dept.id"
        >
          {{ dept.name }}
        </option>
      </select>
      <div v-if="errors.dept_id" class="mt-1 text-sm text-red-600">
        {{ errors.dept_id }}
      </div>
    </div>

    <!-- 工号输入框 -->
    <div>
      <label for="job_num" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.employeeId') }}
      </label>
      <input
        id="job_num"
        v-model="formData.job_num"
        type="text"
        :placeholder="t('directory.device.placeholders.employeeId')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.job_num ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
      <div v-if="errors.job_num" class="mt-1 text-sm text-red-600">
        {{ errors.job_num }}
      </div>
    </div>

    <!-- 验证码输入框 -->
    <div>
      <label for="verifycode" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.verifyCode') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <input
        id="verifycode"
        v-model="formData.verifycode"
        type="text"
        :placeholder="t('directory.device.placeholders.verifyCode')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.verifycode ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
      <div v-if="errors.verifycode" class="mt-1 text-sm text-red-600">
        {{ errors.verifycode }}
      </div>
    </div>

    <!-- 电话号码输入框 -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.phone') }}
      </label>
      <input
        id="phone"
        v-model="formData.phone"
        type="tel"
        :placeholder="t('directory.device.placeholders.phone')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
      <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
        {{ errors.phone }}
      </div>
    </div>

    <!-- 头像上传按钮 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.avatar') }}
      </label>
      <AvatarUpload v-model="formData.avatar" :disabled="isLoading" />
    </div>

    <!-- 位置共享 -->
    <div>
      <label for="loc_share" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.locationShare') }}
      </label>
      <select
        id="loc_share"
        v-model.number="formData.loc_share"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.loc_share ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          {{ t('directory.member.locationShareOptions.off') }}
        </option>
        <option :value="1">
          {{ t('directory.member.locationShareOptions.on') }}
        </option>
      </select>
      <div v-if="errors.loc_share" class="mt-1 text-sm text-red-600">
        {{ errors.loc_share }}
      </div>
    </div>

    <!-- 轨迹 -->
    <div>
      <label for="track" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.device.fields.track') }}
      </label>
      <select
        id="track"
        v-model.number="formData.track"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.track ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          {{ t('directory.member.trackOptions.off') }}
        </option>
        <option :value="1">
          {{ t('directory.member.trackOptions.oneHour') }}
        </option>
        <option :value="2">
          {{ t('directory.member.trackOptions.fifteenMinutes') }}
        </option>
        <option :value="3">
          {{ t('directory.member.trackOptions.fiveMinutes') }}
        </option>
        <option :value="4" :disabled="!hasQuickSupport">
          {{ t('directory.member.trackOptions.oneMinute') }}{{ !hasQuickSupport ? t('directory.member.trackOptions.vipRequired') : '' }}
        </option>
      </select>
      <div v-if="errors.track" class="mt-1 text-sm text-red-600">
        {{ errors.track }}
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>
