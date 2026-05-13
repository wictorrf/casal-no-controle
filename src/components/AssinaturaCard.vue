<template>
  <div class="assinatura-card" :class="{ 'assinatura-card--inativa': !assinatura.ativa }">
    <div class="assinatura-card__left">
      <div class="assinatura-card__icon">
        {{ iconeCategoria }}
      </div>
      <div class="assinatura-card__info">
        <div class="assinatura-card__name-row">
          <span class="assinatura-card__name">{{ assinatura.descricao }}</span>
          <span
            class="assinatura-card__badge"
            :class="assinatura.ativa ? 'assinatura-card__badge--ativa' : 'assinatura-card__badge--inativa'"
          >
            {{ assinatura.ativa ? 'ATIVA' : 'INATIVA' }}
          </span>
        </div>
        <span class="assinatura-card__dia">Cobra dia {{ assinatura.dia_cobranca }}</span>
      </div>
    </div>

    <div class="assinatura-card__right">
      <span class="assinatura-card__valor" :class="{ 'assinatura-card__valor--riscado': !assinatura.ativa }">
        {{ formatarBRL(assinatura.valor) }}
      </span>
      <div class="assinatura-card__actions">
        <button
          class="assinatura-card__toggle"
          :class="{ 'assinatura-card__toggle--on': assinatura.ativa }"
          :title="assinatura.ativa ? 'Desativar assinatura' : 'Ativar assinatura'"
          @click="emit('toggle', assinatura.id)"
          :aria-label="assinatura.ativa ? 'Desativar' : 'Ativar'"
        >
          <div class="assinatura-card__toggle-thumb" />
        </button>
        <button
          class="assinatura-card__delete"
          title="Remover assinatura"
          aria-label="Remover assinatura"
          @click="emit('deletar', assinatura.id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Assinatura } from '@/types'
import { ICONES_CATEGORIA_ASSINATURA } from '@/types'

const props = defineProps<{
  assinatura: Assinatura
}>()

const emit = defineEmits<{
  toggle: [id: string]
  deletar: [id: string]
}>()

const iconeCategoria = computed(
  () => ICONES_CATEGORIA_ASSINATURA[props.assinatura.categoria] ?? '📦',
)

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}
</script>

<style scoped>
.assinatura-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  min-height: 72px;
  gap: var(--space-3);
  transition: opacity var(--transition-base), background var(--transition-fast);
}

.assinatura-card:hover {
  background: var(--color-card-hover);
}

.assinatura-card--inativa {
  opacity: 0.5;
}

.assinatura-card__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.assinatura-card__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-cartao-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.assinatura-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.assinatura-card__name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.assinatura-card__name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.assinatura-card__badge {
  font-size: 9px;
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: var(--radius-full);
}

.assinatura-card__badge--ativa {
  background: rgba(0, 200, 150, 0.15);
  color: var(--color-receita);
  border: 1px solid rgba(0, 200, 150, 0.3);
}

.assinatura-card__badge--inativa {
  background: rgba(139, 148, 158, 0.12);
  color: var(--color-text-muted);
  border: 1px solid rgba(139, 148, 158, 0.2);
}

.assinatura-card__dia {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.assinatura-card__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  flex-shrink: 0;
}

.assinatura-card__valor {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--color-cartao);
  transition: color var(--transition-fast);
}

.assinatura-card__valor--riscado {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.assinatura-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Toggle switch */
.assinatura-card__toggle {
  width: 40px;
  height: 22px;
  border-radius: var(--radius-full);
  background: rgba(139, 148, 158, 0.2);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background var(--transition-base);
  flex-shrink: 0;
}

.assinatura-card__toggle--on {
  background: var(--color-receita);
}

.assinatura-card__toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  transition: transform var(--transition-base);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.assinatura-card__toggle--on .assinatura-card__toggle-thumb {
  transform: translateX(18px);
}

.assinatura-card__delete {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  border: none;
}

.assinatura-card__delete:hover {
  background: var(--color-despesa-dim);
  color: var(--color-despesa);
}
</style>
