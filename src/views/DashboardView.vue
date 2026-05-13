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
      <!-- Wrapper para grid 60/40 em ≥1440px -->
      <div class="dashboard__layout">

      <!-- Cards de resumo -->
      <section class="dashboard__cards fade-in">
        <SaldoCard tipo="receita" label="Receitas" :valor="financeiroStore.resumo.totalReceitas" />
        <SaldoCard tipo="despesa" label="Despesas" :valor="financeiroStore.resumo.totalDespesas" />
        <SaldoCard tipo="cartao" label="Cartão" :valor="financeiroStore.resumo.totalCartao" />
        <SaldoCard tipo="saldo" label="Saldo" :valor="financeiroStore.resumo.saldo" />
      </section>

      <!-- Card assinaturas fixas -->
      <section v-if="financeiroStore.totalAssinaturas > 0" class="dashboard__assinaturas fade-in">
        <div class="dashboard__assins-header">
          <div class="dashboard__assins-left">
            <span class="dashboard__assins-icon">🔁</span>
            <div class="dashboard__assins-info">
              <span class="dashboard__assins-label">Fixo mensal</span>
              <span class="dashboard__assins-sub">
                {{ financeiroStore.assinaturasAtivas.length }} assinaturas ativas
              </span>
            </div>
          </div>
          <div class="dashboard__assins-right">
            <span class="dashboard__assins-valor">{{ formatarBRL(financeiroStore.totalAssinaturas) }}</span>
            <RouterLink to="/assinaturas" class="dashboard__assins-link">Gerenciar →</RouterLink>
          </div>
        </div>
      </section>

      <!-- Gráfico de pizza -->
      <section v-if="hasGraficoData" class="dashboard__chart card fade-in">
        <h2 class="dashboard__section-title">Gastos por Categoria</h2>
        <div class="dashboard__chart-wrap">
          <Doughnut :data="chartData" :options="chartOptions" />
        </div>
      </section>

      <section v-else-if="!financeiroStore.isLoading" class="dashboard__empty fade-in">
        <span class="dashboard__empty-icon">📊</span>
        <p>Nenhum dado para exibir neste mês.</p>
        <RouterLink to="/novo" class="btn btn--primary btn--sm">
          Adicionar lançamento
        </RouterLink>
      </section>

      <!-- Últimos lançamentos -->
      <section v-if="ultimosLancamentos.length > 0" class="dashboard__recent fade-in">
        <div class="dashboard__section-header">
          <h2 class="dashboard__section-title">Últimos lançamentos</h2>
          <RouterLink to="/lancamentos" class="dashboard__ver-todos">Ver todos</RouterLink>
        </div>
        <div class="dashboard__list">
          <LancamentoItem
            v-for="lancamento in ultimosLancamentos"
            :key="lancamento.id"
            :lancamento="lancamento"
            @deletar="handleDeletar"
          />
        </div>
      </section>

      <!-- Loading -->
      <div v-if="financeiroStore.isLoading" class="dashboard__loading">
        <div class="spinner" style="color: var(--color-receita)" />
      </div>

      </div><!-- /dashboard__layout -->
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
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFinanceiroStore } from '@/stores/financeiro'
import { useAuthStore } from '@/stores/auth'
import { MESES } from '@/types'

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}
import AppHeader from '@/components/AppHeader.vue'
import SaldoCard from '@/components/SaldoCard.vue'
import LancamentoItem from '@/components/LancamentoItem.vue'
import BottomNav from '@/components/BottomNav.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const financeiroStore = useFinanceiroStore()
const authStore = useAuthStore()
const router = useRouter()

const showMonthPicker = ref(false)
const mesTemp = ref(financeiroStore.mesSelecionado)
const anoTemp = ref(financeiroStore.anoSelecionado)

const ultimosLancamentos = computed(() =>
  financeiroStore.lancamentosFiltrados.slice(0, 5),
)

const hasGraficoData = computed(() =>
  Object.keys(financeiroStore.categoriasDespesaAgrupadas).length > 0,
)

const CHART_COLORS = [
  '#00C896', '#FF4757', '#4A9EFF', '#F5C518',
  '#FF6B35', '#A855F7', '#EC4899', '#14B8A6',
]

