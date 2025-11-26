<script setup lang="ts">
import type { AddMemberForm } from '~/composables/useGenMember'
import type { Dept, Member } from '~/types/management'
import md5 from 'md5'
import { computed, ref } from 'vue'
import { useForm } from '~/composables/useForm'
import { addMemberSchema, useGenerateMember } from '~/composables/useGenMember'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const { showToast } = useToast()

// 获取部门列表
const {
  data: depts,
} = useWeilaFetch<Dept[]>('/corp/address/get-all-dept')
  .post()
  .json()

const form = ref<AddMemberForm>({
  name: '',
  job_num: '',
  dept_id: 0,
  sex: 2, // 默认为男
  avatar: '',
  phone: '',
  is_admin: 0,
  loc_share: 0,
  track: 0,
  password: '',
})

// 表单验证
const { errors, validate } = useForm(addMemberSchema)

// AI 生成功能
const {
  isParsing: isGenerating,
  error: aiError,
  generate,
} = useGenerateMember(form)

// 调用创建成员 API
const { error, data, execute: createMember } = useWeilaFetch<{ member: Member }>('/corp/address/create-member', {
  immediate: false,
}).post(() => ({
  name: form.value.name,
  job_num: form.value.job_num || '',
  dept_id: form.value.dept_id,
  sex: form.value.sex,
  avatar: form.value.avatar || 'http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png',
  phone: form.value.phone || '',
  is_admin: form.value.is_admin,
  loc_share: form.value.loc_share,
  track: form.value.track,
  password: md5(form.value.password),
})).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 一键生成功能
async function handleQuickGenerate() {
  const parsed = await generate('我需要一个密码为 123456 的成员')
  if (parsed) {
    showToast('已填充表单')
  }
  else if (aiError.value) {
    showToast(aiError.value)
  }
}

// 主要提交方法 - 暴露给父组件
async function submit(): Promise<false | { member: Member }> {
  if (!validate(form.value)) {
    return false
  }

  try {
    await createMember()

    if (error.value) {
      showToast(error.value.message || '成员创建失败')
      return false
    }

    if (data.value) {
      showToast('成员创建成功')
      return data.value
    }

    return false
  }
  catch (err) {
    console.error('成员创建失败:', err)
    showToast('成员创建失败')
    return false
  }
}

// 重置表单
function reset() {
  form.value = {
    name: '',
    job_num: '',
    dept_id: 0,
    sex: 2,
    avatar: '',
    phone: '',
    is_admin: 0,
    loc_share: 0,
    track: 0,
    password: '',
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
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-base font-semibold text-gray-900">
        成员信息
      </h3>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="isGenerating"
        @click="handleQuickGenerate"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4-4m0 0l4-4m-4 4l-4-4m4 4l4 4m6 2l-1.5 3.5m-2-7L16 21m4-10l-3.5 1.5" />
        </svg>
        <span>{{ isGenerating ? '生成中...' : '一键生成' }}</span>
      </button>
    </div>
    <div v-if="aiError" class="text-sm text-red-500">
      {{ aiError }}
    </div>

    <!-- 名称输入框 -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        名称 <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        placeholder="请输入名称"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.name ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </div>
    </div>

    <!-- 工号输入框 -->
    <div>
      <label for="job_num" class="block text-sm font-medium text-gray-700 mb-1">
        工号
      </label>
      <input
        id="job_num"
        v-model="form.job_num"
        type="text"
        placeholder="请输入工号（可选）"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.job_num ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.job_num" class="mt-1 text-sm text-red-600">
        {{ errors.job_num }}
      </div>
    </div>

    <!-- 部门选择 -->
    <div>
      <label for="dept_id" class="block text-sm font-medium text-gray-700 mb-1">
        所属部门 <span class="text-red-500">*</span>
      </label>
      <select
        id="dept_id"
        v-model.number="form.dept_id"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.dept_id ? 'border-red-500' : 'border-gray-300'"
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

    <!-- 性别选择 -->
    <div>
      <label for="sex" class="block text-sm font-medium text-gray-700 mb-1">
        性别
      </label>
      <select
        id="sex"
        v-model.number="form.sex"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.sex ? 'border-red-500' : 'border-gray-300'"
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

    <!-- 手机号输入框 -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
        手机号
      </label>
      <input
        id="phone"
        v-model="form.phone"
        type="tel"
        placeholder="请输入手机号（可选）"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
        {{ errors.phone }}
      </div>
    </div>

    <!-- 头像上传按钮 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        头像
      </label>
      <AvatarUpload v-model="form.avatar" />
    </div>

    <!-- 密码输入框 -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        密码 <span class="text-red-500">*</span>
      </label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        placeholder="请输入密码（至少6位）"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.password ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.password" class="mt-1 text-sm text-red-600">
        {{ errors.password }}
      </div>
    </div>

    <!-- 是否管理员 -->
    <div>
      <label for="is_admin" class="block text-sm font-medium text-gray-700 mb-1">
        是否管理员
      </label>
      <select
        id="is_admin"
        v-model.number="form.is_admin"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.is_admin ? 'border-red-500' : 'border-gray-300'"
      >
        <option :value="0">
          否
        </option>
        <option :value="1">
          是
        </option>
      </select>
      <div v-if="errors.is_admin" class="mt-1 text-sm text-red-600">
        {{ errors.is_admin }}
      </div>
    </div>

    <!-- 位置共享 -->
    <div>
      <label for="loc_share" class="block text-sm font-medium text-gray-700 mb-1">
        位置共享
      </label>
      <select
        id="loc_share"
        v-model.number="form.loc_share"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.loc_share ? 'border-red-500' : 'border-gray-300'"
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
        v-model.number="form.track"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.track ? 'border-red-500' : 'border-gray-300'"
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
