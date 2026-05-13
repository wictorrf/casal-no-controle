<template>
  <div class="lancamento-item" :class="`lancamento-item--${lancamento.tipo}`">
    <div class="lancamento-item__left">
      <div class="lancamento-item__icon">
        {{ tipoIcone }}
      </div>
      <div class="lancamento-item__info">
        <div class="lancamento-item__descricao-row">
          <span class="lancamento-item__descricao">{{ lancamento.descricao }}</span>
          <!-- Badge recorrente -->
          <span v-if="lancamento.is_recorrente" class="badge badge--recorrente">
            ● RECORRENTE
          </span>
          <!-- Badge parcelado -->
          <span
            v-else-if="lancamento.total_parcelas && lancamento.parcela_atual"
            class="badge badge--parcelado"
          >
            {{ lancamento.parcela_atual }}/{{ lancamento.total_parcelas }}
          </span>
        </div>
        <span class="lancamento-item__categoria">{{ lancamento.categoria }}</span>
      </div>
    </div>
    <div class="lancamento-item__right">
      <span class="lancamento-item__valor">
        {{ sinal }}{{ formatarBRL(lancamento.valor) }}
      </span>
      <button
        class="lancamento-item__delete"
        @click="emit('deletar', lancamento.id)"
        title="Remover lançamento"
        aria-label="Remover lançamento"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Lancamento } from '@/types'

const props = defineProps<{
  lancamento: Lancamento
}>()

const emit = defineEmits<{
  deletar: [id: string]
}>()

const tipoIcone = computed(() => {
  const icones = { receita: '↑', despesa: '↓', cartao: '💳' }
  return icones[props.lancamento.tipo]
})

const sinal = computed(() => (props.lancamento.tipo === 'receita' ? '+' : '-'))

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}
</script>

<style scoped>
.lancamento-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  min-height: 64px;
  gap: var(--space-3);
  transition: background var(--transition-fast);
}

.lancamento-item:hover {
  background: var(--color-card-hover);
}

.lancamento-item__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.lancamento-item__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-base);
  flex-shrink: 0;
}

.lancamento-item--receita .lancamento-item__icon {
  background: var(--color-receita-dim);
  color: var(--color-receita);
}

.lancamento-item--despesa .lancamento-item__icon {
  background: var(--color-despesa-dim);
  color: var(--color-despesa);
}

.lancamento-item--cartao .lancamento-item__icon {
  background: var(--color-cartao-dim);
  color: var(--color-cartao);
}

.lancamento-item__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.lancamento-item__descricao-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  min-width: 0;
}

.lancamento-item__descricao {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.lancamento-item__categoria {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: 9px;
  font-weight: var(--font-bold);
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge--recorrente {
  background: var(--color-cartao-dim);
  color: var(--color-cartao);
  border: 1px solid rgba(74, 158, 255, 0.25);
}

.badge--parcelado {
  background: rgba(245, 197, 24, 0.12);
  color: var(--color-saldo);
  border: 1px solid rgba(245, 197, 24, 0.25);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.lancamento-item__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.lancamento-item__valor {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
}

.lancamento-item--receita .lancamento-item__valor { color: var(--color-receita); }
.lancamento-item--despesa .lancamento-item__valor { color: var(--color-despesa); }
.lancamento-item--cartao  .lancamento-item__valor { color: var(--color-cartao); }

.lancamento-item__delete {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  border: none;
  flex-shrink: 0;
}

.lancamento-item__delete:hover {
  background: var(--color-despesa-dim);
  color: var(--color-despesa);
}
</style>
