import { Route, Routes } from "react-router-dom";
import Login from "./views/Login";
import AppLayout from "./components/layout/AppLayout";
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
import SupportDashboard from "./features/helpdesk/pages/SupportDashboard";
import TicketDetail from "./features/helpdesk/pages/TicketDetail";
import SupportCategories from "./features/helpdesk/pages/SupportCategories";
import SupportMetrics from "./features/helpdesk/components/SupportMetrics";
import CatalogosPage from "./features/catalogos/pages/CatalogosPage";
import DashboardFianzas from "./features/dashboard/pages/DashboardFianzas";
import ReportesPage from "./features/reportes/pages/ReportesPage";

function App() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="bg-background min-h-screen">
      <Routes>
        {/* Rutas protegidas: comparten sidebar + barra superior vía <AppLayout /> */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<DashboardFianzas />} />
          <Route path="/rpp" element={<Rpp />} />
          <Route path="/config" element={<Configuraciones />} />
          <Route path="/catalogo" element={<CatalogoRPP />} />
          <Route path="/catalogos" element={<CatalogosPage />} />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <ReportesPage />
              </ProtectedRoute>
            }
          />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/helpdesk" element={<Clientes />} />
          <Route path="/tramites" element={<Tramites />} />
          <Route path="/vistaprevia" element={<VistaTramite user={user} />} />
          <Route path="/tramitecliente" element={<TramiteCliente />} />
          <Route path="/comparar-tramites" element={<CompararTramites />} />
          <Route path="/bilse-academy" element={<BilseAcademy />} />
        </Route>

        {/* Rutas sin layout */}
        <Route path="/support" element={<SupportDashboard />} />
        <Route path="/support/ticket/:id" element={<TicketDetail />} />
        <Route path="/support/metrics" element={<SupportMetrics />} />
        <Route path="/support/categories" element={<SupportCategories />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
