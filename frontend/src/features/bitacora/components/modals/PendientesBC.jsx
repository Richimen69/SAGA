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
import { addCompromiso } from "../../services/tramites.service";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateTramite } from "../../services/tramites.service";
import { useNavigate } from "react-router-dom";
import { guardarTareaCompletada } from "@/features/bitacora/services/tareas";
import { useUsuario } from "../../hooks";
import { putCompromiso } from "../../services/tramites.service";
export function PendientesBC({
  onClose,
  id,
  datosCliente,
  tareas,
  idMovimiento,
  compromiso
}) {
  const usuario = useUsuario();
  const navigate = useNavigate();
  const [observaciones, setObservaciones] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fechaVencimiento, setFecha] = useState(null);
  const [loading, setLoading] = useState(false);
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };
  useEffect(() => {
    if (compromiso) {
      setCategoria(compromiso.categoria || "");
      setObservaciones(compromiso.observaciones || "");
      if (compromiso.fecha_vencimiento) {
        setFecha(new Date(compromiso.fecha_vencimiento));
      }
    }
  }, [compromiso]);
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
        toast.error(
          `Hubo un problema al guardar la tarea ID ${idMovimiento[index]}`
        );
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await guardarTarea();
    const tieneCompromisoValue =
      datosCliente?.estatusSeleccionado?.value === 16 ? "SI" : "NO";
    let estadoTramite = "";
    if (
      !datosCliente?.estadoTramite?.value &&
      !datosCliente?.estadoTramite?.estatus === estatusTerminados
    ) {
      toast.error("Selecciona estatus de trámite");
      return; // Detiene la ejecución si falta el estatus de trámite
    }

    if (
      datosCliente?.estatusSeleccionado?.value &&
      estatusTerminados.includes(datosCliente.estatusSeleccionado?.value)
    ) {
      estadoTramite = "";
    } else {
      estadoTramite = datosCliente.estadoTramite.value;
    }

    const data = {
      // 1. Fecha principal
      fecha: formatToISO(datosCliente.fecha) || "",

      beneficiario_id: datosCliente.beneficiario?.value || "",
      beneficiario_nombre: datosCliente.beneficiario?.label || "",
      movimiento: datosCliente.movimientoSeleccionado.value || "",
      afianzadora_id: datosCliente.afianzadora?.value || "",
      afianzadora_nombre: datosCliente.afianzadora?.label || "",
      estatus: datosCliente.estatusSeleccionado.value || "",
      observaciones_pago: datosCliente.observaciones || "",
      numero_fianza: datosCliente.fianza || "",
      prima_inicial: datosCliente.prima_inicial
        ? parseFloat(Number(datosCliente.prima_inicial).toFixed(2))
        : null,
      prima_futura: datosCliente.prima_futura
        ? parseFloat(Number(datosCliente.prima_futura).toFixed(2))
        : null,
      prima_total: parseFloat((datosCliente.prima_total || 0).toFixed(2)),
      importe_total: datosCliente.importe_total
        ? parseFloat(Number(datosCliente.importe_total).toFixed(2))
        : null,

      // 2. Fecha de término
      fecha_termino: formatToISO(datosCliente.fecha_termino) || null,

      // 3. Fecha de pago
      fecha_pago: formatToISO(datosCliente.fechaPago) || null,
      fecha_emision: formatToISO(datosCliente.fecha_emision) || null,
      estatus_pago: datosCliente.estatusPago || null,
      tiene_compromiso: tieneCompromisoValue || null,
      observacion_compromiso: observaciones || null,
      creado_por: usuario.usuario_usu,
      tipo_proceso: estadoTramite || "",
      tipo_fianza: datosCliente.tipo_fianza || "",
      relativo_a: datosCliente.relativo_a || ""
    };
    
    const compromisoData = {
      tramite: id,
      nombre_persona: 'none',
      categoria: categoria,
      observaciones: observaciones,
      fecha_vencimiento: formatToISO(fechaVencimiento),
      creado_por: usuario.usuario_usu,
    };
    try {
      const result = await updateTramite(data, id);
      if (datosCliente?.estatusSeleccionado.value === 16) {
        if (compromiso) {
          await putCompromiso(compromisoData, compromiso.id);
        } else {    
          await addCompromiso(compromisoData);
        }
      }
      if (result.success) {
        navigate("/tramites");
        console.log(data);
      } else {
        console.log(data);
        toast.error("Error al guardar");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Hubo un problema al guardar el trámite.");
    } finally {
      toast.success("Guardado exitosamente.");
      setLoading(false); // Oculta loader
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50  backdrop-blur-xs">
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {datosCliente?.estatusSeleccionado?.value === 16 ? (
            <DialogTitle>¿Tiene Compromisos?</DialogTitle>
          ) : (
            <DialogTitle>¿Desea guardar los cambios?</DialogTitle>
          )}
        </DialogHeader>
        {datosCliente.estatusSeleccionado.value === 16 && (
          <div className="grid gap-4 py-4 items-center justify-center">
            <div className="grid w-full grid-cols-4 items-center gap-4">
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>COMPROMISOS</SelectLabel>
                    <SelectItem value="BC-AFIANZADORA">
                      BC-AFIANZADORA
                    </SelectItem>
                    <SelectItem value="CLIENTES-AFIANZADORA">
                      CLIENTES-AFIANZADORA
                    </SelectItem>
                    <SelectItem value="CLIENTES-BC">CLIENTES-BC</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Observaciones</Label>
              <Textarea
                placeholder="Escribe las observaciones..."
                id="message"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
            <div className="grid w-full gap-1.5 relative">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Fecha
                </Label>
                {/* DatePicker input real con padding izquierdo para que no se solape con el ícono */}
                <div className="col-span-3">
                  <DatePicker
                    showIcon
                    toggleCalendarOnIconClick
                    selected={fechaVencimiento} // Asegúrate que este sea tu estado
                    onChange={(date) => setFecha(date)} // Actualiza la misma variable
                    dateFormat="dd/MM/yyyy"
                    // Añadí 'bg-white' y corregí 'focus:outline-hidden' por 'focus:outline-none'
                    className="block w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholderText="Seleccionar fecha"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Guardar Tramite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
