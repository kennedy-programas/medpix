import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { usuarioService } from "@/services/usuarioService"
import type { Usuario } from "@/types"

type TipoContextoUsuario = {
  idUsuario: number
  usuario: Usuario | null
  carregando: boolean
  isAuditor: boolean
  recarregar: () => void
}

const ContextoUsuario = createContext<TipoContextoUsuario>({
  idUsuario: 1,
  usuario: null,
  carregando: true,
  isAuditor: false,
  recarregar: () => {},
})

export function ProvedorUsuario({ children }: { children: ReactNode }) {
  const idUsuario = 1
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  function buscarUsuario() {
    setCarregando(true)
    usuarioService
      .buscarPorId(idUsuario)
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    buscarUsuario()
  }, [])

  const isAuditor = usuario?.role === "auditor"

  return (
    <ContextoUsuario.Provider value={{ idUsuario, usuario, carregando, isAuditor, recarregar: buscarUsuario }}>
      {children}
    </ContextoUsuario.Provider>
  )
}

export function useUsuario() {
  return useContext(ContextoUsuario)
}
