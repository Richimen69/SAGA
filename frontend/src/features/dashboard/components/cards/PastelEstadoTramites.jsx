import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cobranzaData } from "@/features/dashboard/services/kpi";
import { AlertTriangle } from "lucide-react";

export default function CobranzaAreaChart() {
  const [cobranza, setCobranza] = useState({
    total_registros: 0,
    suma_prima_total: 0,
    suma_importe_total: 0,
  });

  useEffect(() => {
    const fetchCobranza = async () => {
      const response = await cobranzaData();
      setCobranza(response);
    };
    fetchCobranza();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };



  return (
    <Card className="w-full h-full hover:bg-slate-100">
      <CardHeader>
        <CardTitle>Cobranza Pendiente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Registros */}
          <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Registros Pendientes</span>
            </div>
            <span className="text-2xl font-bold text-red-600">
              {cobranza.total_registros}
            </span>
          </div>
          
          {/* Prima Total */}
          <div className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Prima Total</span>
            </div>
            <span className="text-xl font-bold text-orange-600">
              {formatCurrency(cobranza.suma_prima_total)}
            </span>
          </div>
          
          {/* Importe Total */}
          <div className="flex items-center justify-between py-2 px-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Importe Total</span>
            </div>
            <span className="text-xl font-bold text-indigo-600">
              {formatCurrency(cobranza.suma_importe_total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}