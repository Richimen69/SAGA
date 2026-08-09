import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CardContent} from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  primaTotal,
  metaAnual,
  metaPorFiltro,
} from "@/features/dashboard/services/kpi.service";
import { DollarSign, TrendingUp } from "lucide-react";
import { addDays, format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Barra() {
  const [primaTotales, setPrimaTotal] = useState([]);
  const [afianzadoraMeta, setAfianzadoraMeta] = useState([]);
  const [afianzadoraFiltro, setAfianzadoraFiltro] = useState([]);
  const [date, setDate] = useState();
  const [prima, setPrima] = useState();

useEffect(() => {
    const obtener = async () => {
      try {
        if (date?.from && date?.to) {
          const fechaInicio = format(date.from, "yyyy-MM-dd");
          const fechaFin = format(date.to, "yyyy-MM-dd");
          const response = await metaPorFiltro(fechaInicio, fechaFin);
          
          // Aseguramos que sea un arreglo antes de continuar
          const datosValidos = Array.isArray(response) ? response : [];
          
          setAfianzadoraFiltro(datosValidos);
          const total = datosValidos.reduce(
            (sum, item) => sum + parseFloat(item.venta_anual || 0),
            0
          );
          setPrima(total);
        } else {
          const response = await metaAnual();
          
          // Aseguramos que sea un arreglo antes de continuar
          const datosValidos = Array.isArray(response) ? response : [];
          
          setAfianzadoraMeta(datosValidos);
          const total = datosValidos.reduce(
            (sum, item) => sum + parseFloat(item.venta_anual || 0),
            0
          );
          setPrima(total);
        }
      } catch (error) {
        console.error("Error al obtener la meta:", error);
      }
    };

    obtener();
  }, [date]);

  const TRADUCCION_MESES = {
    January: "Enero",
    February: "Febrero",
    March: "Marzo",
    April: "Abril",
    May: "Mayo",
    June: "Junio",
    July: "Julio",
    August: "Agosto",
    September: "Septiembre",
    October: "Octubre",
    November: "Noviembre",
    December: "Diciembre",
  };

  const handleSelect = (range) => {
    if (range?.from && range?.to) {
      setDate(range); // Rango completo
    } else if (range?.from) {
      setDate({ from: range.from, to: undefined }); // Solo fecha de inicio, reiniciar fin
    } else {
      setDate(undefined); // Sin selección
    }
  };

  function transformarDatos(dataDelBackend) {
    // Validamos usando el mismo nombre que recibe la función
    if (!dataDelBackend || dataDelBackend.length === 0) return [];

    // Usamos dataDelBackend
    const afianzadoras = [...new Set(dataDelBackend.map((item) => item.nombre_afi))];
    const resultado = [];

    for (const mesIngles in TRADUCCION_MESES) {
      const mesEsp = TRADUCCION_MESES[mesIngles];
      const fila = { name: mesEsp };

      afianzadoras.forEach((afi) => {
        // Usamos dataDelBackend
        const registro = dataDelBackend.find(
          (item) => item.mes === mesIngles && item.nombre_afi === afi
        );

        fila[afi] = registro ? parseFloat(registro.venta_mensual) : 0;
        fila["meta_" + afi] = registro ? parseFloat(registro.meta_mensual) : 0; 
      });

      resultado.push(fila);
    }

    return resultado;
  }

useEffect(() => {
    const obtener = async () => {
      try {
        if (date?.from && date?.to) {
          // --- 1. CON RANGO DE FECHAS ---
          const fechaInicio = format(date.from, "yyyy-MM-dd");
          const fechaFin = format(date.to, "yyyy-MM-dd");
          
          // Tarjetas Superiores
          const responseTarjetas = await metaPorFiltro(fechaInicio, fechaFin);
          
          // Validación de seguridad
          const datosValidos = Array.isArray(responseTarjetas) ? responseTarjetas : [];
          
          setAfianzadoraFiltro(datosValidos);
          setAfianzadoraMeta([]); // <-- Esto evita que se acumulen

          const total = datosValidos.reduce(
            (sum, item) => sum + parseFloat(item.venta_anual || 0), 0
          );
          setPrima(total);

          // Gráfica
          const responseGrafica = await primaTotal(fechaInicio, fechaFin); 
          setPrimaTotal(transformarDatos(responseGrafica));

        } else {
          // --- 2. SIN FECHAS (Todo el año) ---
          
          // Tarjetas Superiores
          const responseTarjetas = await metaAnual();
          
          // Validación de seguridad
          const datosValidos = Array.isArray(responseTarjetas) ? responseTarjetas : [];
          
          setAfianzadoraMeta(datosValidos);
          setAfianzadoraFiltro([]); // <-- Esto limpia los filtros cuando borras la fecha

          const total = datosValidos.reduce(
            (sum, item) => sum + parseFloat(item.venta_anual || 0), 0
          );
          setPrima(total);

          // Gráfica
          const responseGrafica = await primaTotal();
          setPrimaTotal(transformarDatos(responseGrafica));
        }
      } catch (error) {
        console.error("Error al obtener los datos del dashboard:", error);
      }
    };

    obtener();
  }, [date]);

  const nombresAfianzadoras =
    primaTotales.length > 0
      ? [
          ...new Set(
            primaTotales.flatMap((item) =>
              Object.keys(item).filter(
                (k) => k !== "name" && !k.startsWith("meta_")
              )
            )
          ),
        ]
      : [];

  return (
    <div className="w-full border-0">
      <CardContent className="p-1">
        <div className="flex flex-col gap-7">
          <div className="bg-white rounded-lg p-5 flex justify-between shadow-lg">
            <div className="flex flex-col gap-y-6">
              <p className="flex items-center gap-2 text-black text-3xl">
                <DollarSign strokeWidth={2} size={28} />
                {date?.from && date?.to
                  ? `Prima Total del ${format(
                      date.from,
                      "dd/MM/yyyy"
                    )} al ${format(date.to, "dd/MM/yyyy")}`
                  : "Prima Total"}
              </p>
              <p className="text-6xl text-black font-bold">
                $ {Number(prima).toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <div className="flex gap-3 items-center">
                <div className="mt-1">
                  {date?.from && (
                    <button
                      className="text-red-500"
                      onClick={() => setDate(undefined)}
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline-solid"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "yyyy/MM/dd")} -{" "}
                            {format(date.to, "yyyy/MM/dd")}
                          </>
                        ) : (
                          format(date.from, "yyyy/MM/dd")
                        )
                      ) : (
                        <span>Selecciona un rango</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={handleSelect}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-7">
              <div className="w-full col-span-2">
                <div className="bg-white p-5 rounded-lg shadow-lg">
                  <div>
                    <p className="flex items-center gap-2 text-3xl">
                      <TrendingUp strokeWidth={2} size={28} /> Distribución por
                      Afianzadora
                    </p>
                  </div>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={primaTotales}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        {nombresAfianzadoras.map((nombre, i) => (
                          <Line
                            key={nombre}
                            type="monotone"
                            dataKey={nombre}
                            stroke={
                              [
                                "#8884d8",
                                "#82ca9d",
                                "#ffc658",
                                "#ff7300",
                                "#076163",
                                "#9B3A4D",
                              ][i % nombresAfianzadoras.length]
                            }
                            strokeWidth={6}
                            dot={{
                              fill: [
                                "#8884d8",
                                "#82ca9d",
                                "#ffc658",
                                "#ff7300",
                                "#076163",
                                "#9B3A4D",
                              ][i % nombresAfianzadoras.length],
                              strokeWidth: 5,
                              r: 4,
                            }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Leyenda */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {nombresAfianzadoras.map((nombre, i) => (
                        <div
                          key={nombre}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: [
                                "#8884d8",
                                "#82ca9d",
                                "#ffc658",
                                "#ff7300",
                                "#076163",
                                "#9B3A4D",
                              ][i % nombresAfianzadoras.length],
                            }}
                          />
                          <span className="font-medium">{nombre}</span>
                        </div>
                      ))}
                    </div>

                    {/* Estadísticas */}
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                      {nombresAfianzadoras.map((nombre, i) => {
                        const values = primaTotales.map((d) => d[nombre] || 0);
                        const max = Math.max(...values);
                        return (
                          <div key={nombre} className="rounded-lg border p-3">
                            <div className="flex items-center gap-2 mb-2"></div>
                            <div className="space-y-1">
                              <div className="flex gap-2">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    backgroundColor: [
                                      "#8884d8",
                                      "#82ca9d",
                                      "#ffc658",
                                      "#ff7300",
                                      "#076163",
                                      "#9B3A4D",
                                    ][i % nombresAfianzadoras.length],
                                  }}
                                />
                                <div className="text-xs text-muted-foreground">
                                  Máximo
                                </div>
                              </div>

                              <div className="text-sm font-semibold">
                                ${max.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>
              </div>
              <div className="w-full col-span-1 rounded-lg bg-white p-5 shadow-lg">
                <p className="text-lg font-semibold mb-4">
                  Resumen por Afianzadora
                </p>
                <div className="space-y-4">
                  {date ? (
                    <div>
                      {afianzadoraFiltro.map((data, index) => {
                        const venta = Number(data.venta_anual);
                        const meta = Number(data.meta_anual) / 12;
                        const porcentaje = meta > 0 ? (venta / meta) * 100 : 0;
                        const ventaFaltante = meta - venta;

                        // Color de barra según porcentaje
                        const fillColor =
                          porcentaje >= 80
                            ? "bg-green-500"
                            : porcentaje >= 50
                            ? "bg-yellow-400"
                            : "bg-red-500";

                        return (
                          <div key={data.id_afi} className="space-y-2 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">
                                {data.nombre_afi}
                              </span>
                              <span className="text-xs text-gray-500">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold">
                                ${venta.toLocaleString("en-US")}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {porcentaje.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 ${fillColor} transition-all duration-300`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                            <p className="text-xs text-red-500">
                              Faltan: $
                              {ventaFaltante > 0
                                ? ventaFaltante.toLocaleString("en-US")
                                : "0"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      {afianzadoraMeta.map((data, index) => {
                        const venta = Number(data.venta_anual);
                        const meta = Number(data.meta_anual);
                        const porcentaje = meta > 0 ? (venta / meta) * 100 : 0;
                        const ventaFaltante = meta - venta;

                        // Color de barra según porcentaje
                        const fillColor =
                          porcentaje >= 80
                            ? "bg-green-500"
                            : porcentaje >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500";

                        return (
                          <div key={data.id_afi} className="space-y-2 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">
                                {data.nombre_afi}
                              </span>
                              <span className="text-xs text-gray-500">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold">
                                ${venta.toLocaleString("en-US")}
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {porcentaje.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 ${fillColor} transition-all duration-300`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                            <p className="text-xs text-red-500">
                              Faltan: $
                              {ventaFaltante > 0
                                ? ventaFaltante.toLocaleString("en-US")
                                : "0"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
