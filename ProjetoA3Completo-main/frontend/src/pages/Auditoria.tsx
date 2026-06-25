import "@/index.css"
import { auditoriaService } from "@/services/auditoriaService"
import { useUsuario } from "@/context/UserContext"
import type { DenunciaAuditoria } from "@/types"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Bell, Menu, ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const MOTIVOS_APROVACAO: Record<string, string> = {
  FRAUDE_CONFIRMADA: "Fraude confirmada",
  GOLPE_CONFIRMADO: "Golpe confirmado",
  INVASAO_CONFIRMADA: "Invasão de conta confirmada",
  ENGANO_CONFIRMADO: "Transferência por engano confirmada",
  OUTRO: "Outro",
}

const MOTIVOS_RECUSA: Record<string, string> = {
  PROVA_INSUFICIENTE: "Provas insuficientes",
  DESACORDO_COMERCIAL: "Desacordo comercial",
  OPERACAO_RECONHECIDA: "Operação reconhecida pelo denunciante",
  DENUNCIA_DUPLICADA: "Denúncia duplicada",
  OUTRO: "Outro",
}

const ROTULO_MOTIVO: Record<string, string> = {
  FRAUDE: "Fraude",
  GOLPE: "Golpe",
  ENGANO: "Engano",
  INVASAO_CONTA: "Invasão de conta",
  OUTROS: "Outros",
}

function calcularSLA(sla_limite: string | null): { texto: string; urgente: boolean; vencido: boolean } {
  if (!sla_limite) return { texto: "Sem SLA", urgente: false, vencido: false }
  const diff = new Date(sla_limite).getTime() - Date.now()
  if (diff <= 0) return { texto: "VENCIDO", urgente: true, vencido: true }
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (dias === 0) return { texto: `${horas}h restantes`, urgente: true, vencido: false }
  return { texto: `${dias}d ${horas}h`, urgente: dias <= 2, vencido: false }
}

function formatarCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

type DecisaoTipo = "aprovar" | "recusar"

interface ModalDecisao {
  denuncia: DenunciaAuditoria
  tipo: DecisaoTipo
}

