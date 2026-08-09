import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { movimietos, obtenerEstados } from "@/features/dashboard/services/kpi";
import { useEffect, useState } from "react";

export default function PastelMovimientos() {
  const [movimientosData, setMovimientosData] = useState([]);
  const [totalTramites, setTotalTramites] = useState("");
  useEffect(() => {
    const fetchEstados = async () => {
      const response = await obtenerEstados();
      setTotalTramites(response);
    };
    fetchEstados();
  }, []);
  useEffect(() => {
    const fetchMovimientos = async () => {
      const response = await movimietos();
      setMovimientosData(response);
    };
    fetchMovimientos();
  }, []);

  function calcularPorcentaje(cantidad, total) {
    return parseFloat(((cantidad / total) * 100).toFixed(0));
  }
  const estados = [
    {
      name: "Aumento",
      value: calcularPorcentaje(
        movimientosData.aumento_count,
        movimientosData.total_movimientos
      ),
      color: "#FDE68A",
      cantidad: movimientosData.aumento_count
    }, // Amarillo pastel
    {
      name: "Cancelacion",
      value: calcularPorcentaje(
        movimientosData.cancelacion_count,
        movimientosData.total_movimientos
      ),
      color: "#BFDBFE",
      cantidad: movimientosData.cancelacion_count
    }, // Azul pastel
    {
      name: "Prorroga",
      value: calcularPorcentaje(
        movimientosData.prorroga_count,
        movimientosData.total_movimientos
      ),
      color: "#FCA5A5",
      cantidad: movimientosData.prorroga_count
    }, // Rojo pastel
    {
      name: "Expedicion",
      value: calcularPorcentaje(
        movimientosData.expedicion_count,
        movimientosData.total_movimientos
      ),
      color: "#A7F3D0",
      cantidad: movimientosData.expedicion_count
    }, // Verde pastel
  ];

  return (
    <Card className="w-full h-full hover:bg-slate-100">
      <CardHeader>
        <CardTitle>Movimientos generadores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-6xl font-bold">{movimientosData.total_movimientos}/</span>
            <span className="text-xl">
              {(
                (Number(movimientosData.total_movimientos) * 100) /
                Number(totalTramites.total_tramites)
              ).toFixed(2)}
              %
            </span>
          </div>
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estados}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {estados.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className=" cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.8)",
                    borderRadius: "6px",
                    border: "none",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-3">
          {estados.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold">{item.value}% / {item.cantidad}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
