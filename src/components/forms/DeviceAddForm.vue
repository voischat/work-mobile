<script setup lang="ts">
import type { Dept, Member } from '~/types/management'
import { computed, ref } from 'vue'
import { z } from 'zod'
import AvatarUpload from '~/components/AvatarUpload.vue'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const { showToast } = useToast()

// 表单验证 schema
const addDeviceSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  dept_id: z.number().int().min(0, '请选择部门'),
  job_num: z.string().optional(),
  verifycode: z.string().min(1, '验证码不能为空'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号').optional().or(z.literal('')),
  sex: z.number().int().min(1).max(2),
  avatar: z.string().optional().or(z.literal('')),
  loc_share: z.number().int().min(0).max(1),
  track: z.number().int().min(0).max(4),
})

type AddDeviceForm = z.infer<typeof addDeviceSchema>

// 获取部门列表
const {
  data: depts,
} = useWeilaFetch<Dept[]>('/corp/address/get-all-dept')
  .post()
  .json()

// 表单数据
const formData = ref<AddDeviceForm>({
  name: '',
  dept_id: 0,
  job_num: '',
  verifycode: '',
  phone: '',
  sex: 2, // 默认为男
  avatar: '',
  loc_share: 0,
  track: 0,
})

// 表单验证
const { errors, validate } = useForm(addDeviceSchema)

// 加载状态
const isLoading = ref(false)

// 调用添加设备 API
const { error, data, execute: addDevice } = useWeilaFetch<{ member: Member }>('/corp/address/add-device', {
  immediate: false,
}).post(() => ({
  name: formData.value.name,
  dept_id: formData.value.dept_id,
  job_num: formData.value.job_num || '',
  verifycode: formData.value.verifycode,
  phone: formData.value.phone || '',
  sex: formData.value.sex,
  avatar: formData.value.avatar || 'http://favicon.weila.hk/default/group.png',
  loc_share: formData.value.loc_share,
  track: formData.value.track,
})).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 主要提交方法 - 暴露给父组件
async function submit(): Promise<false | { member: Member }> {
  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || '表单验证失败')
  }

  isLoading.value = true

  try {
    await addDevice()

    if (error.value) {
      showToast(error.value.message || '设备添加失败')
      return false
    }

    if (data.value) {
      showToast('设备添加成功')
      return data.value
    }

    return false
  }
  catch (err) {
    console.error('添加设备失败:', err)
    showToast('设备添加失败')
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
    sex: 2,
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
        名称 <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="请输入名称"
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
        部门 <span class="text-red-500">*</span>
      </label>
      <select
        id="dept_id"
        v-model.number="formData.dept_id"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.dept_id ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          无部门
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
        工号
      </label>
      <input
        id="job_num"
        v-model="formData.job_num"
        type="text"
        placeholder="请输入工号（可选）"
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
        验证码 <span class="text-red-500">*</span>
      </label>
      <input
        id="verifycode"
        v-model="formData.verifycode"
        type="text"
        placeholder="请输入验证码"
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
        电话号码
      </label>
      <input
        id="phone"
        v-model="formData.phone"
        type="tel"
        placeholder="请输入电话号码（可选）"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
      <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
        {{ errors.phone }}
      </div>
    </div>

    <!-- 性别选择 -->
    <div>
      <label for="sex" class="block text-sm font-medium text-gray-700 mb-1">
        性别
      </label>
      <select
        id="sex"
        v-model.number="formData.sex"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.sex ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="2">
          男
        </option>
        <option :value="1">
          女
        </option>
      </select>
      <div v-if="errors.sex" class="mt-1 text-sm text-red-600">
        {{ errors.sex }}
      </div>
    </div>

    <!-- 头像上传按钮 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        头像
      </label>
      <AvatarUpload v-model="formData.avatar" :disabled="isLoading" />
    </div>

    <!-- 位置共享 -->
    <div>
      <label for="loc_share" class="block text-sm font-medium text-gray-700 mb-1">
        位置共享
      </label>
      <select
        id="loc_share"
        v-model.number="formData.loc_share"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.loc_share ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          关闭
        </option>
        <option :value="1">
          开启
        </option>
      </select>
      <div v-if="errors.loc_share" class="mt-1 text-sm text-red-600">
        {{ errors.loc_share }}
      </div>
    </div>

    <!-- 轨迹 -->
    <div>
      <label for="track" class="block text-sm font-medium text-gray-700 mb-1">
        轨迹
      </label>
      <select
        id="track"
        v-model.number="formData.track"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.track ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          关闭
        </option>
        <option :value="1">
          低频
        </option>
        <option :value="2">
          中频
        </option>
        <option :value="3">
          高频
        </option>
        <option :value="4">
          快速
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
