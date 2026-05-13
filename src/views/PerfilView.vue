<template>
  <div>
    <AppHeader
      :mes="financeiroStore.mesSelecionado"
      :ano="financeiroStore.anoSelecionado"
      :email="authStore.user?.email"
      @logout="handleLogout"
      @open-month-picker="() => {}"
    />

    <main class="page-content">
      <div class="perfil__header fade-in">
        <div class="perfil__avatar">
          {{ inicialUsuario }}
        </div>
        <div class="perfil__info">
          <h2 class="perfil__name">{{ nomeExibicao }}</h2>
          <p class="perfil__email">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <div class="perfil__stats card fade-in">
        <h3 class="perfil__section-title">Resumo do mês</h3>
        <div class="perfil__stats-grid">
          <div class="perfil__stat">
            <span class="perfil__stat-label">Receitas</span>
            <span class="perfil__stat-value text-receita">{{ financeiroStore.receitas.length }}</span>
          </div>
          <div class="perfil__stat">
            <span class="perfil__stat-label">Despesas</span>
            <span class="perfil__stat-value text-despesa">{{ financeiroStore.despesas.length }}</span>
          </div>
          <div class="perfil__stat">
            <span class="perfil__stat-label">Cartão</span>
            <span class="perfil__stat-value text-cartao">{{ financeiroStore.cartao.length }}</span>
          </div>
          <div class="perfil__stat">
            <span class="perfil__stat-label">Total itens</span>
            <span class="perfil__stat-value">{{ financeiroStore.lancamentosFiltrados.length }}</span>
          </div>
        </div>
      </div>

      <div class="perfil__actions fade-in">
        <button class="btn btn--danger btn--full" @click="handleLogout" :disabled="isLoading">
          <span v-if="isLoading" class="spinner" />
          <span v-else>Sair da conta</span>
        </button>
      </div>

      <p class="perfil__version">Casal no Controle v1.0.0</p>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFinanceiroStore } from '@/stores/financeiro'
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const authStore = useAuthStore()
const financeiroStore = useFinanceiroStore()
const router = useRouter()

const isLoading = ref(false)

const inicialUsuario = computed(() =>
  authStore.user?.email?.charAt(0).toUpperCase() ?? 'U',
)

const nomeExibicao = computed(() => {
  const email = authStore.user?.email ?? ''
  return email.split('@')[0] ?? 'Usuário'
})

async function handleLogout() {
  isLoading.value = true
  try {
    await authStore.signOut()
    router.push({ name: 'login' })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.perfil__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--space-5);
}

.perfil__avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-cartao), var(--color-receita));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: white;
  flex-shrink: 0;
}

.perfil__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.perfil__name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  text-transform: capitalize;
}

.perfil__email {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.perfil__stats {
  margin-bottom: var(--space-5);
}

.perfil__section-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-4);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: var(--text-xs);
}

.perfil__stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.perfil__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--color-card-hover);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.perfil__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

.perfil__stat-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.perfil__actions {
  margin-bottom: var(--space-6);
}

.perfil__version {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* ── ≥ 768px: perfil centralizado ────────────────────────────── */
@media (min-width: 768px) {
  .perfil__stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ── ≥ 1024px: conteúdo em coluna mais estreita ─────────────── */
@media (min-width: 1024px) {
  .perfil__header {
    padding: var(--space-6);
  }

  .perfil__avatar {
    width: 80px;
    height: 80px;
    font-size: var(--text-3xl);
  }

  .perfil__stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
  }
}
</style>
