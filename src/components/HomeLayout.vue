<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
import Header from '~/components/Header.vue'
import Sidebar from '~/components/Sidebar.vue'
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
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>

      <BottomNav v-if="!isLimitedWebview" class="lg:hidden" />
    </div>
  </div>
</template>
