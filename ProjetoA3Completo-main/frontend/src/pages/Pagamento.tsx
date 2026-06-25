import "@/index.css"
import { useEffect, useState } from "react"
import { usuarioService } from "@/services/usuarioService"
import { useUsuario } from "@/context/UserContext"
import type { Usuario } from "@/types"
import { BanknoteArrowUp, Bell, Menu, Search, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"

function formatarCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4") // Formata CPF no padrão xxx.xxx.xxx-xx
}

function Pagamento() {
  const { idUsuario, usuario: usuarioLogado } = useUsuario()
  const [contatos, setContatos] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState("")
  const [mostrarBusca, setMostrarBusca] = useState(false)

  useEffect(() => {
    setCarregando(true)
    usuarioService
      .listarTodos()
      .then((todos) => {
        const filtrados = todos.filter((u) => u.id !== idUsuario)
        const ordenados = filtrados.sort((a, b) => {
          const aDenunciado = (a.recebeu_denuncia ?? 0) > 0 || Boolean(a.denuncia)
          const bDenunciado = (b.recebeu_denuncia ?? 0) > 0 || Boolean(b.denuncia)
          return Number(bDenunciado) - Number(aDenunciado)
        })
        setContatos(ordenados)
      })
      .catch(() => setContatos([]))
      .finally(() => setCarregando(false))
  }, [idUsuario])

  const temDenuncia = (u: Usuario) =>
    Boolean(u.denuncia) || (u.recebeu_denuncia ?? 0) > 0

  const contatosFiltrados = busca.trim()
    ? contatos.filter((u) =>
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.cpf.includes(busca.replace(/\D/g, ""))
      )
    : contatos

  return (
    <main className="bg-neutral-950 flex items-center justify-center pb-20">
      <div className="flex flex-col bg-gradient-1 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px]">
        <header className="flex items-center py-10 px-8 justify-between">
          <span className="text-base">
            {usuarioLogado ? `Olá, ${usuarioLogado.nome}` : "Olá!"}
          </span>
          <div className="flex gap-4">
            <Bell className="cursor-pointer" />
            <Menu className="cursor-pointer" />
          </div>
        </header>

        <div className="flex flex-col bg-gradient-1 rounded-t-4xl">
          <div className="flex flex-col bg-white rounded-t-4xl py-12 px-8 text-black min-h-screen">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Meus contatos</span>
              <button
                onClick={() => setMostrarBusca((v) => !v)}
                className="cursor-pointer"
                aria-label="Pesquisar contatos"
              >
                <Search size={20} className="text-gray-500" />
              </button>
            </div>

            {mostrarBusca && (
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou CPF..."
                className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              />
            )}

            {carregando && (
              <div className="mt-8 text-center text-gray-400 text-sm">Carregando contatos...</div>
            )}

            {!carregando && contatosFiltrados.length === 0 && (
              <div className="mt-8 text-center text-gray-400 text-sm">
                {busca ? "Nenhum contato encontrado." : "Nenhum usuário disponível."}
              </div>
            )}

            <div className="flex flex-col mt-4">
              {contatosFiltrados.map((contato) => {
                const denunciado = temDenuncia(contato)
                const qtdDenuncias = contato.recebeu_denuncia ?? 0

                return (
                  <div key={contato.id} className="flex flex-col mt-3">
                    <div
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        denunciado
                          ? "bg-red-50 border border-red-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={contato.image || "/profileUrlPlaceHolder.png"}
                          alt={contato.nome}
                          className={`w-12 h-12 object-cover rounded-full bg-gray-200 ${
                            denunciado ? "border-2 border-red-400 opacity-70" : ""
                          }`}
                        />
                        <div className="flex flex-col">
                          <h2 className="uppercase text-sm font-semibold text-gray-800">
                            {contato.nome}
                          </h2>
                          <span className="text-xs text-gray-500">
                            CPF: {formatarCPF(contato.cpf)}
                          </span>
                          {denunciado && (
                            <span className="text-xs text-red-600 font-bold mt-1">
                              ⚠ {qtdDenuncias} denúncia{qtdDenuncias !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        to={`/pay/new/${contato.id}`}
                        aria-label={`Transferir para ${contato.nome}`}
                      >
                        {denunciado ? (
                          <AlertCircle color="#dc2626" size={26} />
                        ) : (
                          <BanknoteArrowUp color="#16a34a" size={26} />
                        )}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Pagamento
