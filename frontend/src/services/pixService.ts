import api from "@/lib/api"
import type { Usuario } from "@/tipos"

interface PixPayload {
  remetenteId: number
  destinatarioId: number
  valor: number
  idempotencyKey: string
}

interface PixResponse {
  sucesso: boolean
  remetente: Usuario
  destinatario: Usuario
  data_transacao: string
  e2e_id: string
}

export const pixService = {
  transferir: (dados: PixPayload) =>
    api.post<PixResponse>("/pix", dados).then((r) => r.data),
}
