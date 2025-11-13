<script setup lang="ts">
import { ref } from 'vue'
import HomeLayout from '~/components/HomeLayout.vue'
import Tab from '~/components/Tab.vue'
import UnregistEmail from './UnregistEmail.vue'
import UnregistPhone from './UnregistPhone.vue'

// 注销方式：phone 或 email
const activeTab = ref<'phone' | 'email'>('phone')

const tabs = [
  { key: 'phone', label: '手机验证' },
  { key: 'email', label: '邮箱验证' },
]
</script>

<template>
  <HomeLayout>
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-6">
            注销账号
          </h1>

          <div class="mb-6">
            <p class="text-sm text-red-600 mb-4">
              警告：注销账号后，所有数据将被永久删除，此操作不可恢复！
            </p>
            <Tab v-model="activeTab" :tabs="tabs" />
          </div>

          <div class="mt-6">
            <UnregistPhone v-if="activeTab === 'phone'" />
            <UnregistEmail v-else />
          </div>
        </div>
      </div>
    </div>
  </HomeLayout>
</template>
