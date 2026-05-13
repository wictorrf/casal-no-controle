<template>
  <header class="header">
    <div class="header__left">
      <span class="header__logo">💰</span>
      <div class="header__title-group">
        <h1 class="header__app-name">Casal no Controle</h1>
        <button class="header__month-btn" @click="emit('openMonthPicker')">
          <span class="header__month-text">{{ nomeMesAtual }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
    <div class="header__right">
      <button
        class="header__avatar"
        @click="showDropdown = !showDropdown"
        :title="nomeUsuario"
        :aria-expanded="showDropdown"
        aria-haspopup="true"
      >
        <span>{{ inicialUsuario }}</span>
      </button>

      <!-- Dropdown de perfil -->
      <Transition name="dropdown">
        <div v-if="showDropdown" class="header__dropdown" @click.stop>
          <div class="header__dropdown-user">
            <span class="header__dropdown-email">{{ email ?? 'Usuário' }}</span>
          </div>
          <div class="header__dropdown-divider" />
          <RouterLink
            to="/perfil"
            class="header__dropdown-item"
            @click="showDropdown = false"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Meu Perfil
          </RouterLink>
          <button class="header__dropdown-item header__dropdown-item--danger" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sair
          </button>
        </div>
      </Transition>
    </div>
  </header>

  <!-- Overlay via Teleport: fica no body mas abaixo do header (z-index 99 < 100) -->
  <Teleport to="body">
    <div v-if="showDropdown" class="header__overlay" @click="showDropdown = false" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MESES } from '@/types'

const props = defineProps<{
  mes: number
  ano: number
  email?: string
}>()

const emit = defineEmits<{
  logout: []
  openMonthPicker: []
}>()

const showDropdown = ref(false)

const nomeMesAtual = computed(() => `${MESES[props.mes - 1]} ${props.ano}`)
const nomeUsuario = computed(() => props.email ?? 'Usuário')
const inicialUsuario = computed(() =>
  props.email ? props.email.charAt(0).toUpperCase() : 'U',
)

function handleLogout() {
  showDropdown.value = false
  emit('logout')
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--max-width);
  height: var(--header-height);
  background: rgba(13, 15, 20, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  z-index: 100;
}

.header__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header__logo {
  font-size: 1.5rem;
}

.header__title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header__app-name {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.header__month-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-family: var(--font-body);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: color var(--transition-fast);
  background: none;
  border: none;
  padding: 0;
}

.header__month-btn:hover {
  color: var(--color-text-primary);
}

.header__month-text {
  text-transform: capitalize;
}

.header__right {
  position: relative;
  display: flex;
  align-items: center;
}

.header__avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-cartao), var(--color-receita));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  color: white;
  cursor: pointer;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  border: none;
}

.header__avatar:hover {
  opacity: 0.85;
  transform: scale(1.05);
}

/* Dropdown */
.header__dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  min-width: 200px;
  background: var(--color-card);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 110;
}

.header__dropdown-user {
  padding: var(--space-3) var(--space-4);
}

.header__dropdown-email {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  word-break: break-all;
}

.header__dropdown-divider {
  height: 1px;
  background: var(--color-border);
}

.header__dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: background var(--transition-fast);
}

.header__dropdown-item:hover {
  background: var(--color-card-hover);
}

.header__dropdown-item--danger {
  color: var(--color-despesa);
}

.header__dropdown-item--danger:hover {
  background: var(--color-despesa-dim);
}

/* Overlay invisível — z-index 99 < 100 (header) para não bloquear o dropdown */
.header__overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

/* Animação dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── ≥ 768px: ligeiramente mais largo ───────────────────────── */
@media (min-width: 768px) {
  .header {
    padding: 0 var(--space-5);
  }
}

/* ── ≥ 1024px: desloca header para a direita da sidebar ──────── */
@media (min-width: 1024px) {
  .header {
    left:      calc(var(--app-offset) + var(--sidebar-width));
    right:     var(--app-offset);
    transform: none;
    max-width: none;
    width:     auto;
    padding:   0 24px;
    border-left: 1px solid var(--color-border);
  }

  .header__app-name {
    font-size: var(--text-base);
  }
}
</style>
