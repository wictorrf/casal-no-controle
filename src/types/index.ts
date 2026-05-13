export type TipoLancamento = 'receita' | 'despesa' | 'cartao'
export type SubtipoCartao = 'avulso' | 'recorrente' | 'parcelado'

export interface Lancamento {
  id: string
  descricao: string
  valor: number
  tipo: TipoLancamento
  categoria: string
  mes: number
  ano: number
  user_id: string
  casal_id: string
  created_at: string
  // Campos de recorrência/parcelamento
  is_recorrente: boolean
  total_parcelas: number | null
  parcela_atual: number | null
  lancamento_pai_id: string | null
}

export interface LancamentoInput {
  descricao: string
  valor: number
  tipo: TipoLancamento
  categoria: string
  mes: number
  ano: number
  is_recorrente?: boolean
  total_parcelas?: number | null
  parcela_atual?: number | null
  lancamento_pai_id?: string | null
}

export interface Assinatura {
  id: string
  casal_id: string
  descricao: string
  valor: number
  categoria: string
  dia_cobranca: number
  ativa: boolean
  created_at: string
}

export interface AssinaturaInput {
  descricao: string
  valor: number
  categoria: string
  dia_cobranca: number
}

export interface ResumoMensal {
  totalReceitas: number
  totalDespesas: number
  totalCartao: number
  saldo: number
}

export const CATEGORIAS_RECEITA = [
  { value: 'salario', label: 'Salário' },
  { value: 'renda_extra', label: 'Renda Extra' },
  { value: 'investimentos', label: 'Investimentos' },
  { value: 'outros_receita', label: 'Outros' },
] as const

export const CATEGORIAS_DESPESA = [
  { value: 'moradia', label: 'Moradia' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'lazer', label: 'Lazer' },
  { value: 'reserva', label: 'Reserva' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'outros_despesa', label: 'Outros' },
] as const

export const CATEGORIAS_CARTAO = [
  { value: 'mercado', label: 'Mercado' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'vestuario', label: 'Vestuário' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'assinaturas', label: 'Assinaturas' },
  { value: 'farmacia', label: 'Farmácia' },
  { value: 'outros_cartao', label: 'Outros' },
] as const

export const CATEGORIAS_ASSINATURA = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde' },
  { value: 'outros', label: 'Outros' },
] as const

export const ICONES_CATEGORIA_ASSINATURA: Record<string, string> = {
  streaming: '🎬',
  tecnologia: '💻',
  educacao: '📚',
  saude: '🏥',
  outros: '📦',
}

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const