const chartData = computed(() => {
  const grupos = financeiroStore.categoriasDespesaAgrupadas
  return {
    labels: Object.keys(grupos).map((k) => k.replace(/_/g, ' ')),
    datasets: [
      {
        data: Object.values(grupos),
        backgroundColor: CHART_COLORS.slice(0, Object.keys(grupos).length),
        borderColor: 'transparent',
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#8B949E',
        font: { size: 12, family: 'DM Sans' },
        padding: 16,
        boxWidth: 12,
        boxHeight: 12,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; raw: unknown }) => {
          const valor = ctx.raw as number
          return ` ${ctx.label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)}`
        },
      },
    },
  },
}

function aplicarPeriodo() {
  financeiroStore.setMes(mesTemp.value, anoTemp.value)
  showMonthPicker.value = false
}

async function handleDeletar(id: string) {
  await financeiroStore.removerLancamento(id)
}

async function handleLogout() {
  await authStore.signOut()
  router.push({ name: 'login' })
}

onMounted(() => {
  financeiroStore.carregarLancamentos()
  financeiroStore.fetchAssinaturas()
})
</script>

<style scoped>
.dashboard__cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.dashboard__section-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.dashboard__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.dashboard__ver-todos {
  font-size: var(--text-sm);
  color: var(--color-cartao);
  font-weight: var(--font-medium);
}

.dashboard__chart {
  margin-bottom: var(--space-5);
}

.dashboard__chart h2 {
  margin-bottom: var(--space-4);
}

.dashboard__chart-wrap {
  height: 260px;
}

.dashboard__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dashboard__recent {
  margin-bottom: var(--space-5);
}

.dashboard__empty {
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
  margin-bottom: var(--space-5);
}

.dashboard__empty-icon {
  font-size: 2.5rem;
}

.dashboard__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

/* Card assinaturas */
.dashboard__assinaturas {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.08), rgba(74, 158, 255, 0.03));
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-5);
}

.dashboard__assins-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.dashboard__assins-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.dashboard__assins-icon {
  font-size: 1.5rem;
}

.dashboard__assins-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dashboard__assins-label {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-cartao);
}

.dashboard__assins-sub {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.dashboard__assins-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.dashboard__assins-valor {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-cartao);
}

.dashboard__assins-link {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.dashboard__assins-link:hover {
  color: var(--color-cartao);
}

/* Modal */
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

/* ── ≥ 768px ─────────────────────────────────────────────────── */
@media (min-width: 768px) {
  .dashboard__cards {
    grid-template-columns: repeat(4, 1fr); /* 4 cards em linha no tablet */
  }

  .dashboard__chart-wrap {
    height: 300px;
  }

  /* Modal centralizado no tablet */
  .modal-overlay {
    align-items: center;
  }

  .month-picker {
    max-width: 480px;
  }
}

/* ── ≥ 1024px: cards 2x2, chart mais alto ───────────────────── */
@media (min-width: 1024px) {
  .dashboard__cards {
    grid-template-columns: repeat(2, 1fr); /* explícito 2x2 */
    gap: var(--space-4);
  }

  .dashboard__chart-wrap {
    height: 320px;
  }
}

/* ── ≥ 1440px: layout 60/40 (conteúdo | gráfico) ─────────────── */
@media (min-width: 1440px) {
  .dashboard__layout {
    display:               grid;
    grid-template-columns: 60fr 40fr;
    grid-template-rows:    auto;
    column-gap:            var(--space-6);
    align-items:           start;
  }

  /* Coluna esquerda: todos os blocos exceto o gráfico */
  .dashboard__cards,
  .dashboard__assinaturas,
  .dashboard__recent,
  .dashboard__empty,
  .dashboard__loading {
    grid-column: 1;
  }

  /* Coluna direita: gráfico — sticky para acompanhar o scroll */
  .dashboard__chart {
    grid-column: 2;
    grid-row:    1 / 6;
    position:    sticky;
    top:         calc(var(--header-height) + 24px);
  }

  .dashboard__chart-wrap {
    height: 380px;
  }

  .dashboard__cards {
    grid-template-columns: repeat(2, 1fr); /* volta 2x2 na coluna menor */
  }
}
</style>
