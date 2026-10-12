import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CardContent } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  CalendarIcon,
  Trash2,
  Download,
  Loader2, // <-- NUEVO: Ícono de carga animado
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx"; 

import {
  primaTotal,
  metaAnual,
  metaPorFiltro,
  obtenerTramitesParaExcel,
} from "@/features/dashboard/services/kpi.service";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// CONSTANTES FUERA DEL COMPONENTE
const TRADUCCION_MESES = {
  January: "Enero", February: "Febrero", March: "Marzo",
  April: "Abril", May: "Mayo", June: "Junio",
  July: "Julio", August: "Agosto", September: "Septiembre",
  October: "Octubre", November: "Noviembre", December: "Diciembre",
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#076163", "#9B3A4D"];

// FUNCIONES PURAS
function transformarDatos(dataDelBackend) {
  if (!dataDelBackend || dataDelBackend.length === 0) return [];

  const afianzadoras = [...new Set(dataDelBackend.map((item) => item.nombre_afi))];
  const resultado = [];

  for (const mesIngles in TRADUCCION_MESES) {
    const mesEsp = TRADUCCION_MESES[mesIngles];
    const fila = { name: mesEsp };

    afianzadoras.forEach((afi) => {
      const registro = dataDelBackend.find(
        (item) => item.mes === mesIngles && item.nombre_afi === afi,
      );

      fila[afi] = registro ? parseFloat(registro.venta_mensual) : 0;
      fila["meta_" + afi] = registro ? parseFloat(registro.meta_mensual) : 0;
    });

    resultado.push(fila);
  }
  return resultado;
}

export default function Barra() {
  const [primaTotales, setPrimaTotal] = useState([]);
  const [afianzadoraMeta, setAfianzadoraMeta] = useState([]);
  const [afianzadoraFiltro, setAfianzadoraFiltro] = useState([]);
  const [date, setDate] = useState();
  const [prima, setPrima] = useState(0);
  
  // NUEVO: Estado para saber si la página está cargando
  const [cargando, setCargando] = useState(true); 
  const [descargandoExcel, setDescargandoExcel] = useState(false);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        setCargando(true); // Bloqueamos la pantalla e iniciamos la animación
        
        if (date?.from && date?.to) {
          const fechaInicio = format(date.from, "yyyy-MM-dd");
          const fechaFin = format(date.to, "yyyy-MM-dd");

          const [responseTarjetas, responseGrafica] = await Promise.all([
            metaPorFiltro(fechaInicio, fechaFin),
            primaTotal(fechaInicio, fechaFin)
          ]);

          const datosValidos = Array.isArray(responseTarjetas) ? responseTarjetas : [];
          setAfianzadoraFiltro(datosValidos);
          setAfianzadoraMeta([]);
          setPrima(datosValidos.reduce((sum, item) => sum + parseFloat(item.venta_anual || 0), 0));
          setPrimaTotal(transformarDatos(responseGrafica));

        } else if (!date || (!date.from && !date.to)) {
          const [responseTarjetas, responseGrafica] = await Promise.all([
            metaAnual(),
            primaTotal()
          ]);

          const datosValidos = Array.isArray(responseTarjetas) ? responseTarjetas : [];
          setAfianzadoraMeta(datosValidos);
          setAfianzadoraFiltro([]);
          setPrima(datosValidos.reduce((sum, item) => sum + parseFloat(item.venta_anual || 0), 0));
          setPrimaTotal(transformarDatos(responseGrafica));
        }
      } catch (error) {
        console.error("Error al obtener los datos del dashboard:", error);
      } finally {
        setCargando(false); // Siempre detenemos la animación, incluso si hay error
      }
    };

    obtenerDatos();
  }, [date]);

  const handleSelect = (range) => {
    if (range?.from && range?.to) {
      setDate(range); 
    } else if (range?.from) {
      setDate({ from: range.from, to: undefined }); 
    } else {
      setDate(undefined); 
    }
  };

  const descargarExcel = async (nombreAfianzadora = null) => {
    try {
      setDescargandoExcel(true); 

      const fechaInicio = date?.from ? format(date.from, "yyyy-MM-dd") : null;
      const fechaFin = date?.to ? format(date.to, "yyyy-MM-dd") : null;

      const datosExcel = await obtenerTramitesParaExcel(
        fechaInicio,
        fechaFin,
        nombreAfianzadora,
      );

      if (!datosExcel || datosExcel.length === 0) {
        alert("No hay trámites para exportar en este periodo.");
        return; 
      }

      const worksheet = XLSX.utils.json_to_sheet(datosExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Trámites");

      let nombreArchivo = "Tramites_Dashboard.xlsx";
      if (fechaInicio && fechaFin) {
        nombreArchivo = `Tramites_${format(date.from, "dd-MM-yyyy")}_al_${format(date.to, "dd-MM-yyyy")}.xlsx`;
      }
      if (nombreAfianzadora) {
        nombreArchivo = `${nombreAfianzadora}_${nombreArchivo}`;
      }

      XLSX.writeFile(workbook, nombreArchivo);
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      alert("Hubo un error al generar el archivo.");
    } finally {
      setDescargandoExcel(false);
    }
  };

  const nombresAfianzadoras = useMemo(() => {
    return primaTotales.length > 0
      ? [
          ...new Set(
            primaTotales.flatMap((item) =>
              Object.keys(item).filter((k) => k !== "name" && !k.startsWith("meta_")),
            ),
          ),
        ]
      : [];
  }, [primaTotales]);

  const datosMostrar = (date?.from && date?.to) ? afianzadoraFiltro : afianzadoraMeta;

// NUEVO: INTERFAZ DE CARGA (ELEGANTE Y LIMPIA)
  if (cargando) {
    return (
      <div className="w-full border-0 transition-all">
        <CardContent className="p-1">
          <div className="flex flex-col gap-7">
            
            {/* Header de Carga */}
            <div className="bg-white rounded-lg p-5 flex justify-between shadow-lg">
              <div className="flex flex-col gap-y-6 w-1/2">
                <div className="h-8 w-64 bg-slate-100 rounded-md animate-pulse" />
                <div className="h-14 w-48 bg-slate-100 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center">
                <div className="h-10 w-[300px] bg-slate-100 rounded-md animate-pulse" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-7">
              {/* Gráfica de Carga */}
              <div className="w-full col-span-2 bg-white p-5 rounded-lg shadow-lg">
                <div className="h-8 w-64 bg-slate-100 rounded-md mb-8 animate-pulse" />
                <div className="w-full h-[400px] bg-slate-50/50 border border-slate-50 rounded-xl flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 text-slate-300 animate-spin mb-4" />
                  <p className="text-slate-400 font-medium">Calculando métricas...</p>
                </div>
              </div>

              {/* Resumen Lateral de Carga */}
              <div className="w-full col-span-1 bg-white p-5 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-8 w-24 bg-slate-100 rounded-md animate-pulse" />
                </div>
                
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-40 bg-slate-100 rounded-md animate-pulse" />
                        <div className="h-4 w-8 bg-slate-100 rounded-md animate-pulse" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 w-24 bg-slate-100 rounded-md animate-pulse" />
                        <div className="h-4 w-12 bg-slate-100 rounded-md animate-pulse" />
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-2">
                        <div className="h-2 bg-slate-200 rounded-full w-1/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div className="w-full border-0 transition-all">
      <CardContent className="p-1">
        <div className="flex flex-col gap-7">
          {/* HEADER */}
          <div className="bg-white rounded-lg p-5 flex justify-between shadow-lg">
            <div className="flex flex-col gap-y-6">
              <p className="flex items-center gap-2 text-black text-3xl">
                <DollarSign strokeWidth={2} size={28} />
                {date?.from && date?.to
                  ? `Prima Total del ${format(date.from, "dd/MM/yyyy")} al ${format(date.to, "dd/MM/yyyy")}`
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
                      className="text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => setDate(undefined)}
                      title="Borrar fechas"
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
                        !date && "text-muted-foreground",
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
              {/* GRÁFICA */}
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
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        {nombresAfianzadoras.map((nombre, i) => (
                          <Line
                            key={nombre}
                            type="monotone"
                            dataKey={nombre}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={6}
                            dot={{ fill: COLORS[i % COLORS.length], strokeWidth: 5, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Leyenda y Estadísticas (Se mantienen igual) */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {nombresAfianzadoras.map((nombre, i) => (
                        <div key={nombre} className="flex items-center gap-2 text-sm">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="font-medium">{nombre}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                      {nombresAfianzadoras.map((nombre, i) => {
                        const values = primaTotales.map((d) => d[nombre] || 0);
                        const max = Math.max(...values);
                        return (
                          <div key={nombre} className="rounded-lg border p-3">
                            <div className="space-y-1">
                              <div className="flex gap-2">
                                <div className="h-2 w-2 mt-1 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <div className="text-xs text-muted-foreground">Máximo</div>
                              </div>
                              <div className="text-sm font-semibold">${max.toLocaleString()}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </div>
              </div>
              
              {/* RESUMEN LATERAL */}
              <div className="w-full col-span-1 rounded-lg bg-white p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-lg font-semibold">
                    Resumen por Afianzadora
                  </p>
                  
                  {/* NUEVO: Botón general con ícono de Loader2 animado */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => descargarExcel()}
                    disabled={descargandoExcel || datosMostrar.length === 0}
                  >
                    {descargandoExcel ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {descargandoExcel ? "Generando..." : "Excel (Todo)"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {datosMostrar.map((data, index) => {
                    const venta = Number(data.venta_anual);
                    const meta = (date?.from && date?.to)
                        ? Number(data.meta_anual) / 12
                        : Number(data.meta_anual);
                    
                    const porcentaje = meta > 0 ? (venta / meta) * 100 : 0;
                    const ventaFaltante = meta - venta;

                    const fillColor =
                      porcentaje >= 80 ? "bg-green-500"
                        : porcentaje >= 50 ? "bg-yellow-400"
                        : "bg-red-500";

                    return (
                      <div key={data.id_afi} className="space-y-2 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm flex items-center gap-2">
                            {data.nombre_afi}
                            
                            {/* NUEVO: Botón individual con Loader2 animado */}
                            <button
                              onClick={() => descargarExcel(data.nombre_afi)}
                              disabled={descargandoExcel}
                              className="text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                              title={`Descargar Excel de ${data.nombre_afi}`}
                            >
                              {descargandoExcel ? (
                                <Loader2 size={14} className="animate-spin text-green-600" />
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
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
                          Faltan: ${ventaFaltante > 0 ? ventaFaltante.toLocaleString("en-US") : "0"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}