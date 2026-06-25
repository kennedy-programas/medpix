import "@/index.css"
import { Button } from "@/components/ui/button"
import { Banknote, Bell, ChevronRight, CreditCard, Eye, EyeOff, Menu, PiggyBank, ShieldAlert } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Bar, BarChart, XAxis } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useUsuario } from "@/context/UserContext"

// Ações rápidas exibidas no painel principal
const acoes = [
  { label: "PIX", icon: Banknote, to: "/pay" },
  { label: "Extrato", icon: PiggyBank, to: "/bankstatement" },
  { label: "Denúncias", icon: ShieldAlert, to: "/complaints" },
  { label: "CRÉDITO", icon: CreditCard, to: "#" }, // Pensar em uma funcionalidade melhor depois
]

// Dados estáticos para o gráfico de rendimento
const dadosGrafico = [
  { month: "JAN", rendimento: 186 },
  { month: "FEV", rendimento: 305 },
  { month: "MAR", rendimento: 237 },
  { month: "ABR", rendimento: 73 },
  { month: "MAI", rendimento: 209 },
  { month: "JUN", rendimento: 214 },
]

// Configuração de legendas e cores para o gráfico
const configuracaoGrafico = {
  rendimento: {
    label: "Rendeu",
    color: "#CA0A36",
  },
} satisfies ChartConfig

function Inicio() {
  const { usuario } = useUsuario()

  // Controle de visibilidade do saldo
  const [saldoVisivel, setSaldoVisivel] = useState(true)

  // Gera iniciais do nome do usuário para o avatar fallback
  const iniciais = usuario?.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??"

  return (
    <main className="bg-neutral-950 flex items-center justify-center pb-20">
      <div className="flex flex-col bg-gradient-3 text-white rounded-3xl shadow-xl w-[390px] min-h-[700px]">
        <header className="flex items-center py-10 px-8 justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              {usuario?.image ? (
                <AvatarImage src={usuario.image} alt={usuario.nome} />
              ) : (
                <AvatarImage src="..\public\Ichigo.png" alt="avatar" />
              )}
              <AvatarFallback className="bg-red-200 text-red-700 font-semibold">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <span className="text-base">
              {usuario ? `Olá, ${usuario.nome}` : "Carregando..."}
            </span>
          </div>
          <div className="flex gap-4">
            <Bell className="cursor-pointer" />
            {saldoVisivel
              ? <EyeOff className="cursor-pointer" onClick={() => setSaldoVisivel(false)} />
              : <Eye className="cursor-pointer" onClick={() => setSaldoVisivel(true)} />
            }
            <Menu className="cursor-pointer" />
          </div>
        </header>

        <div className="flex flex-col bg-gradient-1 rounded-t-4xl">
          <div className="flex flex-col px-8 py-7">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm text-gray-200">Saldo disponível</span>
                <h5 className="text-2xl font-semibold">
                  {saldoVisivel
                    ? (usuario
                        ? Number(usuario.saldo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "R$ ---")
                    : "R$ •••••"}
                </h5>
              </div>
              <ChevronRight className="cursor-pointer" size={24} />
            </div>
            <Link to="/bankstatement" className="uppercase text-xs mt-5 cursor-pointer text-gray-200 hover:text-white">
              Ver extrato
            </Link>
            <Separator className="mt-7 opacity-30" />
            <div className="flex justify-between mt-7 mb-3">
              {acoes.map(({ label, icon: Icone, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col cursor-pointer items-center gap-3 justify-center"
                >
                  <div className="icon bg-white p-2 rounded-xl">
                    <Icone color="#B6657A" size={34} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs uppercase">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col bg-white rounded-t-4xl py-12 px-8 text-black">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Investido</span>
                <h5 className="text-2xl font-semibold">R$ 145.756,87</h5>
              </div>
              <Button className="py-5 px-8 text-sm text-[#CA0A36] bg-transparent border border-[#CA0A36] hover:bg-[#CA0A36] hover:text-white cursor-pointer">
                Resgatar
              </Button>
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span className="text-gray-500">Disponível para resgate</span>
              <span className="font-medium">R$ 12.500,00</span>
            </div>
            <Separator className="mt-8" />
            <div className="flex flex-col mt-8">
              <span className="text-sm text-gray-600">Seus rendimentos de 2025</span>
              <ChartContainer config={configuracaoGrafico} className="w-full uppercase mt-6">
                <BarChart accessibilityLayer data={dadosGrafico}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={12}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="rendimento" fill="var(--color-rendimento)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Inicio
