<template>
  <div class="parcelamento">
    <div class="parcelamento__header">
      <div class="parcelamento__left">
        <span class="parcelamento__icon">💳</span>
        <div class="parcelamento__info">
          <span class="parcelamento__descricao">{{ descricao }}</span>
          <span class="parcelamento__restante">
            Restam {{ parcelasRestantes }}x · {{ formatarBRL(valorRestante) }}
          </span>
        </div>
      </div>
      <div class="parcelamento__right">
        <span class="parcelamento__parcela-valor">{{ formatarBRL(valor) }}</span>
        <span class="parcelamento__contador">{{ parcelaAtual }}/{{ totalParcelas }}</span>
      </div>
    </div>

    <div class="parcelamento__bar-track">
      <div
        class="parcelamento__bar-fill"
        :style="{ width: `${progresso}%` }"
        :aria-valuenow="parcelaAtual"
        :aria-valuemin="1"
        :aria-valuemax="totalParcelas"
        role="progressbar"
      />
    </div>

    <div class="parcelamento__dots">
      <div
        v-for="i in totalParcelas"
        :key="i"
        class="parcelamento__dot"
        :class="{ 'parcelamento__dot--done': i <= parcelaAtual }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  descricao: string
  parcelaAtual: number
  totalParcelas: number
  valor: number
}>()

const progresso = computed(() =>
  Math.round((props.parcelaAtual / props.totalParcelas) * 100),
)

const parcelasRestantes = computed(
  () => props.totalParcelas - props.parcelaAtual,
)

const valorRestante = computed(
  () => props.valor * parcelasRestantes.value,
)

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}
</script>

<style scoped>
.parcelamento {
  background: var(--color-card);
  border: 1px solid rgba(74, 158, 255, 0.2);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.parcelamento__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.parcelamento__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.parcelamento__icon {
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.parcelamento__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.parcelamento__descricao {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.parcelamento__restante {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.parcelamento__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.parcelamento__parcela-valor {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-cartao);
}

.parcelamento__contador {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-cartao);
  background: var(--color-cartao-dim);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* Barra de progresso */
.parcelamento__bar-track {
  height: 6px;
  background: rgba(74, 158, 255, 0.12);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.parcelamento__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-cartao), #7ab8ff);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

/* Dots indicadores */
.parcelamento__dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.parcelamento__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(74, 158, 255, 0.2);
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.parcelamento__dot--done {
  background: var(--color-cartao);
}
</style>
