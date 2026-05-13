<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isActive(item.to) }"
      :aria-label="item.label"
    >
      <div class="bottom-nav__icon-wrap" :class="{ 'bottom-nav__icon-wrap--fab': item.fab }">
        <component :is="item.icon" class="bottom-nav__icon" />
      </div>
      <span class="bottom-nav__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { defineComponent, h } from 'vue'

const route = useRoute()

function isActive(path: string): boolean {
  return route.path === path
}

const IconDashboard = defineComponent({
  render: () =>
    h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }),
    ]),
})

const IconList = defineComponent({
  render: () =>
    h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('line', { x1: 8, y1: 6, x2: 21, y2: 6 }),
      h('line', { x1: 8, y1: 12, x2: 21, y2: 12 }),
      h('line', { x1: 8, y1: 18, x2: 21, y2: 18 }),
      h('line', { x1: 3, y1: 6, x2: 3.01, y2: 6 }),
      h('line', { x1: 3, y1: 12, x2: 3.01, y2: 12 }),
      h('line', { x1: 3, y1: 18, x2: 3.01, y2: 18 }),
    ]),
})

const IconPlus = defineComponent({
  render: () =>
    h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 }, [
      h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
      h('line', { x1: 5, y1: 12, x2: 19, y2: 12 }),
    ]),
})

const IconSubscription = defineComponent({
  render: () =>
    h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }),
      h('path', { d: 'M9 12l2 2 4-4' }),
    ]),
})

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, fab: false },
  { to: '/lancamentos', label: 'Lançamentos', icon: IconList, fab: false },
  { to: '/novo', label: 'Novo', icon: IconPlus, fab: true },
  { to: '/assinaturas', label: 'Assinaturas', icon: IconSubscription, fab: false },
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--max-width);
  height: var(--bottom-nav-height);
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 var(--space-2);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 100;
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  min-height: 48px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
  text-decoration: none;
  cursor: pointer;
}

.bottom-nav__item:hover {
  color: var(--color-text-secondary);
}

.bottom-nav__item--active {
  color: var(--color-receita);
}

.bottom-nav__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.bottom-nav__icon-wrap--fab {
  background: var(--color-receita);
  border-radius: var(--radius-full);
  width: 48px;
  height: 48px;
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-glow-receita);
}

.bottom-nav__item--active .bottom-nav__icon-wrap:not(.bottom-nav__icon-wrap--fab) {
  background: var(--color-receita-dim);
}

.bottom-nav__icon {
  display: block;
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: var(--font-medium);
  line-height: 1;
}

.bottom-nav__item--active .bottom-nav__icon-wrap--fab {
  transform: scale(1.05);
}

/* ── ≥ 1024px: sidebar lateral ───────────────────────────────── */
@media (min-width: 1024px) {
  .bottom-nav {
    /* Reposiciona para a lateral esquerda, alinhado com o #app */
    left:      var(--app-offset);
    right:     auto;
    bottom:    0;
    top:       0;
    transform: none;
    width:     var(--sidebar-width);
    height:    100vh;
    height:    100dvh;
    max-width: none;

    /* Layout vertical */
    flex-direction:  column;
    justify-content: flex-start;
    align-items:     stretch;
    padding:         var(--space-4) var(--space-3);
    padding-top:     calc(var(--header-height) + var(--space-6));
    gap:             var(--space-1);

    /* Visual */
    border-top:   none;
    border-right: 1px solid var(--color-border);
    border-bottom: none;
    overflow-y: auto;
  }

  .bottom-nav__item {
    flex-direction: row;
    justify-content: flex-start;
    align-items:    center;
    flex:           none;
    width:          100%;
    min-height:     48px;
    padding:        0 var(--space-3);
    border-radius:  var(--radius-md);
    gap:            var(--space-3);
  }

  .bottom-nav__item:hover {
    background: var(--color-card-hover);
  }

  .bottom-nav__item--active {
    background: var(--color-receita-dim);
    color:      var(--color-receita);
  }

  /* Ícone menor na sidebar */
  .bottom-nav__icon-wrap {
    width:         36px;
    height:        36px;
    border-radius: var(--radius-md);
    flex-shrink:   0;
    background:    none;
  }

  /* O FAB vira botão primário na sidebar */
  .bottom-nav__icon-wrap--fab {
    width:         36px;
    height:        36px;
    border-radius: var(--radius-md);
    background:    var(--color-receita);
    box-shadow:    none;
  }

  .bottom-nav__item--active .bottom-nav__icon-wrap:not(.bottom-nav__icon-wrap--fab) {
    background: transparent;
  }

  .bottom-nav__label {
    font-size:   var(--text-sm);
    font-weight: var(--font-medium);
    line-height: 1;
  }

  /* Remove o scale do FAB ativo na sidebar */
  .bottom-nav__item--active .bottom-nav__icon-wrap--fab {
    transform: none;
  }
}
</style>
