import useProtectedData from "@/shared/hooks/useProtectedData";
import Pastel from "@/features/dashboard/components/cards/PastelEstadoTramites";
import Barra from "@/features/dashboard/components/cards/BarraPrimaTotal";
import PastelPendientes from "@/features/dashboard/components/cards/PastelPendientes";
import PastelCompromisos from "@/features/dashboard/components/cards/PastelCompromisos";
import { obtenerEstados, pendientes, movimietos } from "@/features/dashboard/services/kpi";
import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CardDatos from "@/features/dashboard/components/cards/CardDatos";
import {
  IoMdCheckmarkCircleOutline,
} from "react-icons/io";
import PastelMovimientos from "@/features/dashboard/components/cards/PastelMovimientos";
import TableTramites from "@/features/dashboard/components/tables/TableTramites";

export default function Dashboard() {
  const navigate = useNavigate();
  const [Estados, setEstados] = useState([]);
  const [pendientesBC, setPendientesBC] = useState("");
  const [tipoTabla, setTipoTabla] = useState("");
  const [movimientosData, setMovimientosData] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  useEffect(() => {
    const fetchEstados = async () => {
      const response = await obtenerEstados();
      setEstados(response);
    };
    const fetchPendientes = async () => {
      const response = await pendientes();
      setPendientesBC(response[1].total);
    };
    const fetchMovimientos = async () => {
      const response = await movimietos();
      setMovimientosData(response);
    };
    fetchEstados();
    fetchPendientes();
    fetchMovimientos();
  }, []);
  useProtectedData();
  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <button
          className="rounded-full p-2 hover:bg-slate-50"
          onClick={() => navigate("/config")}
        >
          <Settings2 color="#076163" />
        </button>
      </div>
      <Barra />
      <CardDatos
        icon={<IoMdCheckmarkCircleOutline />}
        tittle={"Tramites"}
        data={Estados.total_tramites} //Poner cuantos son en total
      />
      <div className="flex flex-col items-center w-full space-y-5">
        <div className="grid md:grid-cols-4 grid-cols-1 gap-3 justify-items-center w-full">
          <div
            className="w-full h-full cursor-pointer"
            onClick={() => {
              setMostrarTabla((prevState) => !prevState);
              setTipoTabla("COBRANZA");
            }}
          >
            <Pastel />
          </div>
          <div
            className="w-full h-full cursor-pointer"
            onClick={() => {
              setMostrarTabla((prevState) => !prevState);
              setTipoTabla("PROCESO");
            }}
          >
            <PastelPendientes />
          </div>
          <div
            className="w-full h-full cursor-pointer"
            onClick={() => {
              setMostrarTabla((prevState) => !prevState);
              setTipoTabla("COMPROMISO");
            }}
          >
            <PastelCompromisos />
          </div>
          <div
            className="w-full h-full cursor-pointer"
            onClick={() => {
              setMostrarTabla((prevState) => !prevState);
              setTipoTabla("MOVGEN");
            }}
          >
            <PastelMovimientos />
          </div>
        </div>
        <div className="grid md:grid-cols-6 grid-cols-1 gap-3 justify-items-center w-full"></div>
        {mostrarTabla ? (
          <div className="w-full">
            <TableTramites tipo={tipoTabla} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
