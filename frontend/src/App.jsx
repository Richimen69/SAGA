import { Route, Routes } from "react-router-dom";
import Login from "./views/Login";
import Header from "./components/layout/Header";
import Dashboard from "./features/dashboard/pages/Dashboard";
import ProtectedRoute from "./components/utils/ProtectedRoute";
import NotFound from "./views/NotFound";
import Tramites from "./features/bitacora/pages/Tramites";
import Configuraciones from "./features/dashboard/pages/Configuraciones";
import TramiteCliente from "./features/bitacora/pages/TramiteCliente";
import VistaTramite from "./features/bitacora/pages/VistaTramite";
import Rpp from "./features/rpp/pages/Rpp";
import Clientes from "./features/clientes/pages/Clientes";
import CatalogoRPP from "./features/rpp/pages/CatalogoRPP";
import CompararTramites from "./features/bitacora/pages/CompararTramites";
import BilseAcademy from "./features/bilse-academy/pages/BilseAcademy";
import { useAuthStore } from "./store/authStore";
function App() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  return (
    <div className="bg-background min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Header />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rpp"
          element={
            <ProtectedRoute>
              <Header />
              <Rpp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute>
              <Header />
              <Configuraciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalogo"
          element={
            <ProtectedRoute>
              <Header />
              <CatalogoRPP />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Header />
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tramites"
          element={
            <ProtectedRoute>
              <Header />
              <Tramites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vistaprevia"
          element={
            <ProtectedRoute>
              <Header />
              <VistaTramite user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tramitecliente"
          element={
            <ProtectedRoute>
              <Header />
              <TramiteCliente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comparar-tramites"
          element={
            <ProtectedRoute>
              <Header />
              <CompararTramites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bilse-academy"
          element={
            <ProtectedRoute>
              <Header />
              <BilseAcademy />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
