<script setup lang="ts">
import type { AddMemberForm } from '~/composables/useGenMember'
import type { Dept, Member } from '~/types/management'
import { Icon } from '@iconify/vue'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import md5 from 'md5'
import { computed, ref } from 'vue'
import { useForm } from '~/composables/useForm'
import { addMemberSchema, useGenerateMember } from '~/composables/useGenMember'
import { useToast } from '~/composables/useToast'
import { weilaFetch } from '~/shared/instances'

const { showToast } = useToast()
const { hasQuickSupport } = useVip()
const { t } = useI18n()

const { data: depts } = useQuery({
  key: ['dept', 'all'],
  query: () => weilaFetch<Dept[]>('/corp/address/get-all-dept', { method: 'POST' }),
})

const form = ref<AddMemberForm>({
  name: '',
  job_num: '',
  dept_id: 0,
  sex: 0,
  avatar: '',
  phone: '',
  is_dept_admin: 0,
  loc_share: 0,
  track: 0,
  password: '',
})

const { errors, validate } = useForm(addMemberSchema)

const {
  isParsing: isGenerating,
  error: aiError,
  generate,
} = useGenerateMember(form)

const { mutateAsync: createMember, error } = useMutation({
  mutation: (payload: AddMemberForm) => weilaFetch<{ member: Member }>('/corp/address/create-member', {
    method: 'POST',
    body: {
      name: payload.name,
      job_num: payload.job_num || '',
      dept_id: payload.dept_id,
      sex: payload.sex,
      avatar: payload.avatar || 'http://weilacorp.oss-cn-shenzhen.aliyuncs.com/default/user.png',
      phone: payload.phone || '',
      is_dept_admin: payload.is_dept_admin,
      loc_share: payload.loc_share,
      track: payload.track,
      password: md5(payload.password),
    },
  }),
  onSuccess: () => {
    const queryCache = useQueryCache()
    queryCache.invalidateQueries({ key: ['member', 'list'] })
    queryCache.invalidateQueries({ key: ['dept'] })
  },
})

const errorMessage = computed(() => {
  return error.value?.message || ''
})

async function handleQuickGenerate() {
  const parsed = await generate('我需要一个密码为 123456 的成员')
  if (parsed) {
    showToast(t('directory.member.ai.formFilled'))
  }
  else if (aiError.value) {
    showToast(aiError.value)
  }
}

async function submit(): Promise<false | { member: Member }> {
  if (!validate(form.value)) {
    throw new Error(Object.values(errors.value)?.[0] || t('directory.member.validationFailed'))
  }

  try {
    const result = await createMember(form.value)

    if (error.value) {
      showToast(error.value.message || t('directory.member.createFailed'))
      return false
    }

    if (result) {
      showToast(t('directory.member.createSuccess'))
      return result
    }

    return false
  }
  catch (err) {
    console.error('成员创建失败:', err)
    showToast(t('directory.member.createFailed'))
    return false
  }
}

function reset() {
  form.value = {
    name: '',
    job_num: '',
    dept_id: 0,
    sex: 0,
    avatar: '',
    phone: '',
    is_dept_admin: 0,
    loc_share: 0,
    track: 0,
    password: '',
  }
}

defineExpose({
  submit,
  reset,
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-base font-semibold text-gray-900">
        {{ t('directory.member.form.sectionInfo') }}
      </h3>
      <button
        v-if="false"
        type="button"
        class="inline-flex items-center space-x-2 rounded-full bg-blue-600 text-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="isGenerating"
        @click="handleQuickGenerate"
      >
        <Icon icon="lucide:sparkles" class="w-4 h-4" />
        <span>{{ isGenerating ? t('directory.member.ai.generating') : t('directory.member.ai.generateBatch') }}</span>
      </button>
    </div>
    <div v-if="aiError" class="text-sm text-red-500">
      {{ aiError }}
    </div>

    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.name') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        :placeholder="t('common.placeholders.input') + t('directory.member.fields.name')"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.name ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name }}
      </div>
    </div>

    <div>
      <label for="job_num" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.employeeId') }}
      </label>
      <input
        id="job_num"
        v-model="form.job_num"
        type="text"
        :placeholder="`${t('common.placeholders.input') + t('directory.member.fields.employeeId')}（可选）`"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.job_num ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.job_num" class="mt-1 text-sm text-red-600">
        {{ errors.job_num }}
      </div>
    </div>

    <div>
      <label for="dept_id" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.department') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <select
        id="dept_id"
        v-model.number="form.dept_id"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.dept_id ? 'border-red-500' : 'border-gray-300'"
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

    <div>
      <label for="sex" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.gender') }}
      </label>
      <select
        id="sex"
        v-model.number="form.sex"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.sex ? 'border-red-500' : 'border-gray-300'"
      >
        <option :value="0">
          {{ t('directory.member.genderOptions.male') }}
        </option>
        <option :value="1">
          {{ t('directory.member.genderOptions.female') }}
        </option>
      </select>
      <div v-if="errors.sex" class="mt-1 text-sm text-red-600">
        {{ errors.sex }}
      </div>
    </div>

    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.phone') }}
      </label>
      <input
        id="phone"
        v-model="form.phone"
        type="tel"
        :placeholder="`${t('common.placeholders.input') + t('directory.member.fields.phone')}（可选）`"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.phone ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
        {{ errors.phone }}
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.avatar') }}
      </label>
      <AvatarUpload v-model="form.avatar" />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('auth.fields.password') }} <span class="text-red-500">{{ t('common.validation.requiredMark') }}</span>
      </label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        :placeholder="`${t('common.placeholders.input') + t('auth.fields.password')}（至少6位）`"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.password ? 'border-red-500' : 'border-gray-300'"
      >
      <div v-if="errors.password" class="mt-1 text-sm text-red-600">
        {{ errors.password }}
      </div>
    </div>

    <div>
      <label for="is_dept_admin" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.isDeptAdmin') }}
      </label>
      <select
        id="is_dept_admin"
        v-model.number="form.is_dept_admin"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.is_dept_admin ? 'border-red-500' : 'border-gray-300'"
      >
        <option :value="0">
          {{ t('directory.member.adminOptions.no') }}
        </option>
        <option :value="1">
          {{ t('directory.member.adminOptions.yes') }}
        </option>
      </select>
      <div v-if="errors.is_dept_admin" class="mt-1 text-sm text-red-600">
        {{ errors.is_dept_admin }}
      </div>
    </div>

    <div>
      <label for="loc_share" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.locationShare') }}
      </label>
      <select
        id="loc_share"
        v-model.number="form.loc_share"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.loc_share ? 'border-red-500' : 'border-gray-300'"
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

    <div>
      <label for="track" class="block text-sm font-medium text-gray-700 mb-1">
        {{ t('directory.member.fields.track') }}
      </label>
      <select
        id="track"
        v-model.number="form.track"
        class="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        :class="errors.track ? 'border-red-500' : 'border-gray-300'"
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
          {{ t('directory.member.trackOptions.oneMinute') + (!hasQuickSupport ? t('directory.member.trackOptions.vipRequired') : '') }}
        </option>
      </select>
      <div v-if="errors.track" class="mt-1 text-sm text-red-600">
        {{ errors.track }}
      </div>
    </div>

    <div v-if="errorMessage" class="text-sm text-red-600">
      {{ errorMessage }}
    </div>
  </div>
</template>
