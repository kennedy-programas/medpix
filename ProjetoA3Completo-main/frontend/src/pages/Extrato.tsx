import "@/index.css"
import { transacaoService } from "@/services/transacaoService"
import { denunciaService } from "@/services/denunciaService"
import { useUsuario } from "@/context/UserContext"
import type { Transacao } from "@/types"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BadgeX, Bell, Image, Menu, Search } from "lucide-react"
import { useEffect, useState, type JSX } from "react"
import { SiAmazon, SiNetflix, SiIfood, SiSteam, SiUber } from "react-icons/si"

const ICONES: Record<string, JSX.Element> = {
  Uber: <SiUber size={24} />,
  Netflix: <SiNetflix size={24} />,
  Ifood: <SiIfood size={24} />,
  Steam: <SiSteam size={24} />,
  Amazon: <SiAmazon size={24} />,
}

function formatarValor(valor: number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function agruparPorData(transacoes: Transacao[]) {
  const grupos: Record<string, Transacao[]> = {}
  transacoes.forEach((t) => {
    const chave = new Date(t.data_transacao)
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
      .toUpperCase()
    if (!grupos[chave]) grupos[chave] = []
    grupos[chave].push(t)
  })
  return grupos
}

function Extrato() {
  const { idUsuario, usuario } = useUsuario()
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [carregando, setCarregando] = useState(false)
  // Rastreia por transacao_id (sempre presente); e2e_id ainda é enviado ao backend quando disponível
  const [denunciadas, setDenunciadas] = useState<Set<number>>(new Set())
  const [denunciaPendente, setDenunciaPendente] = useState<Transacao | null>(null)
  const [motivoDenuncia, setMotivoDenuncia] = useState("FRAUDE")
  const [descricaoOutros, setDescricaoOutros] = useState("")
  const [enviandoDenuncia, setEnviandoDenuncia] = useState(false)

  useEffect(() => {
    setCarregando(true)
    Promise.all([
      transacaoService.listarPorUsuario(idUsuario),
      denunciaService.listarPorDenunciante(idUsuario),
    ])
      .then(([transacoes, denuncias]) => {
        setTransacoes(transacoes)
        const idsJaDenunciados = new Set<number>(
          denuncias
            .map((d) => d.transacao_id)
            .filter((id): id is number => id != null)
        )
        setDenunciadas(idsJaDenunciados)
      })
      .catch(() => toast.error("Erro ao carregar transações."))
      .finally(() => setCarregando(false))
  }, [idUsuario])

  async function confirmarDenuncia() {
    const item = denunciaPendente
    const motivo = motivoDenuncia
    if (!item || enviandoDenuncia) return

    setEnviandoDenuncia(true)
    try {
      await denunciaService.registrar({
        id_denunciante: idUsuario,
        id_denunciado: item.destino.id,
        valor_roubado: item.valor,
        transacao_id: item.id,
        e2e_id: item.e2e_id ?? undefined,
        motivo,
        descricao: motivo === "OUTROS" ? descricaoOutros.trim() || undefined : undefined,
      })
      setDenunciadas((prev) => new Set(prev).add(item.id))
      setDenunciaPendente(null)
      setMotivoDenuncia("FRAUDE")
      setDescricaoOutros("")
      toast.success("Denúncia registrada com sucesso.")
    } catch (err: unknown) {
      const erro = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      toast.error(erro || "Erro ao registrar denúncia.")
    } finally {
      setEnviandoDenuncia(false)
    }
  }

  const transacoesPorData = agruparPorData(transacoes)

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
            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Transações</span>
              <Search className="cursor-pointer text-gray-500" size={20} />
            </div>

            {carregando && (
              <p className="mt-6 text-center text-gray-400 text-sm">Carregando transações...</p>
            )}

            {!carregando && Object.keys(transacoesPorData).length === 0 && (
              <p className="mt-8 text-center text-gray-400 text-sm">Nenhuma transação encontrada.</p>
            )}

            {!carregando &&
              Object.entries(transacoesPorData).map(([data, itens]) => (
                <div key={data} className="flex flex-col mt-8">
                  <span className="text-xs text-gray-400 font-medium uppercase">{data}</span>

                  {itens.map((item) => {
                    const isSaida = item.origem.id === idUsuario
                    // Verifica pelo transacao_id — funciona com ou sem e2e_id
                    const jaDenunciada = denunciadas.has(item.id)
                    const horario = new Date(item.data_transacao).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    const icone = ICONES[item.descricao] || <Image size={24} />

                    return (
                      <div key={item.id} className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          {isSaida ? (
                            <button
                              title={jaDenunciada ? "Transação já denunciada" : "Denunciar esta transação"}
                              disabled={jaDenunciada}
                              onClick={() => {
                                if (jaDenunciada) return
                                setDenunciaPendente(item)
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                jaDenunciada
                                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                  : "bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
                              }`}
                            >
                              <BadgeX size={22} />
                            </button>
                          ) : (
                            <div className="p-2 rounded-lg bg-gray-50">{icone}</div>
                          )}

                          <div className="flex flex-col">
                            <h2 className="text-sm font-medium text-gray-800">
                              {item.descricao || "PIX"}
                            </h2>
                            <span className="text-xs text-gray-400">
                              {horario} · {isSaida ? `Para ${item.destino.nome}` : `De ${item.origem.nome}`}
                            </span>
                            {item.e2e_id && (
                              <span className="text-[10px] text-gray-300 font-mono mt-0.5 truncate max-w-[180px]">
                                {item.e2e_id}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-sm font-semibold ${
                            isSaida ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          {isSaida ? "-" : "+"}{formatarValor(item.valor)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>

      <Dialog
        open={!!denunciaPendente}
        onOpenChange={(aberto: boolean) => {
          if (!aberto && !enviandoDenuncia) {
            setDenunciaPendente(null)
            setMotivoDenuncia("FRAUDE")
            setDescricaoOutros("")
          }
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Confirmar denúncia</DialogTitle>
            <DialogDescription className="mt-2 text-gray-700">
              Você está prestes a denunciar uma transferência de{" "}
              <strong>{denunciaPendente ? formatarValor(denunciaPendente.valor) : ""}</strong> para{" "}
              <strong>{denunciaPendente?.destino.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          {denunciaPendente?.e2e_id && (
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Código da operação (E2E ID)</p>
              <p className="text-xs font-mono text-gray-600 break-all">{denunciaPendente.e2e_id}</p>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Motivo da denúncia</label>
            <select
              value={motivoDenuncia}
              onChange={(e) => setMotivoDenuncia(e.target.value)}
              disabled={enviandoDenuncia}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 disabled:opacity-50"
            >
              <option value="FRAUDE">Fraude</option>
              <option value="GOLPE">Golpe</option>
              <option value="ENGANO">Engano</option>
              <option value="INVASAO_CONTA">Invasão de conta</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
          {motivoDenuncia === "OUTROS" && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Descreva o motivo <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={descricaoOutros}
                onChange={(e) => setDescricaoOutros(e.target.value)}
                disabled={enviandoDenuncia}
                maxLength={500}
                rows={3}
                placeholder="Explique brevemente o que aconteceu..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none disabled:opacity-50"
              />
              <span className="text-xs text-gray-400 self-end">{descricaoOutros.length}/500</span>
            </div>
          )}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            Ao confirmar, este usuário será marcado como suspeito e outros usuários receberão um aviso antes de transferir para ele.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDenunciaPendente(null); setMotivoDenuncia("FRAUDE"); setDescricaoOutros("") }}
              disabled={enviandoDenuncia}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarDenuncia}
              disabled={enviandoDenuncia}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {enviandoDenuncia ? "Registrando..." : "Confirmar denúncia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default Extrato
