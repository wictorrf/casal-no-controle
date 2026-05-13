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
      <div class="novo__header fade-in">
        <button class="novo__back" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 class="novo__title">Novo Lançamento</h2>
      </div>

      <form class="novo__form card fade-in" @submit.prevent="handleSubmit">
        <!-- Tipo principal -->
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <div class="novo__tipo-group">
            <button
              v-for="opt in tipoOpcoes"
              :key="opt.value"
              type="button"
              class="novo__tipo-btn"
              :class="{ [`novo__tipo-btn--${opt.value}`]: form.tipo === opt.value }"
              @click="onTipoChange(opt.value)"
            >
              <span>{{ opt.icon }}</span>
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <!-- Sub-tipo: apenas quando tipo === 'cartao' -->
        <div v-if="form.tipo === 'cartao'" class="form-group">
          <label class="form-label">Tipo de lançamento no cartão</label>
          <div class="novo__subtipo-group">
            <button
              v-for="sub in subtipoOpcoes"
              :key="sub.value"
              type="button"
              class="novo__subtipo-btn"
              :class="{ 'novo__subtipo-btn--active': form.subtipo === sub.value }"
              @click="form.subtipo = sub.value"
            >
              <span class="novo__subtipo-icon">{{ sub.icon }}</span>
              <span class="novo__subtipo-label">{{ sub.label }}</span>
              <span class="novo__subtipo-desc">{{ sub.desc }}</span>
            </button>
          </div>
        </div>

        <!-- Descrição -->
        <div class="form-group">
          <label class="form-label" for="descricao">Descrição</label>
          <input
            id="descricao"
            v-model="form.descricao"
            type="text"
            class="form-input"
            placeholder="Ex: Salário, Condomínio, Supermercado..."
            required
            maxlength="80"
          />
        </div>

        <!-- Valor: para parcelado é "Valor total" -->
        <div class="form-group">
          <label class="form-label" for="valor">
            {{ form.subtipo === 'parcelado' ? 'Valor total (R$)' : 'Valor (R$)' }}
          </label>
          <input
            id="valor"
            v-model.number="form.valorTotal"
            type="number"
            class="form-input"
            placeholder="0,00"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <!-- Parcelas: apenas para parcelado -->
        <div v-if="form.subtipo === 'parcelado'" class="form-group">
          <label class="form-label" for="parcelas">
            Número de parcelas
            <span class="novo__label-hint">(2 a 48)</span>
          </label>
          <input
            id="parcelas"
            v-model.number="form.totalParcelas"
            type="number"
            class="form-input"
            min="2"
            max="48"
            required
          />
        </div>

        <!-- Preview parcelamento -->
        <div v-if="form.subtipo === 'parcelado' && previewParcelamento" class="novo__preview-parcelado">
          <span class="novo__preview-icon">💳</span>
          <div class="novo__preview-texto">
            <span class="novo__preview-main">{{ previewParcelamento.texto }}</span>
            <span class="novo__preview-sub">Total: {{ previewParcelamento.total }}</span>
          </div>
        </div>

        <!-- Dia de cobrança: apenas para recorrente -->
        <div v-if="form.subtipo === 'recorrente'" class="form-group">
          <label class="form-label" for="dia-cobranca">Dia de cobrança</label>
          <input
            id="dia-cobranca"
            v-model.number="form.diaCobranca"
            type="number"
            class="form-input"
            min="1"
            max="31"
            placeholder="Ex: 15"
            required
          />
        </div>

        <!-- Categoria -->
        <div class="form-group">
          <label class="form-label" for="categoria">Categoria</label>
          <select id="categoria" v-model="form.categoria" class="form-select" required>
            <option value="" disabled>Selecione uma categoria</option>
            <option v-for="cat in categoriasAtuais" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <!-- Mês e Ano -->
        <div class="novo__periodo">
          <div class="form-group">
            <label class="form-label" for="mes">Mês</label>
            <select id="mes" v-model.number="form.mes" class="form-select" required>
              <option v-for="(nome, idx) in MESES" :key="idx" :value="idx + 1">
                {{ nome }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="ano">Ano</label>
            <input
              id="ano"
              v-model.number="form.ano"
              type="number"
              class="form-input"
              :min="2020"
              :max="2099"
              required
            />
          </div>
        </div>

        <p v-if="errorMsg" class="novo__error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="novo__success">{{ successMsg }}</p>

        <button type="submit" class="btn btn--primary btn--full" :disabled="isLoading">
          <span v-if="isLoading" class="spinner" />
          <span v-else>{{ labelBotaoSubmit }}</span>
        </button>
      </form>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceiroStore } from '@/stores/financeiro'
