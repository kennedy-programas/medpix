import api from "@/lib/api"
import type { Denuncia } from "@/tipos"

interface RegistrarDenunciaPayload {
  id_denunciante: number
  id_denunciado: number
  valor_roubado: number
  transacao_id: number
  e2e_id?: string
  motivo: string
  descricao?: string
}

export const denunciaService = {
  listarPorDenunciante: (idDenunciante: number) =>
    api.get<Denuncia[]>(`/denuncias?id_denunciante=${idDenunciante}`).then((r) => r.data),

  registrar: (dados: RegistrarDenunciaPayload) =>
    api.post<Denuncia>("/denuncias", dados).then((r) => r.data),

  remover: (id: number, idDenunciante: number) =>
    api.delete(`/denuncias/${id}?id_denunciante=${idDenunciante}`),
}
