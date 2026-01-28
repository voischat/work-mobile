<script setup lang="ts">
import type { UserInfo } from '~/types/auth'
import { useQuery } from '@pinia/colada'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import pkg from '~/../package.json'
import Avatar from '~/components/Avatar.vue'
import HomeLayout from '~/components/HomeLayout.vue'
import { useAuth } from '~/composables/useAuth'
import { useModal } from '~/composables/useModal'
import { weilaFetch } from '~/shared/instances'

const router = useRouter()
const { clearAuth } = useAuth()
const { t, locale } = useI18n()
const { isEnabled } = useFeatureFlags()
const {
  data: userInfo,
  error: userError,
  isPending: isUserFetching,
} = useQuery({
  key: ['user', 'selfinfo'],
  query: () => weilaFetch<UserInfo>('/corp/user/get-selfinfo', { method: 'POST' }),
})

// 计算属性
const isLoading = computed(() => isUserFetching.value)
const hasError = computed(() => !!userError.value)

const { showModal } = useModal()

function handleLogout() {
  showModal({
    title: t('me.logout.title'),
    message: t('me.logout.message'),
    confirmText: t('me.logout.confirm'),
    cancelText: t('me.logout.cancel'),
    onConfirm() {
      clearAuth()
      router.push('/login')
    },
  })
}

function formatDate(timestamp: number) {
  if (!timestamp)
    return '-'
  return new Date(timestamp * 1000).toLocaleDateString(locale.value)
}
</script>

<template>
  <HomeLayout>
    <div class="p-4">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            {{ t('me.status.loading') }}
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>{{ t('me.error.fetchFailed') }}{{ t('common.punctuation.colon') }} {{ userError?.message }}</p>
          </div>
        </div>

        <!-- 用户信息卡片 -->
        <div v-else-if="userInfo" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center space-x-4 mb-6">
            <Avatar
              :src="userInfo.avatar"
              :alt="userInfo.name"
              size="xl"
              shape="circle"
            />
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ userInfo.name || t('me.fields.notSet') }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                {{ t('me.fields.userId') }}{{ t('common.punctuation.colon') }} {{ userInfo.user_num }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 -m-2 mb-6">
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                {{ t('me.fields.employeeId') }}
              </p>
              <p class="text-base font-medium text-gray-900 mt-1">
                {{ userInfo.job_num || '-' }}
              </p>
            </div>
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                {{ t('me.fields.phone') }}
              </p>
              <p class="text-base font-medium text-gray-900 mt-1">
                {{ userInfo.bind_phone || userInfo.phone || '-' }}
              </p>
            </div>
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                {{ t('me.fields.email') }}
              </p>
              <p class="text-base font-medium text-gray-900 mt-1">
                {{ userInfo.bind_email || '-' }}
              </p>
            </div>
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                {{ t('me.fields.createTime') }}
              </p>
              <p class="text-base font-medium text-gray-900 mt-1">
                {{ formatDate(userInfo.created) }}
              </p>
            </div>
          </div>

          <!-- 功能操作区域 -->
          <div class="space-y-3 pt-4 border-t">
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/corp-legal')"
            >
              <span class="text-gray-900 font-medium">{{ t('me.actions.corpAuth') }}</span>
              <Icon icon="lucide:chevron-right" class="w-5 h-5 text-gray-400" />
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/change-password')"
            >
              <span class="text-gray-900 font-medium">{{ t('me.actions.changePassword') }}</span>
              <Icon icon="lucide:chevron-right" class="w-5 h-5 text-gray-400" />
            </button>
            <button
              v-if="isEnabled('languageSwitching')"
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/language')"
            >
              <span class="text-gray-900 font-medium">{{ t('me.actions.changeLanguage') }}</span>
              <Icon icon="lucide:chevron-right" class="w-5 h-5 text-gray-400" />
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/bind-phone')"
            >
              <span class="text-gray-900 font-medium">{{ t('me.actions.bindPhone') }}</span>
              <Icon icon="lucide:chevron-right" class="w-5 h-5 text-gray-400" />
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/bind-email')"
            >
              <span class="text-gray-900 font-medium">{{ t('me.actions.bindEmail') }}</span>
              <Icon icon="lucide:chevron-right" class="w-5 h-5 text-gray-400" />
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/unregist')"
            >
              <span class="text-red-600 font-medium">{{ t('me.actions.unregister') }}</span>
              <Icon icon="lucide:chevron-right" class="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <!-- 无数据提示 -->
        <div v-else class="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          {{ t('me.status.noData') }}
        </div>

        <button
          class="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-between mt-4"
          @click="handleLogout"
        >
          <span class="text-red-600 font-medium">{{ t('me.actions.logout') }}</span>
          <Icon icon="lucide:chevron-right" class="w-5 h-5 text-gray-400" />
        </button>

        <div class="text-center text-sm text-gray-400 mt-8">
          v{{ pkg.version }}
        </div>
      </div>
    </div>
  </HomeLayout>
</template>