import { useAuthStore } from '@/stores/auth'
import {
  MESES,
  CATEGORIAS_RECEITA,
  CATEGORIAS_DESPESA,
  CATEGORIAS_CARTAO,
} from '@/types'
import type { TipoLancamento, SubtipoCartao } from '@/types'
import AppHeader from '@/components/AppHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const financeiroStore = useFinanceiroStore()
const authStore = useAuthStore()
const router = useRouter()

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  tipo: 'despesa' as TipoLancamento,
  subtipo: 'avulso' as SubtipoCartao,
  descricao: '',
  valorTotal: null as number | null,
  totalParcelas: 2,
  diaCobranca: 1,
  categoria: '',
  mes: financeiroStore.mesSelecionado,
  ano: financeiroStore.anoSelecionado,
})

const tipoOpcoes = [
  { value: 'receita' as TipoLancamento, label: 'Receita', icon: '↑' },
  { value: 'despesa' as TipoLancamento, label: 'Despesa', icon: '↓' },
  { value: 'cartao' as TipoLancamento, label: 'Cartão', icon: '💳' },
]

const subtipoOpcoes: Array<{ value: SubtipoCartao; icon: string; label: string; desc: string }> = [
  { value: 'avulso', icon: '🧾', label: 'Avulso', desc: 'Compra única' },
  { value: 'recorrente', icon: '🔁', label: 'Recorrente', desc: 'Todo mês' },
  { value: 'parcelado', icon: '📅', label: 'Parcelado', desc: 'X vezes' },
]

const categoriasAtuais = computed(() => {
  if (form.tipo === 'receita') return CATEGORIAS_RECEITA
  if (form.tipo === 'despesa') return CATEGORIAS_DESPESA
  return CATEGORIAS_CARTAO
})

const valorPorParcela = computed(() => {
  if (!form.valorTotal || form.totalParcelas < 2) return 0
  return form.valorTotal / form.totalParcelas
})

const previewParcelamento = computed(() => {
  if (form.subtipo !== 'parcelado' || !form.valorTotal || form.totalParcelas < 2) return null
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  return {
    texto: `${form.totalParcelas}x de ${fmt(valorPorParcela.value)}`,
    total: fmt(form.valorTotal),
  }
})

const labelBotaoSubmit = computed(() => {
  if (form.subtipo === 'parcelado') return `Criar ${form.totalParcelas} parcelas`
  if (form.subtipo === 'recorrente') return 'Salvar assinatura'
  return 'Salvar lançamento'
})

function onTipoChange(tipo: TipoLancamento) {
  form.tipo = tipo
  form.categoria = ''
  if (tipo !== 'cartao') form.subtipo = 'avulso'
}

