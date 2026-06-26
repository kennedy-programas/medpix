import "@/index.css"
import { useUsuario } from "@/context/UserContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Camera, Menu, ShieldAlert, ShieldCheck, Wallet, ClipboardList } from "lucide-react"
import { useNavigate } from "react-router-dom"

function formatarCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

function Perfil() {
  const { usuario, carregando, isAuditor } = useUsuario()
  const navigate = useNavigate()

  const iniciais = usuario?.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??"

  return (
    <main className="bg-neutral-950 flex items-center justify-center pb-20">
      <div className="flex flex-col bg-gradient-1 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px]">
        <header className="flex items-center py-10 px-8 justify-between">
          <span className="text-base font-medium">Perfil</span>
          <div className="flex gap-4">
            <Bell className="cursor-pointer" />
            <Menu className="cursor-pointer" />
          </div>
        </header>

        <div className="flex flex-col bg-white rounded-t-4xl py-12 px-8 text-black min-h-screen">
          {carregando && (
            <p className="text-center text-gray-400 text-sm mt-8">Carregando perfil...</p>
          )}

          {!carregando && usuario && (
            <>
              <div className="flex flex-col items-center gap-3 mb-8">
                <div className="relative">
                  <Avatar className="w-24 h-24 ring-4 ring-red-100 shadow-md">
                    <AvatarImage src={usuario.image} />
                    <AvatarFallback className="text-3xl bg-red-100 text-red-600 font-bold">
                      {iniciais}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute bottom-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                    title="Alterar foto"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800">{usuario.nome}</h2>
                  <p className="text-sm text-gray-400">{formatarCPF(usuario.cpf)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Wallet size={22} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Saldo disponível</p>
                    <p className="text-base font-semibold text-gray-800">
                      {Number(usuario.saldo).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                  <div className={`p-2 rounded-lg ${usuario.denuncia ? "bg-red-100" : "bg-green-100"}`}>
                    {usuario.denuncia ? (
                      <ShieldAlert size={22} className="text-red-500" />
                    ) : (
                      <ShieldCheck size={22} className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Status da conta</p>
                    <p className={`text-sm font-semibold ${usuario.denuncia ? "text-red-500" : "text-green-600"}`}>
                      {usuario.denuncia ? "Conta sob análise" : "Conta verificada"}
                    </p>
                    {(usuario.recebeu_denuncia ?? 0) > 0 && (
                      <p className="text-xs text-gray-500">
                        {usuario.recebeu_denuncia} denúncia{(usuario.recebeu_denuncia ?? 0) !== 1 ? "s" : ""} recebida
                        {(usuario.recebeu_denuncia ?? 0) !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isAuditor && (
                <button
                  onClick={() => navigate("/auditoria")}
                  className="mt-6 w-full flex items-center gap-4 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors"
                >
                  <div className="bg-red-100 p-2 rounded-lg">
                    <ClipboardList size={22} className="text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-red-700">Painel MED</p>
                    <p className="text-xs text-red-400">Gerenciar e validar denúncias PIX</p>
                  </div>
                </button>
              )}

              <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-300 text-center">
                  ID da conta: #{usuario.id}
                </p>
              </div>
            </>
          )}

          {!carregando && !usuario && (
            <p className="text-center text-gray-400 text-sm mt-8">
              Não foi possível carregar os dados do perfil.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default Perfil
