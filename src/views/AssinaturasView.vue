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
      <!-- Total mensal fixo -->
      <section class="assins__total-hero fade-in">
        <div class="assins__total-label">Fixo mensal em assinaturas</div>
        <div class="assins__total-valor">{{ formatarBRL(financeiroStore.totalAssinaturas) }}</div>
        <div class="assins__total-sub">
          {{ financeiroStore.assinaturasAtivas.length }} ativas de {{ financeiroStore.assinaturas.length }} cadastradas
        </div>
      </section>

      <!-- Loading -->
      <div v-if="financeiroStore.isLoadingAssinaturas" class="assins__loading">
        <div class="spinner" style="color: var(--color-cartao)" />
      </div>

      <template v-else>
        <!-- Lista de assinaturas ativas -->
        <section v-if="financeiroStore.assinaturasAtivas.length > 0" class="assins__section fade-in">
          <h2 class="assins__section-title">Ativas</h2>
          <div class="assins__list">
            <AssinaturaCard
              v-for="assinatura in financeiroStore.assinaturasAtivas"
              :key="assinatura.id"
              :assinatura="assinatura"
              @toggle="handleToggle"
              @deletar="handleDeletar"
            />
          </div>
        </section>

        <!-- Assinaturas inativas -->
        <section v-if="assinaturasInativas.length > 0" class="assins__section fade-in">
          <button class="assins__collapse-btn" @click="mostrarInativas = !mostrarInativas">
            <span>Inativas ({{ assinaturasInativas.length }})</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2"
              :style="{ transform: mostrarInativas ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div v-if="mostrarInativas" class="assins__list assins__list--inativas">
            <AssinaturaCard
              v-for="assinatura in assinaturasInativas"
              :key="assinatura.id"
              :assinatura="assinatura"
              @toggle="handleToggle"
              @deletar="handleDeletar"
            />
          </div>
        </section>

        <!-- Parcelamentos em aberto -->
        <section
          v-if="financeiroStore.parcelamentosAbertos.length > 0"
          class="assins__section fade-in"
        >
          <h2 class="assins__section-title">
            Parcelamentos em aberto
            <span class="assins__section-badge">{{ MESES[financeiroStore.mesSelecionado - 1] }}</span>
          </h2>
          <div class="assins__list">
            <ParcelamentoProgress
              v-for="l in financeiroStore.parcelamentosAbertos"
              :key="l.id"
              :descricao="l.descricao"
              :parcela-atual="l.parcela_atual ?? 1"
              :total-parcelas="l.total_parcelas ?? 1"
              :valor="l.valor"
            />
          </div>
        </section>

        <!-- Empty state -->
        <div v-if="financeiroStore.assinaturas.length === 0" class="assins__empty fade-in">
          <span class="assins__empty-icon">📋</span>
          <p>Nenhuma assinatura cadastrada ainda.</p>
          <p class="text-secondary" style="font-size: var(--text-sm)">
            Adicione suas assinaturas recorrentes para acompanhar o gasto fixo mensal.
          </p>
        </div>
      </template>
    </main>

    <!-- FAB: nova assinatura -->
    <button class="assins__fab" @click="showForm = true" aria-label="Nova assinatura">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <BottomNav />

    <!-- Modal: nova assinatura -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
        <div class="assins__modal card slide-up">
          <h3 class="assins__modal-title">Nova Assinatura</h3>

          <form class="assins__form" @submit.prevent="handleCriar">
            <div class="form-group">
              <label class="form-label" for="a-descricao">Nome do serviço</label>
              <input
                id="a-descricao"
                v-model="novaForm.descricao"
                type="text"
                class="form-input"
                placeholder="Ex: Netflix, Spotify..."
                required
                maxlength="60"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="a-valor">Valor mensal (R$)</label>
              <input
                id="a-valor"
                v-model.number="novaForm.valor"
                type="number"
                class="form-input"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div class="assins__form-row">
              <div class="form-group">
                <label class="form-label" for="a-categoria">Categoria</label>
                <select id="a-categoria" v-model="novaForm.categoria" class="form-select" required>
                  <option value="" disabled>Selecione</option>
                  <option v-for="cat in CATEGORIAS_ASSINATURA" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="a-dia">Dia de cobrança</label>
                <input
                  id="a-dia"
                  v-model.number="novaForm.dia_cobranca"
                  type="number"
                  class="form-input"
                  min="1"
                  max="31"
                  required
                />
              </div>
            </div>

            <p v-if="formError" class="assins__form-error">{{ formError }}</p>

            <div class="assins__form-actions">
              <button type="button" class="btn btn--secondary" @click="showForm = false">
                Cancelar
              </button>
              <button type="submit" class="btn btn--primary" :disabled="isSaving">
                <span v-if="isSaving" class="spinner" />
                <span v-else>Salvar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceiroStore } from '@/stores/financeiro'
