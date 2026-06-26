import api from "@/lib/api"
import type { Usuario } from "@/tipos"

export const usuarioService = {
  buscarPorId: (id: number) =>
    api.get<Usuario>(`/usuarios/${id}`).then((r) => r.data),

  listarTodos: () =>
    api.get<Usuario[]>("/usuarios").then((r) => r.data),
}