async function handleSubmit() {
  if (!form.valorTotal || form.valorTotal <= 0) {
    errorMsg.value = 'Informe um valor maior que zero.'
    return
  }
  if (!form.categoria) {
    errorMsg.value = 'Selecione uma categoria.'
    return
  }

  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (form.tipo === 'cartao' && form.subtipo === 'recorrente') {
      // Salva como assinatura
      await financeiroStore.criarAssinatura({
        descricao: form.descricao,
        valor: form.valorTotal,
        categoria: form.categoria,
        dia_cobranca: form.diaCobranca,
      })
      successMsg.value = 'Assinatura criada com sucesso!'
    } else if (form.tipo === 'cartao' && form.subtipo === 'parcelado') {
      // Cria todas as parcelas
      await financeiroStore.criarParcelamento(
        {
          descricao: form.descricao,
          valor: valorPorParcela.value,
          tipo: 'cartao',
          categoria: form.categoria,
          ano: form.ano,
        },
        form.totalParcelas,
        form.mes,
        form.ano,
      )
      successMsg.value = `${form.totalParcelas} parcelas criadas com sucesso!`
    } else {
      // Avulso (receita / despesa / cartao avulso)
      await financeiroStore.adicionarLancamento({
        tipo: form.tipo,
        descricao: form.descricao,
        valor: form.valorTotal,
        categoria: form.categoria,
        mes: form.mes,
        ano: form.ano,
        is_recorrente: false,
        total_parcelas: null,
        parcela_atual: null,
        lancamento_pai_id: null,
      })
      successMsg.value = 'Lançamento salvo com sucesso!'
    }

    form.descricao = ''
    form.valorTotal = null
    form.categoria = ''
    form.subtipo = 'avulso'

    setTimeout(() => {
      router.push({ name: 'lancamentos' })
    }, 900)
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Erro ao salvar.'
  } finally {
    isLoading.value = false
  }
}

async function handleLogout() {
  await authStore.signOut()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.novo__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.novo__back {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.novo__back:hover {
  background: var(--color-card-hover);
  color: var(--color-text-primary);
}

.novo__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-extrabold);
}

.novo__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.novo__tipo-group {
  display: flex;
  gap: var(--space-2);
}

.novo__tipo-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
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
  min-height: 72px;
}

.novo__tipo-btn:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

.novo__tipo-btn--receita {
  background: var(--color-receita-dim);
  border-color: var(--color-receita);
  color: var(--color-receita);
}

.novo__tipo-btn--despesa {
  background: var(--color-despesa-dim);
  border-color: var(--color-despesa);
  color: var(--color-despesa);
}

.novo__tipo-btn--cartao {
  background: var(--color-cartao-dim);
  border-color: var(--color-cartao);
  color: var(--color-cartao);
}

/* Sub-tipos cartão */
.novo__subtipo-group {
  display: flex;
  gap: var(--space-2);
}

.novo__subtipo-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-3) var(--space-2);
  border-radius: var(--radius-md);
  background: var(--color-card-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 76px;
}

.novo__subtipo-btn--active {
  background: var(--color-cartao-dim);
  border-color: var(--color-cartao);
  color: var(--color-cartao);
}

.novo__subtipo-icon {
  font-size: 1.25rem;
}

.novo__subtipo-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.novo__subtipo-desc {
  font-size: 10px;
  opacity: 0.8;
}

/* Preview parcelamento */
.novo__preview-parcelado {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-cartao-dim);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}

.novo__preview-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.novo__preview-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.novo__preview-main {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--color-cartao);
}

.novo__preview-sub {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.novo__label-hint {
  color: var(--color-text-muted);
  font-weight: var(--font-regular);
  font-size: var(--text-xs);
  margin-left: var(--space-1);
}

.novo__periodo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.novo__error {
  font-size: var(--text-sm);
  color: var(--color-despesa);
  background: var(--color-despesa-dim);
  border: 1px solid rgba(255, 71, 87, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
}

.novo__success {
  font-size: var(--text-sm);
  color: var(--color-receita);
  background: var(--color-receita-dim);
  border: 1px solid rgba(0, 200, 150, 0.2);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
}

/* ── ≥ 768px: form mais espaçoso ───────────────────────────── */
@media (min-width: 768px) {
  .novo__form {
    max-width: 560px;
    margin: 0 auto;
  }
}

/* ── ≥ 1024px: form com layout de 2 colunas para campos duplos */
@media (min-width: 1024px) {
  .novo__form {
    max-width: 640px;
    margin: 0 auto;
  }
}
</style>
