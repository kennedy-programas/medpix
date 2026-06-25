import { AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface PropsDialogConfirmarTransferencia {
  open: boolean
  nomeUsuario: string
  cpfUsuario: string
  qtdDenuncias: number
  valor: string
  aoConfirmar: () => void
  aoCancelar: () => void
  carregando?: boolean
}

function formatarCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

export function DialogConfirmarTransferencia({
  open,
  nomeUsuario,
  cpfUsuario,
  qtdDenuncias,
  valor,
  aoConfirmar,
  aoCancelar,
  carregando = false,
}: PropsDialogConfirmarTransferencia) {
  const temDenuncia = qtdDenuncias > 0

  return (
    <Dialog open={open} onOpenChange={(estaAberto) => { if (!estaAberto && !carregando) aoCancelar() }}>
      <DialogContent className={`bg-white ${temDenuncia ? "border-2 border-red-300" : ""}`}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {temDenuncia ? (
              <AlertCircle className="text-red-500" size={24} />
            ) : (
              <CheckCircle className="text-green-500" size={24} />
            )}
            <DialogTitle className={temDenuncia ? "text-red-600" : "text-gray-800"}>
              {temDenuncia ? "Atenção! Usuário com denúncias" : "Confirmar transferência"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Resumo da operação */}
        <div className="flex flex-col gap-2 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Destinatário</span>
            <span className="font-semibold text-gray-800 uppercase">{nomeUsuario}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">CPF</span>
            <span className="font-mono text-gray-600">{formatarCPF(cpfUsuario)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
            <span className="text-gray-500">Valor</span>
            <span className="font-bold text-gray-900">{valor}</span>
          </div>
        </div>

        {temDenuncia && (
          <DialogDescription asChild>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-1">
                Este usuário possui {qtdDenuncias} denúncia{qtdDenuncias !== 1 ? "s" : ""} registrada{qtdDenuncias !== 1 ? "s" : ""}.
              </p>
              <p className="text-xs text-red-700">
                Prossiga apenas se tiver certeza de que a transação é legítima.
              </p>
            </div>
          </DialogDescription>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <Button
            variant="outline"
            onClick={aoCancelar}
            disabled={carregando}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={aoConfirmar}
            disabled={carregando}
            className={
              temDenuncia
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-[#B81570] to-[#CC092F] text-white"
            }
          >
            {carregando
              ? "Processando..."
              : temDenuncia
              ? "Confirmar mesmo assim"
              : "Confirmar transferência"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
