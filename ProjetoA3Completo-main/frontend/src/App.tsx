import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import Inicio from "./pages/Inicio"
import Extrato from "./pages/Extrato"
import Perfil from "./pages/Perfil"
import TabIcon from "./components/TabIcon"
import Denuncias from "./pages/Denuncias"
import Pagamento from "./pages/Pagamento"
import NovoPagamento from "./pages/NovoPagamento"
import Comprovante from "./pages/Comprovante"
import Auditoria from "./pages/Auditoria"
import { ProvedorUsuario } from "./context/UserContext"

function App() {
  return (
    <ProvedorUsuario>
      <Toaster position="top-center" richColors closeButton />
      <main>
        <nav className="fixed bottom-0 left-0 right-0 flex justify-center z-50 max-w[390px]">
          <div className="w-full max-w-[390px] bg-white border-t border-gray-200 flex justify-around py-2">
            <TabIcon to="/home" name="Home" />
            <TabIcon to="/bankstatement" name="Search" />
            <div className="relative -top-4">
              <TabIcon to="/pay" name="Pay" size="large" />
            </div>
            <TabIcon to="/complaints" name="Complaints" />
            <TabIcon to="/profile" name="Profile" />
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Inicio />} />
          <Route path="/bankstatement" element={<Extrato />} />
          <Route path="/complaints" element={<Denuncias />} />
          <Route path="/pay" element={<Pagamento />} />
          <Route path="/pay/new/:id" element={<NovoPagamento />} />
          <Route path="/pay/new/:id/receipt" element={<Comprovante />} />
          <Route path="/profile" element={<Perfil />} />
          <Route path="/auditoria" element={<Auditoria />} />
        </Routes>
      </main>
    </ProvedorUsuario>
  )
}

export default App
