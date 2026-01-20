<script setup lang="ts">
import type { Dept, Group } from '~/types/management'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import AvatarUpload from '~/components/AvatarUpload.vue'
import { useForm } from '~/composables/useForm'
import { weilaFetch } from '~/shared/instances'

const props = defineProps<{
  group: Group
}>()

const { t } = useI18n()

// 编辑群组的 schema
const editGroupSchema = z.object({
  group_id: z.number(),
  name: z.string().min(1, 'directory.group.validation.nameRequiredEdit'),
  dept_id: z.number().int().min(0, 'directory.group.validation.deptRequired'),
  avatar: z.string().optional().or(z.literal('')),
  burst_mode: z.number().int().min(0).max(1),
})

type EditGroupForm = z.infer<typeof editGroupSchema>

// 获取部门列表
const { data: depts } = useQuery({
  key: ['dept', 'all'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-all-dept', { method: 'POST' }),
})

// 表单数据
const formData = ref<EditGroupForm>({
  group_id: props.group?.id || 0,
  name: props.group?.name || '',
  dept_id: props.group?.dept_id || 0,
  avatar: props.group?.avatar || '',
  burst_mode: props.group?.burst_mode || 0,
})

// 监听 group prop 变化，更新表单数据
watch(() => props.group, (newGroup) => {
  if (newGroup) {
    formData.value = {
      group_id: newGroup.id || 0,
      name: newGroup.name || '',
      dept_id: newGroup.dept_id || 0,
      avatar: newGroup.avatar || '',
      burst_mode: newGroup.burst_mode || 0,
    }
  }
}, { immediate: true, deep: true })

// 表单验证
const { errors, validate } = useForm(editGroupSchema)

// 调用编辑群组 API
const { mutate: editGroup, isLoading, error } = useMutation({
  mutation: (payload: EditGroupForm) => weilaFetch<{ group: Group }>('/corp/group/change-group', {
    method: 'POST',
    body: {
      group_id: payload.group_id,
      name: payload.name,
      avatar: payload.avatar || 'http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg',
      burst_mode: payload.burst_mode,
    },
  }),
  onSuccess: () => {
    // Invalidate group queries on success
    const queryCache = useQueryCache()
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

  await editGroup(formData.value)
}

// 暴露 submit 方法和 isLoading 状态供父组件调用
defineExpose({
  submit,
  isLoading,
})
</script>

<template>
  <div v-if="!group" class="text-center text-gray-500 py-8">
    {{ t('common.status.loading') }}
  </div>

  <form v-else class="space-y-4" @submit.prevent>
    <!-- 群组名称输入框 -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.group.fields.name') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="请输入群组名称"
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
        {{ t('directory.group.fields.department') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
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

    <!-- 头像上传按钮 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.group.fields.avatar') }}
      </label>
      <AvatarUpload v-model="formData.avatar" />
    </div>

    <!-- 对讲模式 -->
    <div>
      <label for="burst_mode" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.group.fields.intercomMode') }}
      </label>
      <select
        id="burst_mode"
        v-model.number="formData.burst_mode"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.burst_mode ? 'border-red-500' : 'border-gray-300'"
        :disabled="isLoading"
      >
        <option :value="0">
          {{ t('directory.group.intercomModes.queue') }}
        </option>
        <option :value="1">
          {{ t('directory.group.intercomModes.free') }}
        </option>
      </select>
      <div v-if="errors.burst_mode" class="mt-1 text-sm text-red-600">
        {{ errors.burst_mode }}
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </form>
</template>
