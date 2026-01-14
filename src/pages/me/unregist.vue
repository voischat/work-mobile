<script setup lang="ts">
import BackLayout from '~/components/BackLayout.vue'
import Breadcrumb from '~/components/Breadcrumb.vue'
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
  <BackLayout title="注销账号">
    <template #breadcrumb>
      <Breadcrumb
        :items="[
          { name: '我的', route: '/me' },
          { name: '注销账号' },
        ]"
      />
    </template>
    <div class="p-4">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6">
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
  </BackLayout>
</template>
