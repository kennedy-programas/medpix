import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import { usuarioService } from "@/services/usuarioService"
import { pixService } from "@/services/pixService"
import { useUsuario } from "@/context/UserContext"
import type { Usuario } from "@/types"
import { Button } from "@/components/ui/button"
import EditableAmount from "@/components/EditableAmount"
import { DialogConfirmarTransferencia } from "@/components/dialogs/ConfirmTransferDialog"
import { Bell, EyeOff, Menu, Pencil } from "lucide-react"

function converterMoeda(valor: string): number {
  if (!valor) return 0
  const limpo = valor.replace(/[^\d,]/g, "").replace(",", ".")
  const convertido = parseFloat(limpo)
  return isNaN(convertido) ? 0 : convertido
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function NovoPagamento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { idUsuario, usuario: remetente, recarregar: recarregarRemetente } = useUsuario()

  const [destinatario, setDestinatario] = useState<Usuario | null>(null)
  const [quantia, setQuantia] = useState("R$ 0,00")
  const [carregando, setCarregando] = useState(false)
  const [mostrarDialogConfirmacao, setMostrarDialogConfirmacao] = useState(false)

  // Chave de idempotência gerada uma única vez por montagem do componente.
  // Se o usuário confirmar e a requisição falhar, a mesma chave é reutilizada na nova tentativa,
  // evitando débitos duplicados caso o primeiro request tenha chegado ao servidor.
  const chaveIdempotencia = useRef(
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  )

  useEffect(() => {
    if (!id) return
    usuarioService
      .buscarPorId(Number(id))
      .then(setDestinatario)
      .catch(() => toast.error("Erro ao carregar dados do destinatário."))
  }, [id])

  function validarTransferencia(): boolean {
    if (!destinatario || !remetente) return false

    const valor = converterMoeda(quantia)

    if (valor <= 0) {
      toast.warning("Informe um valor válido para a transferência.")
      return false
    }

    if (valor > Number(remetente.saldo)) {
      toast.error("Saldo insuficiente para realizar esta transferência.")
      return false
    }

    return true
  }

  function aoClicarTransferir() {
    if (!validarTransferencia()) return
    setMostrarDialogConfirmacao(true)
  }

  async function aoConfirmarDialog() {
    setMostrarDialogConfirmacao(false)
    await realizarTransferencia()
  }

  async function realizarTransferencia() {
    if (!destinatario || !remetente || carregando) return

    setCarregando(true)
    const valor = converterMoeda(quantia)

    try {
      const dados = await pixService.transferir({
        remetenteId: idUsuario,
        destinatarioId: destinatario.id,
        valor,
        idempotencyKey: chaveIdempotencia.current,
      })

      if (!dados.sucesso) {
        throw new Error("Erro ao processar transferência.")
      }

      recarregarRemetente()
      setQuantia("R$ 0,00")

      navigate(`/pay/new/${destinatario.id}/receipt?valor=${valor}`, {
        state: {
          remetente: dados.remetente,
          destinatario: dados.destinatario,
          valor,
          dataTransacao: dados.data_transacao,
          e2eId: dados.e2e_id,
        },
      })
    } catch (err: unknown) {
      const erroAxios = err as AxiosError<{ erro: string }>
      const mensagem =
        erroAxios?.response?.data?.erro ||
        (err instanceof Error ? err.message : null) ||
        "Erro desconhecido. Tente novamente."
      toast.error(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  if (!destinatario || !remetente) {
    return (
      <main className="bg-neutral-950 flex items-center justify-center h-screen pb-20">
        <div className="text-white text-lg">Carregando...</div>
      </main>
    )
  }

  const temDenuncia =
    Boolean(destinatario.denuncia) || (destinatario.recebeu_denuncia ?? 0) >= 1

  return (
    <main className="bg-neutral-950 flex items-center justify-center pb-20">
      <div className="flex flex-col bg-gradient-1 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px]">
        <header className="flex items-center py-10 px-8 justify-between">
          <span className="text-base">Olá, {remetente.nome}</span>
          <div className="flex gap-4">
            <Bell className="cursor-pointer" />
            <Menu className="cursor-pointer" />
          </div>
        </header>

        <div className="flex flex-col bg-gradient-1 rounded-t-4xl">
          <div className="flex flex-col bg-white rounded-t-4xl py-12 px-8 text-black min-h-screen">
            <div className="flex justify-between items-center">
              <span className="text-base">
                Saldo disponível:{" "}
                <strong>
                  {Number(remetente.saldo).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
              </span>
              <EyeOff className="cursor-pointer" size={20} />
            </div>

            <div className="flex flex-col mt-16 justify-center items-center text-center">
              <div className="flex items-center gap-2 mb-4">
                <EditableAmount value={quantia} onChange={setQuantia} />
                <Pencil size={16} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Transferindo para</p>
              <span className="uppercase font-bold text-lg mt-1">{destinatario.nome}</span>
              <span className="text-sm text-gray-400 mt-1">
                CPF: {destinatario.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}
              </span>

              <div className="flex flex-col justify-center items-center text-center mt-10 w-full">
                {temDenuncia ? (
                  <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-red-600 font-semibold text-sm">
                      ⚠ Usuário com {destinatario.recebeu_denuncia ?? 0} denúncia
                      {(destinatario.recebeu_denuncia ?? 0) !== 1 ? "s" : ""}
                    </p>
                    <p className="text-red-500 text-xs mt-1">Prossiga com atenção</p>
                  </div>
                ) : (
                  <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <p className="text-green-700 font-semibold text-sm">✓ Usuário verificado</p>
                  </div>
                )}

                <Button
                  className="bg-gradient-1 mt-8 w-full cursor-pointer"
                  onClick={aoClicarTransferir}
                  disabled={carregando}
                >
                  {carregando ? "Processando..." : "Transferir agora"}
                </Button>
                <Button
                  variant="outline"
                  className="mt-3 w-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  Agendar transferência
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogConfirmarTransferencia
        open={mostrarDialogConfirmacao}
        nomeUsuario={destinatario.nome}
        cpfUsuario={destinatario.cpf}
        qtdDenuncias={destinatario.recebeu_denuncia ?? 0}
        valor={formatarMoeda(converterMoeda(quantia))}
        aoConfirmar={aoConfirmarDialog}
        aoCancelar={() => setMostrarDialogConfirmacao(false)}
        carregando={carregando}
      />
    </main>
  )
}

export default NovoPagamento
