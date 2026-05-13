<template>
  <div v-if="!authStore.isLoading">
    <RouterView />
  </div>
  <div v-else class="app-loading">
    <div class="spinner" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<style scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  color: var(--color-receita);
}

.spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}
</style>
