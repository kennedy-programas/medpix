import "@/index.css"
import { denunciaService } from "@/services/denunciaService"
import { useUsuario } from "@/context/UserContext"
import type { Denuncia } from "@/types"
import { Bell, Menu, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const ROTULO_MOTIVO: Record<string, string> = {
  FRAUDE: "Fraude",
  GOLPE: "Golpe",
  ENGANO: "Engano",
  INVASAO_CONTA: "Invasão de conta",
  OUTROS: "Outros",
}

const ESTILOS_STATUS: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  EM_ANALISE: "bg-blue-100 text-blue-700",
  CONFIRMADA: "bg-green-100 text-green-700",
  RECUSADA: "bg-gray-100 text-gray-500",
  APROVADA_AGUARDANDO_FUNDOS: "bg-orange-100 text-orange-600",
}

const ROTULO_STATUS: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANALISE: "Em análise",
  CONFIRMADA: "Aprovada",
  RECUSADA: "Recusada",
  APROVADA_AGUARDANDO_FUNDOS: "Aguardando fundos",
}

function formatarCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

function Denuncias() {
  const { idUsuario, usuario } = useUsuario()
  const [denuncias, setDenuncias] = useState<Denuncia[]>([])
  const [carregando, setCarregando] = useState(true)
  const [idConfirmacao, setIdConfirmacao] = useState<number | null>(null)
  const [removendo, setRemovendo] = useState(false)

  useEffect(() => {
    setCarregando(true)
    denunciaService
      .listarPorDenunciante(idUsuario)
      .then(setDenuncias)
      .catch(() => setDenuncias([]))
      .finally(() => setCarregando(false))
  }, [idUsuario])

  async function removerDenuncia(id: number) {
    setRemovendo(true)
    try {
      await denunciaService.remover(id, idUsuario)
      setDenuncias((prev) => prev.filter((d) => d.id !== id))
      toast.success("Denúncia removida com sucesso.")
    } catch {
      toast.error("Não foi possível remover a denúncia.")
    } finally {
      setRemovendo(false)
      setIdConfirmacao(null)
    }
  }

  return (
    <main className="bg-neutral-950 flex items-center justify-center pb-20">
      <div className="flex flex-col bg-gradient-1 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px]">
        <header className="flex items-center py-10 px-8 justify-between">
          <span className="text-base">
            {usuario ? `Olá, ${usuario.nome}` : "Carregando..."}
          </span>
          <div className="flex gap-4">
            <Bell className="cursor-pointer" />
            <Menu className="cursor-pointer" />
          </div>
        </header>

        <div className="flex flex-col bg-gradient-1 rounded-t-4xl">
          <div className="flex flex-col bg-white rounded-t-4xl py-12 px-8 text-black min-h-screen">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-medium">Minhas Denúncias</span>
              <span className="text-xs text-gray-400">
                {denuncias.length} registrada{denuncias.length !== 1 ? "s" : ""}
              </span>
            </div>

            {carregando && (
              <p className="mt-8 text-center text-gray-400 text-sm">Carregando...</p>
            )}

            {!carregando && denuncias.length === 0 && (
              <div className="mt-16 flex flex-col items-center gap-3 text-center">
                <ShieldCheck size={48} className="text-green-400" />
                <p className="text-gray-500 text-sm">
                  Você não registrou nenhuma denúncia ainda.
                </p>
              </div>
            )}

            {!carregando &&
              denuncias.map((denuncia) => {
                const data = new Date(denuncia.data_denuncia).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                const estiloStatus = ESTILOS_STATUS[denuncia.status] || "bg-gray-100 text-gray-500"
                const rotuloMotivo = ROTULO_MOTIVO[denuncia.motivo] || denuncia.motivo
                const rotuloStatus = ROTULO_STATUS[denuncia.status] || denuncia.status.replace(/_/g, " ")
                const podeRemover = denuncia.status === "PENDENTE"

                return (
                  <div
                    key={denuncia.id}
                    className="flex flex-col mt-5 border border-red-100 rounded-xl p-4 bg-red-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <ShieldAlert size={22} className="text-red-500" />
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-sm font-semibold text-gray-800 uppercase">
                            {denuncia.denunciado?.nome ?? "Usuário removido"}
                          </h2>
                          <span className="text-xs text-gray-500">
                            {denuncia.denunciado?.cpf
                              ? `CPF: ${formatarCPF(denuncia.denunciado.cpf)}`
                              : "—"}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-500">
                        {Number(denuncia.valor_roubado).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">{data}</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {rotuloMotivo}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estiloStatus}`}>
                          {rotuloStatus}
                        </span>
                      </div>
                    </div>

                    {denuncia.motivo === "OUTROS" && denuncia.descricao && (
                      <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">
                        "{denuncia.descricao}"
                      </p>
                    )}

                    {podeRemover && (
                      idConfirmacao === denuncia.id ? (
                        <div className="mt-3 flex items-center justify-between bg-red-100 rounded-lg px-3 py-2">
                          <span className="text-xs text-red-700 font-medium">Confirmar remoção?</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIdConfirmacao(null)}
                              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => removerDenuncia(denuncia.id)}
                              disabled={removendo}
                              className="text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2 py-1 rounded font-medium transition-colors"
                            >
                              {removendo ? "Removendo..." : "Remover"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIdConfirmacao(denuncia.id)}
                          className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors self-end ml-auto"
                        >
                          <Trash2 size={13} />
                          Remover denúncia
                        </button>
                      )
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Denuncias
