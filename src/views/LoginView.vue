<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="login-bg__orb login-bg__orb--1" />
      <div class="login-bg__orb login-bg__orb--2" />
    </div>

    <div class="login-container slide-up">
      <div class="login-header">
        <span class="login-header__emoji">💰</span>
        <h1 class="login-header__title">Casal no Controle</h1>
        <p class="login-header__subtitle">Gestão financeira para dois</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="seu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

        <button type="submit" class="btn btn--primary btn--full" :disabled="isLoading">
          <span v-if="isLoading" class="spinner" />
          <span v-else>Entrar</span>
        </button>
      </form>

      <p class="login-footer">
        Seus dados são privados e ficam seguros no Supabase.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authStore.signIn(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique suas credenciais.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.login-bg__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.login-bg__orb--1 {
  width: 300px;
  height: 300px;
  background: var(--color-receita);
  top: -80px;
  right: -80px;
}

.login-bg__orb--2 {
  width: 250px;
  height: 250px;
  background: var(--color-cartao);
  bottom: -60px;
  left: -60px;
}

.login-container {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.login-header__emoji {
  font-size: 3rem;
}

.login-header__title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-extrabold);
  color: var(--color-text-primary);
  line-height: 1.1;
}

.login-header__subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.login-error {
  font-size: var(--text-sm);
  color: var(--color-despesa);
  background: var(--color-despesa-dim);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
}

.login-footer {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: 1.5;
}
</style>
