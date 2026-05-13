import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const casalId = ref<string | null>(null)
  const isLoading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  /** Busca o casal_id do usuário logado via casal_membros */
  async function fetchCasalId(userId: string): Promise<void> {
    const { data } = await supabase
      .from('casal_membros')
      .select('casal_id')
      .eq('user_id', userId)
      .maybeSingle()

    casalId.value = data?.casal_id ?? null
  }

  async function initialize() {
    isLoading.value = true
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null

    if (user.value) {
      await fetchCasalId(user.value.id)
    }

    isLoading.value = false

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      if (newSession?.user) {
        await fetchCasalId(newSession.user.id)
      } else {
        casalId.value = null
      }
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    session.value = data.session
    user.value = data.user
    await fetchCasalId(data.user.id)
    return data
  }

  async function signOut() {
    // Limpa o estado local independente do resultado da API
    // (token expirado ou erro de rede não devem bloquear o logout)
    try {
      await supabase.auth.signOut()
    } catch {
      // ignora erro de rede — estado local é limpo abaixo
    }
    session.value = null
    user.value = null
    casalId.value = null
  }

  return {
    user,
    session,
    casalId,
    isLoading,
    isAuthenticated,
    initialize,
    signIn,
    signOut,
  }
})