import { useAuthStore } from '@/stores/auth'
import { MESES, CATEGORIAS_ASSINATURA } from '@/types'
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import AssinaturaCard from '@/components/AssinaturaCard.vue'
import ParcelamentoProgress from '@/components/ParcelamentoProgress.vue'

const financeiroStore = useFinanceiroStore()
const authStore = useAuthStore()
const router = useRouter()

const showForm = ref(false)
const mostrarInativas = ref(false)
const isSaving = ref(false)
const formError = ref('')

const novaForm = reactive({
  descricao: '',
  valor: null as number | null,
  categoria: '',
  dia_cobranca: 1,
})

const assinaturasInativas = computed(() =>
  financeiroStore.assinaturas.filter((a) => !a.ativa),
)

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

async function handleToggle(id: string) {
  await financeiroStore.toggleAssinatura(id)
}

async function handleDeletar(id: string) {
  await financeiroStore.removerAssinatura(id)
}

async function handleCriar() {
  if (!novaForm.valor || novaForm.valor <= 0) {
    formError.value = 'Informe um valor maior que zero.'
    return
  }
  isSaving.value = true
  formError.value = ''
  try {
    await financeiroStore.criarAssinatura({
      descricao: novaForm.descricao,
      valor: novaForm.valor,
      categoria: novaForm.categoria,
      dia_cobranca: novaForm.dia_cobranca,
    })
    showForm.value = false
    novaForm.descricao = ''
    novaForm.valor = null
    novaForm.categoria = ''
    novaForm.dia_cobranca = 1
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Erro ao salvar assinatura.'
  } finally {
    isSaving.value = false
  }
}

async function handleLogout() {
  await authStore.signOut()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await financeiroStore.fetchAssinaturas()
  await financeiroStore.carregarLancamentos()
})
</script>

<style scoped>
.assins__total-hero {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.12), rgba(74, 158, 255, 0.04));
  border: 1px solid rgba(74, 158, 255, 0.25);
  border-radius: var(--radius-xl);
  padding: var(--space-6) var(--space-5);
  text-align: center;
  margin-bottom: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.assins__total-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-cartao);
}

.assins__total-valor {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  color: var(--color-cartao);
  line-height: 1;
}

.assins__total-sub {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.assins__section {
  margin-bottom: var(--space-5);
}

.assins__section-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: var(--text-xs);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.assins__section-badge {
  font-size: var(--text-xs);
  background: var(--color-cartao-dim);
  color: var(--color-cartao);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-weight: var(--font-medium);
  text-transform: capitalize;
  letter-spacing: 0;
}

.assins__collapse-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  font-family: var(--font-body);
  cursor: pointer;
  margin-bottom: var(--space-2);
  transition: background var(--transition-fast);
}

.assins__collapse-btn:hover {
  background: var(--color-card-hover);
}

.assins__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.assins__list--inativas {
  opacity: 0.8;
}

.assins__empty {
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

.assins__empty-icon {
  font-size: 2.5rem;
}

.assins__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

/* FAB */
.assins__fab {
  position: fixed;
  bottom: calc(var(--bottom-nav-height) + var(--space-4));
  right: calc(50% - var(--max-width) / 2 + var(--space-4));
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: var(--color-cartao);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow-cartao), var(--shadow-lg);
  border: none;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  z-index: 50;
}

.assins__fab:hover {
  transform: scale(1.08);
}

.assins__fab:active {
  transform: scale(0.95);
}

@media (max-width: 480px) {
  .assins__fab {
    right: var(--space-4);
  }
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

.assins__modal {
  width: 100%;
  max-width: var(--max-width);
}

.assins__modal-title {
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  font-size: var(--text-lg);
  margin-bottom: var(--space-5);
}

.assins__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.assins__form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.assins__form-error {
  font-size: var(--text-sm);
  color: var(--color-despesa);
  background: var(--color-despesa-dim);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
}

.assins__form-actions {
  display: flex;
  gap: var(--space-3);
}

.assins__form-actions .btn {
  flex: 1;
}

/* ── ≥ 768px: modal centralizado ────────────────────────────── */
@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }

  .assins__modal {
    max-width: 520px;
  }
}

/* ── ≥ 1024px: assinaturas em grid 2 colunas + FAB reposicionado */
@media (min-width: 1024px) {
  .assins__list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  /* FAB reposicionado: canto inferior direito da área de conteúdo */
  .assins__fab {
    bottom: var(--space-6);
    right:  calc(var(--app-offset) + var(--space-6));
  }
}

/* ── ≥ 1440px ────────────────────────────────────────────────── */
@media (min-width: 1440px) {
  .assins__list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
