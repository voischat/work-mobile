<script setup lang="ts">
import type { Dept, Member } from '~/types/management'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import AvatarUpload from '~/components/AvatarUpload.vue'
import { useForm } from '~/composables/useForm'
import { useWeilaFetch } from '~/composables/useWeilaFetch'

const props = defineProps<{
  member: Member
}>()

// 不再需要 emit，所有逻辑由父组件处理

// 编辑成员的 schema（成员和设备共用，但字段会根据 type 动态显示）
const editMemberSchema = z.object({
  user_id: z.number(),
  name: z.string().min(1, '名称不能为空'),
  job_num: z.string().optional(),
  dept_id: z.number().int().min(0, '请选择部门'),
  sex: z.number().int().min(0).max(2),
  avatar: z.string().optional().or(z.literal('')),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号').optional().or(z.literal('')),
  is_admin: z.number().int().min(0).max(1).optional(),
  loc_share: z.number().int().min(0).max(1),
  track: z.number().int().min(0).max(4),
})

type EditMemberForm = z.infer<typeof editMemberSchema>

// 获取部门列表
const {
  data: depts,
} = useWeilaFetch<Dept[]>('/corp/address/get-all-dept')
  .post()
  .json()

// 表单数据
const formData = ref<EditMemberForm>({
  user_id: props.member?.user_id || 0,
  name: props.member?.name || '',
  job_num: props.member?.job_num || '',
  dept_id: props.member?.dept_id || props.member?.type === 1 ? 0 : 0,
  sex: props.member?.sex || 0,
  avatar: props.member?.avatar || '',
  phone: props.member?.phone || '',
  is_admin: 0,
  loc_share: props.member?.loc_share || 0,
  track: props.member?.track || 0,
})

// 监听 member prop 变化，更新表单数据
watch(() => props.member, (newMember) => {
  if (newMember) {
    formData.value = {
      user_id: newMember.user_id || 0,
      name: newMember.name || '',
      job_num: newMember.job_num || '',
      dept_id: newMember.dept_id || 0,
      sex: newMember.sex || 0,
      avatar: newMember.avatar || '',
      phone: newMember.phone || '',
      is_admin: newMember.is_admin || 0,
      loc_share: newMember.loc_share || 0,
      track: newMember.track || 0,
    }
  }
}, { immediate: true, deep: true })

// 判断是否为设备（type === 1）
const isDevice = computed(() => props.member?.type === 1)

// 表单验证
const { errors, validate } = useForm(editMemberSchema)

// 调用编辑成员 API
const { error, isFetching, isFinished, data, execute: editMember } = useWeilaFetch<{ member: Member }>('/corp/address/change-member', {
  immediate: false,
}).post(() => {
  const payload: any = {
    user_id: formData.value.user_id,
    name: formData.value.name,
    job_num: formData.value.job_num || '',
    dept_id: formData.value.dept_id,
    sex: formData.value.sex || 0,
    avatar: formData.value.avatar || '',
    phone: formData.value.phone || '',
    loc_share: formData.value.loc_share || 0,
    track: formData.value.track || 0,
  }
  // 只有成员（非设备）才需要 is_admin 字段
  if (!isDevice.value) {
    payload.is_admin = formData.value.is_admin || 0
  }
  return payload
}).json()

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 提交方法，返回 Promise
async function submit(): Promise<void> {
  // 如果正在提交中，直接返回
  if (isFetching.value) {
    return Promise.resolve()
  }

  if (!validate(formData.value)) {
    throw new Error('表单验证失败')
  }

  return new Promise((resolve, reject) => {
    // 监听编辑结果
    const stopWatcher = watch([data, isFinished, error], ([result, finished, err]) => {
      if (!finished)
        return

      // 停止监听
      stopWatcher()

      if (err) {
        reject(err)
        return
      }

      if (result !== undefined) {
        resolve()
      }
      else {
        reject(new Error('提交失败'))
      }
    })

    // 执行提交
    editMember()
  })
}

// 暴露 submit 方法和 isFetching 状态供父组件调用
defineExpose({
  submit,
  isFetching,
})
</script>

<template>
  <div v-if="!member" class="text-center text-gray-500 py-8">
    加载中...
  </div>

  <form v-else class="space-y-4" @submit.prevent>
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
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.sex ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
        <option :value="0">
          未知
        </option>
        <option :value="1">
          女
        </option>
        <option :value="2">
          男
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

    <!-- 是否管理员（仅成员显示） -->
    <div v-if="!isDevice">
      <label for="is_admin" class="block text-sm font-medium text-gray-700 mb-1">
        是否管理员
      </label>
      <select
        id="is_admin"
        v-model.number="formData.is_admin"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

    <!-- 设备信息（仅设备显示） -->
    <template v-if="isDevice">
      <!-- 产品型号 -->
      <div>
        <label for="product" class="block text-sm font-medium text-gray-700 mb-1">
          产品型号
        </label>
        <input
          id="product"
          :value="member?.product || ''"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
          readonly
          disabled
        >
      </div>

      <!-- IMEI -->
      <div>
        <label for="imei" class="block text-sm font-medium text-gray-700 mb-1">
          IMEI
        </label>
        <input
          id="imei"
          :value="member?.imei || ''"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
          readonly
          disabled
        >
      </div>

      <!-- 微喇号 -->
      <div>
        <label for="user_num" class="block text-sm font-medium text-gray-700 mb-1">
          微喇号
        </label>
        <input
          id="user_num"
          :value="member?.user_num || ''"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
          readonly
          disabled
        >
      </div>
    </template>

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
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.track ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
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
  </form>
</template>
