import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { estatusTerminados } from "@/shared/utils/Constans";
import DatePicker from "react-datepicker";
import { formatToISO } from "@/shared/utils/dateHelpers";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // <-- Nuevo import para el campo Responsable
import { updateTramite, addCompromiso, putCompromiso } from "../../services/tramites.service";
import { useNavigate } from "react-router-dom";
import { guardarTareaCompletada } from "@/features/bitacora/services/tareas";
import { useUsuario } from "../../hooks";

export function PendientesBC({
  onClose,
  id,
  datosCliente,
  tareas,
  idMovimiento,
  compromiso // <--- Puede venir un compromiso previo desde los props
}) {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 1. Estado convertido en un Arreglo para soportar múltiples compromisos
  const [compromisosList, setCompromisosList] = useState([
    {
      id: null, // Para saber si es actualización o creación nueva
      categoria: "",
      nombre_persona: "", // <-- Nuevo campo Responsable
      observaciones: "",
      fecha_vencimiento: null,
    }
  ]);

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  useEffect(() => {
    // Si ya existe un compromiso proveniente de los props, inicializamos el primer elemento con esa data
    if (compromiso) {
      setCompromisosList([
        {
          id: compromiso.id || null,
          categoria: compromiso.categoria || "",
          nombre_persona: compromiso.nombre_persona && compromiso.nombre_persona !== 'none' ? compromiso.nombre_persona : "",
          observaciones: compromiso.observaciones || "",
          fecha_vencimiento: compromiso.fecha_vencimiento ? new Date(compromiso.fecha_vencimiento) : null,
        }
      ]);
    }
  }, [compromiso]);

  // 2. Funciones para manejar el arreglo de compromisos
  const handleCompromisoChange = (index, field, value) => {
    const newList = [...compromisosList];
    newList[index][field] = value;
    setCompromisosList(newList);
  };

  const agregarCompromiso = () => {
    setCompromisosList([
      ...compromisosList,
      { id: null, categoria: "", nombre_persona: "", observaciones: "", fecha_vencimiento: null }
    ]);
  };

  const eliminarCompromiso = (index) => {
    const newList = compromisosList.filter((_, i) => i !== index);
    setCompromisosList(newList);
  };

  const guardarTarea = async () => {
    const fecha = obtenerFechaActual();
    const promesas = idMovimiento.map((tareaId) => {
      const completado = tareas.includes(tareaId) ? 1 : 0;
      const datos = {
        tramite_id: id,
        tarea_id: tareaId,
        completado,
        fecha_completado: fecha,
      };
      return guardarTareaCompletada(datos);
    });

    const resultados = await Promise.allSettled(promesas);

    resultados.forEach((resultado, index) => {
      if (resultado.status === "rejected") {
        toast.error(`Hubo un problema al guardar la tarea ID ${idMovimiento[index]}`);
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await guardarTarea();
    
    const tieneCompromisoValue = datosCliente?.estatusSeleccionado?.value === 16 ? "SI" : "NO";
    let estadoTramite = "";
    
    if (!datosCliente?.estadoTramite?.value && !datosCliente?.estadoTramite?.estatus === estatusTerminados) {
      toast.error("Selecciona estatus de trámite");
      setLoading(false);
      return; 
    }

    if (datosCliente?.estatusSeleccionado?.value && estatusTerminados.includes(datosCliente.estatusSeleccionado?.value)) {
      estadoTramite = "";
    } else {
      estadoTramite = datosCliente.estadoTramite.value;
    }

    const data = {
      fecha: formatToISO(datosCliente.fecha) || "",
      agente_nombre: datosCliente.agenteSeleccionado?.value || "",        
      beneficiario_id: datosCliente.beneficiario?.value || "",
      beneficiario_nombre: datosCliente.beneficiario?.label || "",
      movimiento: datosCliente.movimientoSeleccionado.value || "",
      afianzadora_id: datosCliente.afianzadora?.value || "",
      afianzadora_nombre: datosCliente.afianzadora?.label || "",
      estatus: datosCliente.estatusSeleccionado.value || "",
      
      // Guardamos la observación del primer compromiso en el trámite (o null si no hay)
      observaciones_pago: datosCliente.observaciones || "",
      numero_fianza: datosCliente.fianza || "",
      prima_inicial: datosCliente.prima_inicial ? parseFloat(Number(datosCliente.prima_inicial).toFixed(2)) : null,
      prima_futura: datosCliente.prima_futura ? parseFloat(Number(datosCliente.prima_futura).toFixed(2)) : null,
      prima_total: parseFloat((datosCliente.prima_total || 0).toFixed(2)),
      importe_total: datosCliente.importe_total ? parseFloat(Number(datosCliente.importe_total).toFixed(2)) : null,

      fecha_termino: formatToISO(datosCliente.fecha_termino) || null,
      fecha_pago: formatToISO(datosCliente.fechaPago) || null,
      fecha_emision: formatToISO(datosCliente.fecha_emision) || null,
      estatus_pago: datosCliente.estatusPago || null,
      tiene_compromiso: tieneCompromisoValue || null,
      observacion_compromiso: compromisosList[0]?.observaciones || null,
      creado_por: usuario.usuario_usu,
      tipo_proceso: estadoTramite || "",
      tipo_fianza: datosCliente.tipo_fianza || "",
      relativo_a: datosCliente.relativo_a || ""
    };
    
    try {
      const result = await updateTramite(data, id);
      
      // 3. Procesamos múltiples compromisos (Crear o Actualizar)
      if (datosCliente?.estatusSeleccionado.value === 16) {
        const promesasCompromisos = compromisosList.map(comp => {
          const compromisoData = {
            tramite: id,
            nombre_persona: comp.nombre_persona || 'none', // Asignado
            categoria: comp.categoria,
            observaciones: comp.observaciones,
            fecha_vencimiento: formatToISO(comp.fecha_vencimiento),
            creado_por: usuario.usuario_usu,
          };

          // Si el objeto tiene un ID previo, hace PUT. Si no, hace POST (nuevo compromiso)
          if (comp.id) {
            return putCompromiso(compromisoData, comp.id);
          } else {
            return addCompromiso(compromisoData);
          }
        });

        // Esperar a que se guarden todos los compromisos
        await Promise.all(promesasCompromisos);
      }

      if (result.success) {
        navigate("/tramites");
      } else {
        toast.error("Error al guardar el trámite");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Hubo un problema al guardar el trámite.");
    } finally {
      toast.success("Guardado exitosamente.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 backdrop-blur-xs">
        <lottie-player
          autoplay
          loop
          mode="normal"
          src="/loader.json"
          style={{ width: "200px", height: "200px" }}
        ></lottie-player>
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          {datosCliente?.estatusSeleccionado?.value === 16 ? (
            <DialogTitle>¿Tiene Compromisos?</DialogTitle>
          ) : (
            <DialogTitle>¿Desea guardar los cambios?</DialogTitle>
          )}
        </DialogHeader>

        {/* Contenedor escroleable por si agregan varios compromisos */}
        <div className="flex-1 overflow-y-auto pr-2 py-4">
          {datosCliente.estatusSeleccionado.value === 16 && (
            <div className="flex flex-col gap-6">
              
              {compromisosList.map((comp, index) => (
                <div key={index} className="relative border border-slate-200 rounded-md p-4 bg-slate-50/50 shadow-sm flex flex-col gap-4">
                  {/* Título de la tarjeta y Botón de borrar */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-slate-600">Compromiso {index + 1}</span>
                    {compromisosList.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                        onClick={() => eliminarCompromiso(index)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>

                  {/* 1. Categoría */}
                  <div className="grid w-full gap-1.5">
                    <Label>Categoría</Label>
                    <Select value={comp.categoria} onValueChange={(val) => handleCompromisoChange(index, "categoria", val)}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>COMPROMISOS</SelectLabel>
                          <SelectItem value="BC-AFIANZADORA">BC-AFIANZADORA</SelectItem>
                          <SelectItem value="CLIENTES-AFIANZADORA">CLIENTES-AFIANZADORA</SelectItem>
                          <SelectItem value="CLIENTES-BC">CLIENTES-BC</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. Responsable (NUEVO CAMPO) */}
                  <div className="grid w-full gap-1.5">
                    <Label>Responsable</Label>
                    <Input 
                      placeholder="Nombre de la persona" 
                      className="bg-white"
                      value={comp.nombre_persona}
                      onChange={(e) => handleCompromisoChange(index, "nombre_persona", e.target.value)}
                    />
                  </div>

                  {/* 3. Observaciones */}
                  <div className="grid w-full gap-1.5">
                    <Label>Observaciones</Label>
                    <Textarea
                      placeholder="Escribe las observaciones..."
                      className="bg-white"
                      value={comp.observaciones}
                      onChange={(e) => handleCompromisoChange(index, "observaciones", e.target.value)}
                    />
                  </div>

                  {/* 4. Fecha */}
                  <div className="grid w-full gap-1.5">
                    <Label>Fecha de Vencimiento</Label>
                    <DatePicker
                      showIcon
                      toggleCalendarOnIconClick
                      selected={comp.fecha_vencimiento}
                      onChange={(date) => handleCompromisoChange(index, "fecha_vencimiento", date)}
                      dateFormat="dd/MM/yyyy"
                      className="block w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      placeholderText="Seleccionar fecha"
                    />
                  </div>
                </div>
              ))}

              {/* Botón para agregar más compromisos */}
              <Button type="button" variant="outline" className="w-full border-dashed border-2" onClick={agregarCompromiso}>
                + Agregar otro compromiso
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleSubmit}>
            Guardar Trámite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}