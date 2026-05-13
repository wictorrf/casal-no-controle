<template>
  <div>
    <AppHeader
      :mes="financeiroStore.mesSelecionado"
      :ano="financeiroStore.anoSelecionado"
      :email="authStore.user?.email"
      @logout="handleLogout"
      @open-month-picker="showMonthPicker = true"
    />

    <main class="page-content">
      <div class="lancamentos__header fade-in">
        <h2 class="lancamentos__title">Lançamentos</h2>
      </div>

      <!-- Tabs de tipo -->
      <div class="lancamentos__tabs fade-in">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="lancamentos__tab"
          :class="{ 'lancamentos__tab--active': tabAtiva === tab.value, [`lancamentos__tab--${tab.value}`]: tabAtiva === tab.value }"
          @click="tabAtiva = tab.value"
        >
          {{ tab.label }}
          <span class="lancamentos__tab-count">{{ contagens[tab.value] }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="financeiroStore.isLoading" class="lancamentos__loading">
        <div class="spinner" style="color: var(--color-receita)" />
      </div>

      <!-- Lista -->
      <div v-else-if="listaAtiva.length > 0" class="lancamentos__list fade-in">
        <LancamentoItem
          v-for="lancamento in listaAtiva"
          :key="lancamento.id"
          :lancamento="lancamento"
          @deletar="handleDeletar"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="lancamentos__empty fade-in">
        <span class="lancamentos__empty-icon">{{ tabAtual.emptyIcon }}</span>
        <p>Nenhum {{ tabAtual.label.toLowerCase() }} em {{ nomeMes }}.</p>
        <RouterLink to="/novo" class="btn btn--primary btn--sm">
          Adicionar {{ tabAtual.label.toLowerCase() }}
        </RouterLink>
      </div>

      <!-- Total da tab ativa -->
      <div v-if="listaAtiva.length > 0" class="lancamentos__total fade-in">
        <span class="lancamentos__total-label">Total {{ tabAtual.label }}</span>
        <span class="lancamentos__total-valor" :class="`text-${tabAtiva}`">
          {{ formatarBRL(totalAtivo) }}
        </span>
      </div>
    </main>

    <BottomNav />

    <!-- Month Picker Modal -->
    <Teleport to="body">
      <div v-if="showMonthPicker" class="modal-overlay" @click.self="showMonthPicker = false">
        <div class="month-picker card slide-up">
          <h3 class="month-picker__title">Selecionar período</h3>
          <div class="month-picker__year-row">
            <button class="btn btn--secondary btn--sm" @click="anoTemp--">‹</button>
            <span class="month-picker__year">{{ anoTemp }}</span>
            <button class="btn btn--secondary btn--sm" @click="anoTemp++">›</button>
          </div>
          <div class="month-picker__grid">
            <button
              v-for="(nome, idx) in MESES"
              :key="idx"
              class="month-picker__btn"
              :class="{ 'month-picker__btn--active': mesTemp === idx + 1 }"
              @click="mesTemp = idx + 1"
            >
              {{ nome.slice(0, 3) }}
            </button>
          </div>
          <button class="btn btn--primary btn--full" @click="aplicarPeriodo">Confirmar</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceiroStore } from '@/stores/financeiro'
import { useAuthStore } from '@/stores/auth'
import { MESES } from '@/types'
import type { TipoLancamento } from '@/types'
import AppHeader from '@/components/AppHeader.vue'
import LancamentoItem from '@/components/LancamentoItem.vue'
import BottomNav from '@/components/BottomNav.vue'

const financeiroStore = useFinanceiroStore()
const authStore = useAuthStore()
const router = useRouter()

const tabAtiva = ref<TipoLancamento>('receita')
const showMonthPicker = ref(false)
const mesTemp = ref(financeiroStore.mesSelecionado)
const anoTemp = ref(financeiroStore.anoSelecionado)

const tabs = [
  { value: 'receita' as TipoLancamento, label: 'Receitas', emptyIcon: '💰' },
  { value: 'despesa' as TipoLancamento, label: 'Despesas', emptyIcon: '🏠' },
  { value: 'cartao' as TipoLancamento, label: 'Cartão', emptyIcon: '💳' },
]

const tabAtual = computed(() => tabs.find((t) => t.value === tabAtiva.value)!)

const nomeMes = computed(() => MESES[financeiroStore.mesSelecionado - 1])

const listaAtiva = computed(() => {
  if (tabAtiva.value === 'receita') return financeiroStore.receitas
  if (tabAtiva.value === 'despesa') return financeiroStore.despesas
  return financeiroStore.cartao
})

const contagens = computed(() => ({
  receita: financeiroStore.receitas.length,
  despesa: financeiroStore.despesas.length,
  cartao: financeiroStore.cartao.length,
}))

const totalAtivo = computed(() =>
  listaAtiva.value.reduce((acc, l) => acc + l.valor, 0),
)

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

async function handleDeletar(id: string) {
  await financeiroStore.removerLancamento(id)
}

function aplicarPeriodo() {
  financeiroStore.setMes(mesTemp.value, anoTemp.value)
  showMonthPicker.value = false
}

async function handleLogout() {
  await authStore.signOut()
  router.push({ name: 'login' })
}

onMounted(() => {
  financeiroStore.carregarLancamentos()
})
</script>

<style scoped>
.lancamentos__header {
  margin-bottom: var(--space-4);
}

.lancamentos__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
  color: var(--color-text-primary);
}

.lancamentos__tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--space-1);
  border: 1px solid var(--color-border);
}

.lancamentos__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  transition: all var(--transition-fast);
  min-height: 40px;
}

.lancamentos__tab--active {
  font-weight: var(--font-semibold);
}

.lancamentos__tab--receita { background: var(--color-receita-dim); color: var(--color-receita); }
.lancamentos__tab--despesa { background: var(--color-despesa-dim); color: var(--color-despesa); }
.lancamentos__tab--cartao  { background: var(--color-cartao-dim);  color: var(--color-cartao); }

.lancamentos__tab-count {
  font-size: var(--text-xs);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  padding: 0 6px;
  min-width: 20px;
  text-align: center;
}

.lancamentos__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.lancamentos__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10) var(--space-4);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border-strong);
}

.lancamentos__empty-icon {
  font-size: 2.5rem;
}

.lancamentos__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.lancamentos__total {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lancamentos__total-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

.lancamentos__total-valor {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

/* Reutilizando estilos do month picker do Dashboard */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  padding: var(--space-4);
}

.month-picker {
  width: 100%;
  max-width: var(--max-width);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.month-picker__title {
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  text-align: center;
}

.month-picker__year-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.month-picker__year {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  min-width: 60px;
  text-align: center;
}

.month-picker__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.month-picker__btn {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-card-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 48px;
}

.month-picker__btn:hover {
  border-color: var(--color-receita);
  color: var(--color-receita);
}

.month-picker__btn--active {
  background: var(--color-receita-dim);
  border-color: var(--color-receita);
  color: var(--color-receita);
  font-weight: var(--font-semibold);
}

/* ── ≥ 768px: modal centralizado (não bottom-sheet) ─────────── */
@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }

  .month-picker {
    max-width: 480px;
  }
}

/* ── ≥ 1024px: lista em 2 colunas ───────────────────────────── */
@media (min-width: 1024px) {
  .lanc__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-2);
  }
}
</style>
