<script setup lang="ts">
import type { UserInfo } from '~/types/auth'
import { useQuery } from '@pinia/colada'
import Avatar from '~/components/Avatar.vue'
import HomeLayout from '~/components/HomeLayout.vue'

const router = useRouter()
const { clearAuth } = useAuth()

// 获取用户信息
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
    title: '确认退出',
    message: '确定要退出登录吗？',
    confirmText: '确认退出',
    cancelText: '取消',
    onConfirm() {
      clearAuth()
      router.push('/login')
    },
  })
}

// 格式化日期
function formatDate(timestamp: number) {
  if (!timestamp)
    return '-'
  return new Date(timestamp * 1000).toLocaleDateString('zh-CN')
}
</script>

<template>
  <HomeLayout>
    <div class="p-4">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <div class="text-gray-600">
            加载中...
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="hasError" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">
            <p>获取用户信息失败: {{ userError?.message }}</p>
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
                {{ userInfo.name || '未设置' }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                用户编号: {{ userInfo.user_num }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 -m-2 mb-6">
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                工号
              </p>
              <p class="text-base font-medium text-gray-900 mt-1">
                {{ userInfo.job_num || '-' }}
              </p>
            </div>
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                手机号
              </p>
              <p class="text-base font-medium text-gray-900 mt-1">
                {{ userInfo.bind_phone || userInfo.phone || '-' }}
              </p>
            </div>
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                邮箱
              </p>
              <p class="text-base font-medium text-gray-900 mt-1">
                {{ userInfo.bind_email || '-' }}
              </p>
            </div>
            <div class="border-b pb-2 m-2">
              <p class="text-sm text-gray-500">
                创建时间
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
              <span class="text-gray-900 font-medium">企业认证</span>
              <span class="text-gray-400">›</span>
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/change-password')"
            >
              <span class="text-gray-900 font-medium">修改密码</span>
              <span class="text-gray-400">›</span>
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/bind-phone')"
            >
              <span class="text-gray-900 font-medium">绑定手机</span>
              <span class="text-gray-400">›</span>
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/bind-email')"
            >
              <span class="text-gray-900 font-medium">绑定邮箱</span>
              <span class="text-gray-400">›</span>
            </button>
            <button
              class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
              @click="router.push('/me/unregist')"
            >
              <span class="text-red-600 font-medium">注销账号</span>
              <span class="text-gray-400">›</span>
            </button>
          </div>
        </div>

        <!-- 无数据提示 -->
        <div v-else class="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          暂无数据
        </div>

        <button
          class="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-between mt-4"
          @click="handleLogout"
        >
          <span class="text-red-600 font-medium">退出登录</span>
          <span class="text-gray-400">›</span>
        </button>
      </div>
    </div>
  </HomeLayout>
</template>
