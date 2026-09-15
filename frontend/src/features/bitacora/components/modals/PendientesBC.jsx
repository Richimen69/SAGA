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
import { Input } from "@/components/ui/input";
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
  compromiso // <-- Ahora recibimos un arreglo aquí
}) {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 1. Estado inicial actualizado para incluir el flag "completado"
  const [compromisosList, setCompromisosList] = useState([
    {
      id: null,
      categoria: "",
      nombre_persona: "",
      observaciones: "",
      fecha_vencimiento: null,
      completado: false, // <-- Nuevo campo para controlar si es editable
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
    // 2. Modificamos el useEffect para procesar el ARREGLO de compromisos
    if (compromiso && Array.isArray(compromiso) && compromiso.length > 0) {
      const mapeados = compromiso.map((c) => ({
        id: c.id,
        categoria: c.categoria || "",
        nombre_persona: c.nombre_persona && c.nombre_persona !== 'none' ? c.nombre_persona : "",
        observaciones: c.observaciones || "",
        fecha_vencimiento: c.fecha_vencimiento ? new Date(c.fecha_vencimiento) : null,
        completado: c.completado || false, // Rescatamos si ya fue completado
      }));
      setCompromisosList(mapeados);
    } else {
      // Si no hay compromisos, inicializamos con uno vacío
      setCompromisosList([
        { id: null, categoria: "", nombre_persona: "", observaciones: "", fecha_vencimiento: null, completado: false }
      ]);
    }
  }, [compromiso]);

  const handleCompromisoChange = (index, field, value) => {
    const newList = [...compromisosList];
    newList[index][field] = value;
    setCompromisosList(newList);
  };

  const agregarCompromiso = () => {
    setCompromisosList([
      ...compromisosList,
      { id: null, categoria: "", nombre_persona: "", observaciones: "", fecha_vencimiento: null, completado: false }
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
      
      if (datosCliente?.estatusSeleccionado.value === 16) {
        const promesasCompromisos = compromisosList.map(comp => {
          const compromisoData = {
            tramite: id,
            nombre_persona: comp.nombre_persona || 'none',
            categoria: comp.categoria,
            observaciones: comp.observaciones,
            fecha_vencimiento: comp.fecha_vencimiento ? formatToISO(comp.fecha_vencimiento) : null,
            creado_por: usuario.usuario_usu,
          };

          if (comp.id) {
            return putCompromiso(compromisoData, comp.id);
          } else {
            return addCompromiso(compromisoData);
          }
        });

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
        <lottie-player autoplay loop mode="normal" src="/loader.json" style={{ width: "200px", height: "200px" }}></lottie-player>
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

        <div className="flex-1 overflow-y-auto pr-2 py-4">
          {datosCliente.estatusSeleccionado.value === 16 && (
            <div className="flex flex-col gap-6">
              
              {compromisosList.map((comp, index) => (
                <div key={index} className="relative border border-slate-200 rounded-md p-4 bg-slate-50/50 shadow-sm flex flex-col gap-4">
                  {/* 3. Título de la tarjeta, Label de COMPLETADO y Botón de borrar */}
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-600">Compromiso {index + 1}</span>
                      {comp.completado && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                          Completado
                        </span>
                      )}
                    </div>
                    {/* Solo mostramos el botón eliminar si el compromiso NO está completado */}
                    {!comp.completado && compromisosList.length > 1 && (
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

                  <div className="grid w-full gap-1.5">
                    <Label>Categoría</Label>
                    <Select 
                      disabled={comp.completado} // <-- Bloqueado si está completado
                      value={comp.categoria} 
                      onValueChange={(val) => handleCompromisoChange(index, "categoria", val)}
                    >
                      <SelectTrigger className={`w-full ${comp.completado ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}`}>
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

                  <div className="grid w-full gap-1.5">
                    <Label>Responsable</Label>
                    <Input 
                      disabled={comp.completado} // <-- Bloqueado
                      placeholder="Nombre de la persona" 
                      className={comp.completado ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
                      value={comp.nombre_persona}
                      onChange={(e) => handleCompromisoChange(index, "nombre_persona", e.target.value)}
                    />
                  </div>

                  <div className="grid w-full gap-1.5">
                    <Label>Observaciones</Label>
                    <Textarea
                      disabled={comp.completado} // <-- Bloqueado
                      placeholder="Escribe las observaciones..."
                      className={comp.completado ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
                      value={comp.observaciones}
                      onChange={(e) => handleCompromisoChange(index, "observaciones", e.target.value)}
                    />
                  </div>

                  <div className="grid w-full gap-1.5">
                    <Label>Fecha de Vencimiento</Label>
                    <DatePicker
                      disabled={comp.completado} // <-- Bloqueado
                      showIcon={!comp.completado}
                      toggleCalendarOnIconClick={!comp.completado}
                      selected={comp.fecha_vencimiento}
                      onChange={(date) => handleCompromisoChange(index, "fecha_vencimiento", date)}
                      dateFormat="dd/MM/yyyy"
                      className={`block w-full rounded-md border border-gray-400 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 ${comp.completado ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900'}`}
                      placeholderText="Seleccionar fecha"
                    />
                  </div>
                </div>
              ))}

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