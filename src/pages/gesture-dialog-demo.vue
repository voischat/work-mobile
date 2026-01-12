<script setup lang="ts">
import GestureDialog from '~/components/GestureDialog.vue'

const isDialogOpen = ref(false)
const isCompactDialogOpen = ref(false)
const isTallDialogOpen = ref(false)

function openDialog() {
  isDialogOpen.value = true
}

function openCompactDialog() {
  isCompactDialogOpen.value = true
}

function openTallDialog() {
  isTallDialogOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        Gesture Dialog Demo
      </h1>

      <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          ⚡ Fast Opening Dialogs
        </h2>

        <button
          type="button"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          @click="openDialog"
        >
          Default Height (50vh) - Super Fast!
        </button>

        <button
          type="button"
          class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          @click="openCompactDialog"
        >
          Compact Dialog (30vh)
        </button>

        <button
          type="button"
          class="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
          @click="openTallDialog"
        >
          Tall Dialog (70vh)
        </button>

        <div class="text-sm text-gray-600 space-y-2">
          <p><strong>Features:</strong></p>
          <ul class="list-disc list-inside space-y-1">
            <li>⚡ Lightning-fast opening (0.15s)</li>
            <li>🎯 Swipe down to dismiss</li>
            <li>👆 Tap backdrop to close</li>
            <li>🚀 GPU-accelerated animations</li>
            <li>📱 Body scaling effect</li>
            <li>📏 Customizable height (vh, px, or number)</li>
            <li>🔄 Compatible with existing Drawer API</li>
          </ul>
        </div>
      </div>

      <!-- Default Gesture Dialog (50vh) -->
      <GestureDialog v-model:open="isDialogOpen" title="⚡ Super Fast Dialog (50vh)">
        <div class="space-y-4">
          <p class="text-gray-700">
            ⚡ This dialog now opens incredibly fast (0.15s) with optimized animations!
            Try it multiple times to feel the difference:
          </p>

          <ul class="list-disc list-inside text-gray-700 space-y-2">
            <li>🚀 Opens in 150ms with GPU acceleration</li>
            <li>👆 Swipe down to dismiss with velocity detection</li>
            <li>🎯 Click the backdrop to close instantly</li>
            <li>✨ Smooth easeOut cubic-bezier animations</li>
            <li>📱 Background body scaling effect</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-800 text-sm">
              <strong>⚡ Performance Optimization:</strong> Opens in 150ms with GPU acceleration and optimized easing curves!
            </p>
          </div>

          <div class="space-y-3">
            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                ⚡ Lightning Fast Opening
              </h4>
              <p class="text-gray-600 text-sm mt-1">
                Optimized to 150ms opening time with GPU-accelerated transforms and easeOutQuart curves
              </p>
            </div>

            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                🎯 Smart Gesture Recognition
              </h4>
              <p class="text-gray-600 text-sm mt-1">
                Improved velocity detection (15px threshold) and relative distance calculation (60% of dialog height)
              </p>
            </div>

            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                📏 Height Customization
              </h4>
              <p class="text-gray-600 text-sm mt-1">
                Use <code>height</code> prop to set custom heights: "30vh", "70vh", 400, "500px"
              </p>
            </div>

            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                🚀 GPU Acceleration
              </h4>
              <p class="text-gray-600 text-sm mt-1">
                Enhanced with <code>transform-gpu</code> class and <code>will-change-transform</code> for buttery-smooth animations
              </p>
            </div>
          </div>
        </div>

        <template #footer>
          <button
            type="button"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
            @click="isDialogOpen = false"
          >
            Close Default Dialog
          </button>
        </template>
      </GestureDialog>

      <!-- Compact Dialog (30vh) -->
      <GestureDialog v-model:open="isCompactDialogOpen" title="Compact Dialog (30vh)" height="30vh">
        <div class="space-y-3">
          <p class="text-gray-700">
            This is a compact dialog using only 30% of the viewport height.
          </p>

          <div class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-800 text-sm">
              <strong>Usage:</strong> <code>height="30vh"</code>
            </p>
          </div>

          <p class="text-sm text-gray-600">
            Perfect for simple confirmations, quick actions, or when you need to keep more of the background visible.
          </p>
        </div>

        <template #footer>
          <div class="flex space-x-3">
            <button
              type="button"
              class="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors"
              @click="isCompactDialogOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
              @click="isCompactDialogOpen = false"
            >
              Confirm
            </button>
          </div>
        </template>
      </GestureDialog>

      <!-- Tall Dialog (70vh) -->
      <GestureDialog v-model:open="isTallDialogOpen" title="Tall Dialog (70vh)" height="70vh">
        <div class="space-y-4">
          <p class="text-gray-700">
            This is a tall dialog using 70% of the viewport height, perfect for content-heavy dialogs.
          </p>

          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p class="text-purple-800 text-sm">
              <strong>Usage:</strong> <code>height="70vh"</code>
            </p>
          </div>

          <!-- Extra content to demonstrate scrolling -->
          <div class="space-y-3">
            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                More Space for Content
              </h4>
              <p class="text-gray-600 text-sm mt-1">
                Tall dialogs are great when you have lots of content to display.
              </p>
            </div>

            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                Form Fields
              </h4>
              <div class="space-y-2 mt-2">
                <input type="text" placeholder="Name" class="w-full px-3 py-2 border rounded-md text-sm">
                <input type="email" placeholder="Email" class="w-full px-3 py-2 border rounded-md text-sm">
                <textarea placeholder="Message" rows="3" class="w-full px-3 py-2 border rounded-md text-sm resize-none" />
              </div>
            </div>

            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                Lists and Data
              </h4>
              <ul class="text-gray-600 text-sm mt-1 space-y-1">
                <li>• Item 1: Detail information</li>
                <li>• Item 2: More detailed content here</li>
                <li>• Item 3: Even more information</li>
                <li>• Item 4: Additional data points</li>
                <li>• Item 5: Extended content example</li>
              </ul>
            </div>

            <div class="bg-gray-100 rounded-lg p-3">
              <h4 class="font-medium text-gray-900">
                Scrollable Content
              </h4>
              <p class="text-gray-600 text-sm mt-1">
                When content exceeds dialog height, smooth scrolling is automatically enabled.
              </p>
            </div>
          </div>
        </div>

        <template #footer>
          <button
            type="button"
            class="w-full bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors"
            @click="isTallDialogOpen = false"
          >
            Close Tall Dialog
          </button>
        </template>
      </GestureDialog>
    </div>
  </div>
</template>
