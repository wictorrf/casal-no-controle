import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/lancamentos',
      name: 'lancamentos',
      component: () => import('@/views/LancamentosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/novo',
      name: 'novo-lancamento',
      component: () => import('@/views/NovoLancamentoView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/assinaturas',
      name: 'assinaturas',
      component: () => import('@/views/AssinaturasView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/views/PerfilView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  const hasSession = !!data.session

  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && hasSession) {
    return { name: 'dashboard' }
  }
})

export default router
