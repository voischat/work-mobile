<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
import Header from '~/components/Header.vue'
import Sidebar from '~/components/Sidebar.vue'

const isDev = import.meta.env.DEV
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-gray-50">
    <!-- Sidebar (desktop only) -->
    <Sidebar class="hidden lg:block" />

    <!-- Main content area -->
    <!-- NOTE: do not use h-screen here -->
    <div class="flex-1 flex flex-col max-h-screen overflow-y-auto">
      <!-- Header (mobile only) -->
      <Header class="lg:hidden" :show-back="false" :show-exit="true" />

      <!-- Content area -->
      <main class="flex-1 pb-16 lg:pb-0 overflow-y-auto">
        <div class="max-w-7xl mx-auto p-4 lg:p-6">
          <slot />
        </div>
      </main>

      <!-- Bottom navigation (mobile only, dev only) -->
      <BottomNav v-if="isDev" class="lg:hidden" />
    </div>
  </div>
</template>
