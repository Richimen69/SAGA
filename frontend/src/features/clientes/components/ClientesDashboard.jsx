import React from "react";
import { useState, useEffect, useCallback } from "react";
import { obetenerKPIs } from "../services/clientes";
import Card from "./ui/Card";
import {
  Loader,
  RefreshCcw,
  Users,
  Eye,
  UserX,
  UserCheck,
  UserPlus,
} from "lucide-react";

export default function ClientesDashboard() {
  const [KPIs, setKPI] = useState([]);
  const fetchClientes = useCallback(async () => {
    try {
      const kpisData = await obetenerKPIs();
      setKPI(kpisData);
    } catch (error) {
      console.error("Error al obtener los datos", error);
    }
  }, []);
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-5">
        <Card
          name={"Total Clientes"}
          icon={<Users />}
          total={KPIs.total_clientes}
        />
        <Card name={"Total CA"} icon={<UserCheck />} total={KPIs.total_ca} />
        <Card name={"Total CI"} icon={<UserX />} total={KPIs.total_ci} />
        <Card
          name={"En seguimiento"}
          icon={<Eye />}
          total={KPIs.clientes_con_seguimiento}
        />
        <Card
          name={"Referidos"}
          icon={<UserPlus />}
          total={KPIs.total_referidos}
        />
        <Card
          name={"Reactivados"}
          icon={<RefreshCcw />}
          total={KPIs.total_clientes_reactivados}
        />
      </div>
    </div>
  );
}