function Auditoria() {
  const { idUsuario, usuario, isAuditor } = useUsuario()
  const [denuncias, setDenuncias] = useState<DenunciaAuditoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalDecisao, setModalDecisao] = useState<ModalDecisao | null>(null)
  const [motivoSelecionado, setMotivoSelecionado] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    if (!isAuditor) return
    setCarregando(true)
    auditoriaService
      .listarPendentes(idUsuario)
      .then(setDenuncias)
      .catch(() => toast.error("Erro ao carregar denúncias."))
      .finally(() => setCarregando(false))
  }, [idUsuario, isAuditor])

  function abrirModal(denuncia: DenunciaAuditoria, tipo: DecisaoTipo) {
    setModalDecisao({ denuncia, tipo })
    setMotivoSelecionado("")
    setObservacoes("")
  }

  function fecharModal() {
    if (processando) return
    setModalDecisao(null)
    setMotivoSelecionado("")
    setObservacoes("")
  }

  async function confirmarDecisao() {
    if (!modalDecisao || !motivoSelecionado || processando) return
    setProcessando(true)
    const { denuncia, tipo } = modalDecisao
    try {
      const payload = { auditor_id: idUsuario, motivo: motivoSelecionado, observacoes: observacoes.trim() || undefined }
      if (tipo === "aprovar") {
        const res = await auditoriaService.aprovar(denuncia.id, payload)
        if (res.status === "CONFIRMADA") {
          toast.success(`Denúncia aprovada. R$ ${Number(res.valor_devolvido).toFixed(2)} devolvidos.`)
        } else {
          toast.warning(`Aprovada com saldo insuficiente. R$ ${Number(res.valor_devolvido).toFixed(2)} retidos. Status: Aguardando Fundos.`)
        }
      } else {
        await auditoriaService.recusar(denuncia.id, payload)
        toast.success("Denúncia recusada. Registro removido do infrator.")
      }
      setDenuncias((prev) => prev.filter((d) => d.id !== denuncia.id))
      fecharModal()
    } catch (err: unknown) {
      const erro = (err as { response?: { data?: { erro?: string } } })?.response?.data?.erro
      toast.error(erro || "Erro ao processar decisão.")
    } finally {
      setProcessando(false)
    }
  }

  const motivosMap = modalDecisao?.tipo === "aprovar" ? MOTIVOS_APROVACAO : MOTIVOS_RECUSA

  if (!isAuditor) {
    return (
      <main className="bg-neutral-950 flex items-center justify-center pb-20">
        <div className="flex flex-col bg-gradient-1 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px] items-center justify-center">
          <ShieldAlert size={48} className="text-red-400 mb-4" />
          <p className="text-white text-center px-8">Acesso restrito a auditores.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-neutral-950 flex items-center justify-center pb-20">
      <div className="flex flex-col bg-gradient-1 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px]">
        <header className="flex items-center py-10 px-8 justify-between">
          <div>
            <span className="text-base font-medium">Painel MED</span>
            <p className="text-xs text-red-200 mt-0.5">Auditoria de Denúncias PIX</p>
          </div>
          <div className="flex gap-4">
            <Bell className="cursor-pointer" />
            <Menu className="cursor-pointer" />
          </div>
        </header>

        <div className="flex flex-col bg-white rounded-t-4xl py-10 px-6 text-black min-h-screen">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium">Casos Pendentes</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {denuncias.length} caso{denuncias.length !== 1 ? "s" : ""}
            </span>
          </div>

          {carregando && (
            <p className="mt-8 text-center text-gray-400 text-sm">Carregando casos...</p>
          )}

          {!carregando && denuncias.length === 0 && (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 size={48} className="text-green-400" />
              <p className="text-gray-500 text-sm">Nenhuma denúncia pendente de análise.</p>
            </div>
          )}

          {!carregando && denuncias.map((d) => {
            const sla = calcularSLA(d.sla_limite)
            const data = new Date(d.data_denuncia).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", year: "numeric",
            })

            return (
              <div key={d.id} className="flex flex-col mt-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Denunciante</span>
                    <span className="text-sm font-medium text-gray-800">{d.denunciante?.nome ?? "—"}</span>
                    <span className="text-xs text-gray-400">{d.denunciante?.cpf ? formatarCPF(d.denunciante.cpf) : "—"}</span>
                  </div>
                  <span className="text-sm font-bold text-red-500 mt-4">
                    {Number(d.valor_roubado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>

                <div className="flex items-start justify-between mb-3 pl-3 border-l-2 border-red-200">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Denunciado</span>
                    <span className="text-sm font-medium text-gray-800">{d.denunciado?.nome ?? "—"}</span>
                    <span className="text-xs text-gray-400">{d.denunciado?.cpf ? formatarCPF(d.denunciado.cpf) : "—"}</span>
                    <span className="text-xs text-gray-500">
                      Saldo: {Number(d.denunciado?.saldo ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {ROTULO_MOTIVO[d.motivo] ?? d.motivo}
                  </span>
                  <span className="text-gray-400">{data}</span>
                </div>

                {d.descricao && (
                  <p className="text-xs text-gray-500 bg-white border border-gray-100 rounded-lg px-3 py-2 mb-3 italic">
                    "{d.descricao}"
                  </p>
                )}

                <div className={`flex items-center gap-1.5 text-xs mb-4 ${sla.vencido ? "text-red-600" : sla.urgente ? "text-orange-500" : "text-gray-400"}`}>
                  <Clock size={12} />
                  <span>SLA: {sla.texto}</span>
                  {sla.urgente && <AlertTriangle size={12} />}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModal(d, "recusar")}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg py-2 transition-colors"
                  >
                    <XCircle size={14} />
                    Recusar
                  </button>
                  <button
                    onClick={() => abrirModal(d, "aprovar")}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg py-2 transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    Aprovar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Dialog open={!!modalDecisao} onOpenChange={(open) => !open && fecharModal()}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {modalDecisao?.tipo === "aprovar" ? "Aprovar denúncia" : "Recusar denúncia"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            {modalDecisao?.tipo === "aprovar"
              ? `O valor de ${Number(modalDecisao?.denuncia.valor_roubado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} será devolvido ao denunciante (conforme saldo disponível).`
              : "A denúncia será encerrada e o registro removido do score do denunciado."}
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Motivo da decisão <span className="text-red-500">*</span></label>
            <select
              value={motivoSelecionado}
              onChange={(e) => setMotivoSelecionado(e.target.value)}
              disabled={processando}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 disabled:opacity-50"
            >
              <option value="">Selecione um motivo...</option>
              {Object.entries(motivosMap).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>{rotulo}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Observações <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={processando}
              maxLength={500}
              rows={3}
              placeholder="Registre observações para o histórico de auditoria..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none disabled:opacity-50"
            />
            <span className="text-xs text-gray-400 self-end">{observacoes.length}/500</span>
          </div>

          <p className="text-xs text-gray-400">
            Auditor: <strong>{usuario?.nome}</strong> · Esta ação será registrada em log.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={fecharModal} disabled={processando}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarDecisao}
              disabled={!motivoSelecionado || processando}
              className={modalDecisao?.tipo === "aprovar"
                ? "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                : "bg-gray-700 hover:bg-gray-800 text-white disabled:opacity-50"}
            >
              {processando ? "Processando..." : modalDecisao?.tipo === "aprovar" ? "Confirmar aprovação" : "Confirmar recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default Auditoria
