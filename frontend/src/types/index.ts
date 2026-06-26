export type Usuario = {
  id: number
  nome: string
  cpf: string
  saldo: number
  denuncia?: boolean
  recebeu_denuncia?: number
  role?: "usuario" | "auditor"
  image?: string
}

export type Transacao = {
  id: number
  valor: number
  data_transacao: string
  descricao: string
  e2e_id: string | null
  status: string
  origem: Pick<Usuario, "id" | "nome">
  destino: Pick<Usuario, "id" | "nome">
}

export type Denuncia = {
  id: number
  valor_roubado: number
  data_denuncia: string
  sla_limite: string | null
  e2e_id: string | null
  motivo: string
  descricao: string | null
  status: string
  transacao_id: number | null
  denunciado: Pick<Usuario, "id" | "nome" | "cpf"> | null
}

export type DenunciaAuditoria = {
  id: number
  valor_roubado: number
  data_denuncia: string
  sla_limite: string | null
  motivo: string
  descricao: string | null
  status: string
  denunciado: (Pick<Usuario, "id" | "nome" | "cpf"> & { saldo: number }) | null
  denunciante: Pick<Usuario, "id" | "nome" | "cpf"> | null
}
