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

  /**
   * Busca o casal_id do usuário.
   * Se não existir, tenta criar automaticamente via RPC `criar_casal`.
   */
  async function fetchCasalId(userId: string): Promise<void> {
    // 1. Tenta buscar casal existente
    const { data, error: fetchError } = await supabase
      .from('casal_membros')
      .select('casal_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (data?.casal_id) {
      casalId.value = data.casal_id
      return
    }

    // 2. Nenhum casal encontrado (ou tabela inexistente) — tenta criar via RPC
    if (!fetchError || fetchError.code !== 'PGRST116') {
      const { data: novoCasalId, error: rpcError } = await supabase
        .rpc('criar_casal', { nome_casal: 'Meu Casal' })

      if (!rpcError && novoCasalId) {
        casalId.value = novoCasalId as string
        return
      }
    }

    casalId.value = null
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
