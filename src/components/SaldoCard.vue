<template>
  <div class="saldo-card" :class="`saldo-card--${tipo}`">
    <div class="saldo-card__header">
      <span class="saldo-card__icon">{{ icone }}</span>
      <span class="saldo-card__label">{{ label }}</span>
    </div>
    <div class="saldo-card__value">
      {{ formatarBRL(valor) }}
    </div>
    <div class="saldo-card__indicator" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type CardTipo = 'receita' | 'despesa' | 'cartao' | 'saldo'

const props = defineProps<{
  tipo: CardTipo
  label: string
  valor: number
}>()

const icones: Record<CardTipo, string> = {
  receita: '↑',
  despesa: '↓',
  cartao: '💳',
  saldo: '⚖',
}

const icone = computed(() => icones[props.tipo])

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}
</script>

<style scoped>
.saldo-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  position: relative;
  overflow: hidden;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-2);
}

.saldo-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.saldo-card__icon {
  font-size: var(--text-base);
  line-height: 1;
}

.saldo-card__label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.saldo-card__value {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  line-height: 1.2;
}

.saldo-card__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* Variantes por tipo */
.saldo-card--receita {
  border-color: rgba(0, 200, 150, 0.2);
}
.saldo-card--receita .saldo-card__value { color: var(--color-receita); }
.saldo-card--receita .saldo-card__indicator { background: var(--color-receita); }

.saldo-card--despesa {
  border-color: rgba(255, 71, 87, 0.2);
}
.saldo-card--despesa .saldo-card__value { color: var(--color-despesa); }
.saldo-card--despesa .saldo-card__indicator { background: var(--color-despesa); }

.saldo-card--cartao {
  border-color: rgba(74, 158, 255, 0.2);
}
.saldo-card--cartao .saldo-card__value { color: var(--color-cartao); }
.saldo-card--cartao .saldo-card__indicator { background: var(--color-cartao); }

.saldo-card--saldo {
  border-color: rgba(245, 197, 24, 0.2);
}
.saldo-card--saldo .saldo-card__value { color: var(--color-saldo); }
.saldo-card--saldo .saldo-card__indicator { background: var(--color-saldo); }
</style>
