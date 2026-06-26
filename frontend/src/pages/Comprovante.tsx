import { useEffect, useState } from "react"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { Bell, CheckCircle, Home, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

type UsuarioRecibo = { nome: string; cpf: string }

function formatarCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function Comprovante() {
  const location = useLocation()
  const { id } = useParams()
  const navigate = useNavigate()

  const [remetente, setRemetente] = useState<UsuarioRecibo | null>(null)
  const [destinatario, setDestinatario] = useState<UsuarioRecibo | null>(null)
  const [valor, setValor] = useState<number | null>(null)
  const [dataTransacao, setDataTransacao] = useState<string | null>(null)
  const [e2eId, setE2eId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const estadoNavegacao = location.state as {
      remetente?: UsuarioRecibo
      destinatario?: UsuarioRecibo
      valor?: number
      dataTransacao?: string
      e2eId?: string
    } | null

    const valorQuery = Number(new URLSearchParams(location.search).get("valor"))

    if (estadoNavegacao?.remetente && estadoNavegacao?.destinatario && estadoNavegacao?.valor) {
      setRemetente(estadoNavegacao.remetente)
      setDestinatario(estadoNavegacao.destinatario)
      setValor(estadoNavegacao.valor)
      if (estadoNavegacao.dataTransacao) setDataTransacao(estadoNavegacao.dataTransacao)
      if (estadoNavegacao.e2eId) setE2eId(estadoNavegacao.e2eId)
      setCarregando(false)
      return
    }

    if (!id) {
      setCarregando(false)
      return
    }

    Promise.all([api.get(`/usuarios/${id}`), api.get("/usuarios/1")])
      .then(([resDestino, resRemetente]) => {
        setDestinatario(resDestino.data)
        setRemetente(resRemetente.data)
        if (!isNaN(valorQuery) && valorQuery > 0) setValor(valorQuery)
      })
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [id, location.search, location.state])

  if (carregando) {
    return (
      <main className="bg-neutral-950 flex items-center justify-center h-screen pb-20">
        <p className="text-white text-lg">Carregando comprovante...</p>
      </main>
    )
  }

  if (!remetente || !destinatario || !valor) {
    return (
      <main className="bg-neutral-950 flex items-center justify-center h-screen pb-20">
        <div className="flex flex-col items-center gap-4">
          <p className="text-white text-lg">Dados do comprovante não encontrados.</p>
          <Button onClick={() => navigate("/home")} variant="outline" className="text-white border-white">
            Voltar ao início
          </Button>
        </div>
      </main>
    )
  }

  const dataHora = new Date(dataTransacao ?? Date.now()).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <main className="bg-neutral-950 flex items-center justify-center pb-20">
      <div className="flex flex-col bg-gradient-1 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px]">
        <header className="flex items-center py-10 px-8 justify-between">
          <span className="text-base font-medium">Comprovante</span>
          <div className="flex gap-4">
            <Bell className="cursor-pointer" />
            <Menu className="cursor-pointer" />
          </div>
        </header>

        <div className="flex flex-col bg-gradient-1 rounded-t-4xl">
          <div className="flex flex-col bg-white rounded-t-4xl py-12 px-8 text-black min-h-screen">
            <div className="flex flex-col items-center text-center gap-3 mb-8">
              <CheckCircle size={52} className="text-green-500" strokeWidth={1.5} />
              <h5 className="text-2xl font-semibold text-gray-800">Pix Enviado!</h5>
              <p className="text-4xl font-bold text-gray-900">{formatarMoeda(Number(valor))}</p>
              <p className="text-xs text-gray-400">{dataHora}</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Origem</p>
                <p className="text-sm font-semibold text-gray-800">{remetente.nome}</p>
                <p className="text-xs text-gray-500">CPF: {formatarCPF(remetente.cpf)}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Destino</p>
                <p className="text-sm font-semibold text-gray-800">{destinatario.nome}</p>
                <p className="text-xs text-gray-500">CPF: {formatarCPF(destinatario.cpf)}</p>
              </div>
            </div>

            {e2eId && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Código da operação (E2E ID)</p>
                <p className="text-xs font-mono text-gray-600 break-all">{e2eId}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-8">
              <Button
                onClick={() => navigate("/home")}
                className="w-full bg-gradient-1 text-white"
              >
                <Home size={16} />
                Ir para o início
              </Button>
              <Button
                onClick={() => navigate("/bankstatement")}
                variant="outline"
                className="w-full"
              >
                Ver extrato
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Comprovante
