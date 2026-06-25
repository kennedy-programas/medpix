import api from "@/lib/api"
import type { Transacao } from "@/tipos"

export const transacaoService = {
  listarPorUsuario: (usuarioId: number) =>
    api.get<Transacao[]>(`/transacoes?usuarioId=${usuarioId}`).then((r) => r.data),
}
