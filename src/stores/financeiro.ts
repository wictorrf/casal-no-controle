import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { Lancamento, LancamentoInput, ResumoMensal, Assinatura, AssinaturaInput } from '@/types'
import dayjs from 'dayjs'

export const useFinanceiroStore = defineStore('financeiro', () => {
  const lancamentos = ref<Lancamento[]>([])
  const assinaturas = ref<Assinatura[]>([])
  const isLoading = ref(false)
  const isLoadingAssinaturas = ref(false)
  const error = ref<string | null>(null)

  const mesSelecionado = ref(dayjs().month() + 1)
  const anoSelecionado = ref(dayjs().year())

  // ── Lançamentos ──────────────────────────────────────────────
  const lancamentosFiltrados = computed(() =>
    lancamentos.value.filter(
      (l) => l.mes === mesSelecionado.value && l.ano === anoSelecionado.value,
    ),
  )

  const receitas = computed(() =>
    lancamentosFiltrados.value.filter((l) => l.tipo === 'receita'),
  )

  const despesas = computed(() =>
    lancamentosFiltrados.value.filter((l) => l.tipo === 'despesa'),
  )

  const cartao = computed(() =>
    lancamentosFiltrados.value.filter((l) => l.tipo === 'cartao'),
  )

  const parcelamentosAbertos = computed(() =>
    lancamentosFiltrados.value.filter(
      (l) => l.tipo === 'cartao' && l.total_parcelas !== null && l.total_parcelas > 0,
    ),
  )

  const resumo = computed<ResumoMensal>(() => {
    const totalReceitas = receitas.value.reduce((acc, l) => acc + l.valor, 0)
    const totalDespesas = despesas.value.reduce((acc, l) => acc + l.valor, 0)
    const totalCartao = cartao.value.reduce((acc, l) => acc + l.valor, 0)
    return {
      totalReceitas,
      totalDespesas,
      totalCartao,
      saldo: totalReceitas - totalDespesas - totalCartao,
    }
  })

  const categoriasDespesaAgrupadas = computed(() => {
    const grupos: Record<string, number> = {}
    ;[...despesas.value, ...cartao.value].forEach((l) => {
      grupos[l.categoria] = (grupos[l.categoria] ?? 0) + l.valor
    })
    return grupos
  })

  // ── Assinaturas ───────────────────────────────────────────────
  const assinaturasAtivas = computed(() =>
    assinaturas.value.filter((a) => a.ativa),
  )

  const totalAssinaturas = computed(() =>
    assinaturasAtivas.value.reduce((acc, a) => acc + a.valor, 0),
  )

  // ── Actions: Lançamentos ──────────────────────────────────────
  async function carregarLancamentos() {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('mes', mesSelecionado.value)
        .eq('ano', anoSelecionado.value)
        .order('created_at', { ascending: false })

      if (err) throw err
      lancamentos.value = data ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar lançamentos.'
    } finally {
      isLoading.value = false
    }
  }

  async function adicionarLancamento(input: LancamentoInput) {
    error.value = null
    const authStore = useAuthStore()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Usuário não autenticado.')
    if (!authStore.casalId) throw new Error('Casal não encontrado. Contate o administrador.')

    const { data, error: err } = await supabase
      .from('lancamentos')
      .insert({
        ...input,
        user_id: userData.user.id,
        casal_id: authStore.casalId,
        is_recorrente: input.is_recorrente ?? false,
        total_parcelas: input.total_parcelas ?? null,
        parcela_atual: input.parcela_atual ?? null,
        lancamento_pai_id: input.lancamento_pai_id ?? null,
      })
      .select()
      .single()

    if (err) throw err
    if (data) lancamentos.value.unshift(data)
    return data
  }

  async function criarParcelamento(
    base: Omit<LancamentoInput, 'mes' | 'parcela_atual' | 'total_parcelas' | 'lancamento_pai_id'>,
    totalParcelas: number,
    mesInicio: number,
    anoInicio: number,
  ) {
    const authStore = useAuthStore()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Usuário não autenticado.')
    if (!authStore.casalId) throw new Error('Casal não encontrado. Contate o administrador.')

    // Insere a primeira parcela para obter o pai
    const { data: primeiraParcela, error: errPrimeiro } = await supabase
      .from('lancamentos')
      .insert({
        ...base,
        user_id: userData.user.id,
        casal_id: authStore.casalId,
        mes: mesInicio,
        ano: anoInicio,
        is_recorrente: false,
        total_parcelas: totalParcelas,
        parcela_atual: 1,
        lancamento_pai_id: null,
      })
      .select()
      .single()

    if (errPrimeiro) throw errPrimeiro

    const paiId = primeiraParcela.id

    // Atualiza a primeira parcela com seu próprio ID como pai
    await supabase
      .from('lancamentos')
      .update({ lancamento_pai_id: paiId })
      .eq('id', paiId)

    primeiraParcela.lancamento_pai_id = paiId

    // Cria as parcelas restantes
    const demaisParcelas: LancamentoInput[] = []
    for (let i = 2; i <= totalParcelas; i++) {
      const mesOffset = mesInicio + i - 1
      const mesReal = ((mesOffset - 1) % 12) + 1
      const anoReal = anoInicio + Math.floor((mesOffset - 1) / 12)
      demaisParcelas.push({
        ...base,
        mes: mesReal,
        ano: anoReal,
        is_recorrente: false,
        total_parcelas: totalParcelas,
        parcela_atual: i,
        lancamento_pai_id: paiId,
      })
    }

    if (demaisParcelas.length > 0) {
      const { error: errDemais } = await supabase
        .from('lancamentos')
        .insert(
          demaisParcelas.map((p) => ({
            ...p,
            user_id: userData.user!.id,
            casal_id: authStore.casalId,
          })),
        )

      if (errDemais) throw errDemais
    }

    // Recarrega lançamentos do mês atual
    await carregarLancamentos()
    return primeiraParcela
  }

  async function removerLancamento(id: string) {
    error.value = null
    const { error: err } = await supabase.from('lancamentos').delete().eq('id', id)
    if (err) throw err
    lancamentos.value = lancamentos.value.filter((l) => l.id !== id)
  }

  function setMes(mes: number, ano: number) {
    mesSelecionado.value = mes
    anoSelecionado.value = ano
    carregarLancamentos()
  }

  // ── Actions: Assinaturas ──────────────────────────────────────
  async function fetchAssinaturas() {
    isLoadingAssinaturas.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('assinaturas')
        .select('*')
        .order('valor', { ascending: false })

      if (err) throw err
      assinaturas.value = data ?? []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar assinaturas.'
    } finally {
      isLoadingAssinaturas.value = false
    }
  }

  async function toggleAssinatura(id: string) {
    const assinatura = assinaturas.value.find((a) => a.id === id)
    if (!assinatura) return

    const novoStatus = !assinatura.ativa

    // Otimismo: atualiza UI antes da resposta
    assinatura.ativa = novoStatus

    const { error: err } = await supabase
      .from('assinaturas')
      .update({ ativa: novoStatus })
      .eq('id', id)

    if (err) {
      // Reverte em caso de erro
      assinatura.ativa = !novoStatus
      throw err
    }
  }

  async function criarAssinatura(input: AssinaturaInput) {
    const authStore = useAuthStore()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Usuário não autenticado.')
    if (!authStore.casalId) throw new Error('Casal não encontrado. Contate o administrador.')

    const { data, error: err } = await supabase
      .from('assinaturas')
      .insert({
        ...input,
        casal_id: authStore.casalId,
        ativa: true,
      })
      .select()
      .single()

    if (err) throw err
    if (data) assinaturas.value.unshift(data)
    return data
  }

  async function removerAssinatura(id: string) {
    const { error: err } = await supabase.from('assinaturas').delete().eq('id', id)
    if (err) throw err
    assinaturas.value = assinaturas.value.filter((a) => a.id !== id)
  }

  return {
    // Estado
    lancamentos,
    assinaturas,
    isLoading,
    isLoadingAssinaturas,
    error,
    mesSelecionado,
    anoSelecionado,
    // Computed lançamentos
    lancamentosFiltrados,
    receitas,
    despesas,
    cartao,
    parcelamentosAbertos,
    resumo,
    categoriasDespesaAgrupadas,
    // Computed assinaturas
    assinaturasAtivas,
    totalAssinaturas,
    // Actions lançamentos
    carregarLancamentos,
    adicionarLancamento,
    criarParcelamento,
    removerLancamento,
    setMes,
    // Actions assinaturas
    fetchAssinaturas,
    toggleAssinatura,
    criarAssinatura,
    removerAssinatura,
  }
})
