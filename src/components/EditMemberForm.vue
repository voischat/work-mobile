<script setup lang="ts">
import type { Dept, Member } from '~/types/management'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import AvatarUpload from '~/components/AvatarUpload.vue'
import { useForm } from '~/composables/useForm'
import { weilaFetch } from '~/shared/instances'

const props = defineProps<{
  member: Member
}>()

const { hasQuickSupport } = useVip()

// 编辑成员的 schema（成员和设备共用，但字段会根据 type 动态显示）
const editMemberSchema = z.object({
  user_id: z.number(),
  name: z.string().min(1, '名称不能为空'),
  job_num: z.string().optional(),
  dept_id: z.number().int().min(0, '请选择部门'),
  sex: z.number().int().min(0).max(2),
  avatar: z.string().optional().or(z.literal('')),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号').optional().or(z.literal('')),
  is_dept_admin: z.number().int().min(0).max(1).optional(),
  loc_share: z.number().int().min(0).max(1),
  track: z.number().int().min(0).max(4),
})

type EditMemberForm = z.infer<typeof editMemberSchema>

// 获取部门列表
const { data: depts } = useQuery({
  key: ['dept', 'all'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-all-dept', { method: 'POST' }),
})

// 表单数据
const formData = ref<EditMemberForm>({
  user_id: props.member?.user_id || 0,
  name: props.member?.name || '',
  job_num: props.member?.job_num || '',
  dept_id: props.member?.dept_id || 0,
  sex: props.member?.sex || 0,
  avatar: props.member?.avatar || '',
  phone: props.member?.phone || '',
  is_dept_admin: props.member?.is_dept_admin || 0,
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
      is_dept_admin: newMember.is_dept_admin || 0,
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
const { mutate: editMember, isLoading, error } = useMutation({
  mutation: (payload: EditMemberForm) => weilaFetch<{ member: Member }>('/corp/address/change-member', {
    method: 'POST',
    body: payload,
  }),
  onMutate(payload) {
    const queryCache = useQueryCache()

    // Helper function to update member in a list
    const updateMemberInList = (list: any[] | undefined) => {
      if (!list)
        return list
      return list.map(item =>
        item.user_id === payload.user_id
          ? { ...item, ...payload }
          : item,
      )
    }

    // Get all query entries and update them optimistically
    const entries = queryCache.getEntries()
    const oldData: Record<string, any> = {}

    entries.forEach((entry) => {
      const key = entry.key
      // Match member list queries: ['member', 'list', ...]
      if (Array.isArray(key) && key[0] === 'member' && key[1] === 'list') {
        const data = queryCache.getQueryData<{ members: Member[], count: number }>(key)
        if (data?.members) {
          oldData[JSON.stringify(key)] = data
          queryCache.setQueryData(key, {
            ...data,
            members: updateMemberInList(data.members),
          })
        }
      }
      // Match dept member queries: ['dept', deptId, 'members', 'list', ...]
      else if (Array.isArray(key) && key[0] === 'dept' && key[2] === 'members') {
        const data = queryCache.getQueryData<{ members: Member[], count: number }>(key)
        if (data?.members) {
          oldData[JSON.stringify(key)] = data
          queryCache.setQueryData(key, {
            ...data,
            members: updateMemberInList(data.members),
          })
        }
      }
      // Match group member queries: ['group', groupId, 'members', 'list', ...]
      else if (Array.isArray(key) && key[0] === 'group' && key[2] === 'members') {
        const data = queryCache.getQueryData<{ members: Member[], count: number }>(key)
        if (data?.members) {
          oldData[JSON.stringify(key)] = data
          queryCache.setQueryData(key, {
            ...data,
            members: updateMemberInList(data.members),
          })
        }
      }
    })

    // Cancel queries to prevent them from overwriting our optimistic update
    queryCache.cancelQueries({ key: ['member', 'list'] })
    queryCache.cancelQueries({ key: ['dept'] })
    queryCache.cancelQueries({ key: ['group'] })

    return { oldData }
  },
  onSuccess(response, payload) {
    const queryCache = useQueryCache()
    const serverMember = response.member

    // Helper function to update member with server data
    const updateMemberWithServerData = (list: any[] | undefined) => {
      if (!list)
        return list
      return list.map(item =>
        item.user_id === payload.user_id
          ? { ...item, ...serverMember }
          : item,
      )
    }

    // Update all affected queries with server response
    const entries = queryCache.getEntries()
    entries.forEach((entry) => {
      const key = entry.key
      if (Array.isArray(key)
        && ((key[0] === 'member' && key[1] === 'list')
          || (key[0] === 'dept' && key[2] === 'members')
          || (key[0] === 'group' && key[2] === 'members'))) {
        const data = queryCache.getQueryData<{ members: Member[], count: number }>(key)
        if (data?.members) {
          queryCache.setQueryData(key, {
            ...data,
            members: updateMemberWithServerData(data.members),
          })
        }
      }
    })

    // Invalidate to refetch in background
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
    queryCache.invalidateQueries({ key: ['group'] })
  },
  onError(_error, _payload, context) {
    const queryCache = useQueryCache()

    // Rollback optimistic updates
    if (context?.oldData) {
      Object.entries(context.oldData).forEach(([keyStr, data]) => {
        const key = JSON.parse(keyStr)
        // Check if the current data is still our optimistic update before rolling back
        const currentData = queryCache.getQueryData(key)
        if (currentData) {
          queryCache.setQueryData(key, data)
        }
      })
    }
  },
  onSettled() {
    const queryCache = useQueryCache()
    // Ensure queries are invalidated even if onSuccess/onError didn't run
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
    queryCache.invalidateQueries({ key: ['group'] })
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

// 提交方法，返回 Promise
async function submit(): Promise<void> {
  if (!validate(formData.value)) {
    throw new Error(Object.values(errors.value)?.[0] || '表单验证失败')
  }

  await editMember(formData.value)
}

// 暴露 submit 方法和 isLoading 状态供父组件调用
defineExpose({
  submit,
  isLoading,
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
        :disabled="isLoading"
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </div>
    </div>

    <!-- 微喇号（只读） -->
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
        :disabled="isLoading"
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

    <!-- 是否部门管理员（仅成员显示） -->
    <div v-if="!isDevice">
      <label for="is_dept_admin" class="block text-sm font-medium text-gray-700 mb-1">
        是否部门管理员
      </label>
      <select
        id="is_dept_admin"
        v-model.number="formData.is_dept_admin"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.is_dept_admin ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          否
        </option>
        <option :value="1">
          是
        </option>
      </select>
      <div v-if="errors.is_dept_admin" class="mt-1 text-sm text-red-600">
        {{ errors.is_dept_admin }}
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
          1 小时
        </option>
        <option :value="2">
          15 分钟
        </option>
        <option :value="3">
          5 分钟
        </option>
        <option :value="4" :disabled="!hasQuickSupport">
          1 分钟{{ !hasQuickSupport ? ' (需要 VIP)' : '' }}
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
