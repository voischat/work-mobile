<script setup lang="ts">
import type { Dept, Member } from '~/types/management'
import md5 from 'md5'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import AvatarUpload from '~/components/AvatarUpload.vue'
import BackLayout from '~/components/BackLayout.vue'
import { useForm } from '~/composables/useForm'
import { useToast } from '~/composables/useToast'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

// 表单验证 schema
const addMemberSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  job_num: z.string().optional(),
  dept_id: z.number().int().min(0, '请选择部门'),
  sex: z.number().int().min(1).max(2),
  avatar: z.string().optional().or(z.literal('')),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号').optional().or(z.literal('')),
  is_admin: z.number().int().min(0).max(1),
  loc_share: z.number().int().min(0).max(1),
  track: z.number().int().min(0).max(4),
  password: z.string().min(6, '密码至少6位'),
})

type AddMemberForm = z.infer<typeof addMemberSchema>

const router = useRouter()
const { showToast } = useToast()

// 获取部门列表
const {
  data: depts,
} = useWeilaFetch<Dept[]>('/corp/address/get-all-dept')
  .post()
  .json()

// 表单数据
const formData = ref<AddMemberForm>({
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

// 调用创建成员 API
const { error, isFetching, isFinished, data, execute: createMember } = useWeilaFetch<{ member: Member }>('/corp/address/create-member', {
  immediate: false,
}).post(() => ({
  name: formData.value.name,
  job_num: formData.value.job_num || '',
  dept_id: formData.value.dept_id,
  sex: formData.value.sex,
  avatar: formData.value.avatar || 'http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png',
  phone: formData.value.phone || '',
  is_admin: formData.value.is_admin,
  loc_share: formData.value.loc_share,
  track: formData.value.track,
  password: md5(formData.value.password),
})).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 监听创建成员成功
watch([data, isFinished, error], ([result, finished, err]) => {
  if (!finished)
    return
  if (err)
    return
  if (result !== undefined) {
    showToast('成员创建成功')
    router.back()
  }
})

function handleSubmit() {
  if (!validate(formData.value)) {
    return
  }
  createMember()
}
</script>

<template>
  <BackLayout title="创建成员">
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <form class="space-y-4" @submit.prevent="handleSubmit">
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
                :disabled="isFetching"
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
                v-model="formData.job_num"
                type="text"
                placeholder="请输入工号（可选）"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.job_num ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
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
                v-model.number="formData.dept_id"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.dept_id ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
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
                v-model.number="formData.sex"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.sex ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
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
                v-model="formData.phone"
                type="tel"
                placeholder="请输入手机号（可选）"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
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
              <AvatarUpload v-model="formData.avatar" />
            </div>

            <!-- 密码输入框 -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                密码 <span class="text-red-500">*</span>
              </label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                placeholder="请输入密码（至少6位）"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.password ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
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
                v-model.number="formData.is_admin"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.is_admin ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
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
                v-model.number="formData.loc_share"
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.loc_share ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
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
                class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="errors.track ? 'border-red-500' : 'border-gray-300'"
                :disabled="isFetching"
              >
                <option :value="0">
                  关闭
                </option>
                <option :value="1">
                  高
                </option>
                <option :value="2">
                  中
                </option>
                <option :value="3">
                  低
                </option>
                <option :value="4">
                  快
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

            <!-- 按钮组 -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isFetching"
                @click="router.back()"
              >
                取消
              </button>
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :disabled="isFetching"
              >
                {{ isFetching ? '创建中...' : '确认创建' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </BackLayout>
</template>
