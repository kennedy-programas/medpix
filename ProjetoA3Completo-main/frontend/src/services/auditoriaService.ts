import api from "@/lib/api"
import type { DenunciaAuditoria } from "@/types"

interface DecisaoPayload {
  auditor_id: number
  motivo: string
  observacoes?: string
}

export const auditoriaService = {
  listarPendentes: (auditor_id: number) =>
    api.get<DenunciaAuditoria[]>(`/auditoria/denuncias?auditor_id=${auditor_id}`).then((r) => r.data),

  aprovar: (id: number, dados: DecisaoPayload) =>
    api.post(`/auditoria/denuncias/${id}/aprovar`, dados).then((r) => r.data),

  recusar: (id: number, dados: DecisaoPayload) =>
    api.post(`/auditoria/denuncias/${id}/recusar`, dados).then((r) => r.data),
}
