<script setup lang="ts">
import type { Dept, Group } from '~/types/management'
import { useQuery } from '@pinia/colada'
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import AvatarUpload from '~/components/AvatarUpload.vue'
import { useForm } from '~/composables/useForm'
import { useWeilaFetch } from '~/composables/useWeilaFetch'
import { weilaFetch } from '~/shared/instances'

const props = defineProps<{
  group: Group
}>()

// 编辑群组的 schema
const editGroupSchema = z.object({
  group_id: z.number(),
  name: z.string().min(1, '群组名称不能为空'),
  dept_id: z.number().int().min(0, '请选择部门'),
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
const { error, isFetching, isFinished, data, execute: editGroup } = useWeilaFetch<{ group: Group }>('/corp/group/change-group', {
  immediate: false,
}).post(() => ({
  group_id: formData.value.group_id,
  name: formData.value.name,
  avatar: formData.value.avatar || 'http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100011/a/0e9763d6.jpg',
  burst_mode: formData.value.burst_mode,
})).json()

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
    throw new Error(Object.values(errors.value)?.[0] || '表单验证失败')
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
    editGroup()
  })
}

// 暴露 submit 方法和 isFetching 状态供父组件调用
defineExpose({
  submit,
  isFetching,
})
</script>

<template>
  <div v-if="!group" class="text-center text-gray-500 py-8">
    加载中...
  </div>

  <form v-else class="space-y-4" @submit.prevent>
    <!-- 群组名称输入框 -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        群组名称 <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        placeholder="请输入群组名称"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.name ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
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

    <!-- 头像上传按钮 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        头像
      </label>
      <AvatarUpload v-model="formData.avatar" />
    </div>

    <!-- 对讲模式 -->
    <div>
      <label for="burst_mode" class="block text-sm font-medium text-gray-700 mb-1">
        对讲模式
      </label>
      <select
        id="burst_mode"
        v-model.number="formData.burst_mode"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.burst_mode ? 'border-red-500' : 'border-gray-300'"
        :disabled="isFetching"
      >
        <option :value="0">
          排麦
        </option>
        <option :value="1">
          抢麦
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
