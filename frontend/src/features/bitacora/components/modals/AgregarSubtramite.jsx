import React from "react";
import { FilePlus, X } from "lucide-react";
import { estatus_pagos } from "@/shared/utils/Constans";
import { useState, useEffect } from "react";
import FormPrimas from "../forms/FormPrimas";
import { fetchTramitesId } from "../../services/tramites.service";
import FormDataPicker from "../ui/FormDataPicker";
import FormSelectField from "../ui/FormSelect";
import useGenerarFolio from "@/shared/hooks/GenerarFolioUser";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { crearTramite } from "../../services/tramites.service";
import { useUsuario, useCatalogos } from "../../hooks";
import { estatusTerminados } from "@/shared/utils/Constans";

export const movimientos = [
  { value: 4, label: "ANULACIÓN" },
  { value: 5, label: "AUMENTO" },
  { value: 9, label: "CANCELACIÓN" },
  { value: 17, label: "DISMINUCIÓN" },
  { value: 22, label: "MOVIMIENTO ESPECIAL P-A" },
  { value: 24, label: "PRÓRROGA" },
];

export default function AgregarSubtramite({ isOpen, onClose, id }) {

  if (!isOpen) return null;
  const usuario = useUsuario();
  const { catalogos, loading: catalogosLoading } = useCatalogos();
  const [estatus, setEstatus] = useState([]);

  const navigate = useNavigate();
  const nuevoFolio = useGenerarFolio();
  const [formData, setFormData] = useState({
    prima_inicial: "",
    prima_futura: "",
    importe_total: "",
    fechaNew: null,
    fechaTermino: null,
    movimientoSel: "",
    estatusSel: "",
    estatusPago: "PENDIENTE",
  });
  useEffect(() => {

    if (catalogosLoading || !id) return;

    const fetchData = async () => {
      try {
        const data = await fetchTramitesId(id);
        const { estatus: estatusData } = catalogos;
        setEstatus(estatusData);
        console.log(data.data)
        if (data.data) {
          const estatusMatch = estatusData.find(
            (opt) => opt.value === data.estatus || opt.label === data.estatus
          );
          setFormData((prev) => ({
            ...prev,
            ...data.data,
            estatusSeleccionado: estatusMatch || null,
          }));
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    fetchData();
  }, [id, catalogosLoading]);
  const handleFormChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Determinar el estado negativo (Sintaxis concisa)
    const isNegative =
      Number(formData.movimientoSel) === 4 ||
      Number(formData.movimientoSel) === 17;

    const pago = formData.fechaPago ? "PAGADA" : formData.estatusPago;

    // 2. Parsear y limpiar todos los valores numéricos AHORA
    const pInicial = parseFloat(formData.prima_inicial) || 0;
    const pFutura = parseFloat(formData.prima_futura) || 0;
    const iTotal = parseFloat(formData.importe_total) || 0;
    const toISODate = (dateStr) => {
      if (!dateStr || typeof dateStr !== 'string') return null;
      
      // Dividimos el string dd/mm/yyyy
      const [day, month, year] = dateStr.split('/');
      
      // Retornamos en el orden yyyy-mm-dd
      return `${year}-${month}-${day}`;
    };
    // 3. Mapear y transformar el objeto de envío (Aplicando el signo a los NÚMEROS)
    const dataToSend = {
      // Datos constantes o de origen simple
      creado_por: usuario.usuario_usu,
      folio: nuevoFolio,
      fecha: toISODate(formData.fechaNew),
      agente_id: formData.agente_id,
      agente_nombre: formData.agente_nombre,
      beneficiario_id: formData.beneficiario_id,
      beneficiario_nombre: formData.beneficiario_nombre,
      movimiento: Number(formData.movimientoSel),
      afianzadora_nombre: formData.afianzadora_nombre,
      estatus: Number(formData.estatusSel),
      observaciones: formData.observaciones || "", // Si tienes un campo observaciones en formData
      cliente_id: formData.cliente_id,
      cliente_nombre: formData.cliente_nombre,
      numero_fianza: formData.numero_fianza,

      // Datos de primas (ajustados)
      prima_inicial: isNegative ? -pInicial : pInicial,
      prima_futura: isNegative ? -pFutura : pFutura,
      importe_total: isNegative ? -iTotal : iTotal,

      // Prima total: calculado internamente aquí
      prima_total: isNegative ? -(pInicial + pFutura) : pInicial + pFutura,

      // Fechas y otros campos
      fecha_termino: toISODate(formData.fechaTermino),
      fecha_pago: formData.fecha_pago,
      estatus_pago: pago,
      tipo_proceso: "BC",
      afianzadora_id: formData.afianzadora_id,
    };
    // 4. Llamada a la API
    try {
      // Asumiendo que createSubtramite(data) es tu función de fetch
      const result = await crearTramite(dataToSend);
      console.log(dataToSend)
      if (result.success) {
        toast.success("Subtrámite guardado exitosamente.");
        onClose()
      } else {
        toast.error("Error al guardar el subtrámite:");
      }
    } catch (error) {
      toast.error(error.message || "Error al guardar el subtrámite.");
    }
  };
  // 1. Traduce de "2026-07-28" (Tu Base de Datos) a "28/07/2026" (El Picker)
  const formatoParaPicker = (fechaIso) => {
    if (!fechaIso) return "";
    const [year, month, day] = fechaIso.split("-");
    return `${day}/${month}/${year}`;
  };

  // 2. Traduce de "28/07/2026" (El Picker) a "2026-07-28" (Tu Base de Datos)
  const interceptarFecha = (name, fechaPicker) => {
    if (!fechaPicker) {
      // Si el usuario borra la fecha, mandamos null o vacío
      handleFormChange(name, null); 
      return;
    }
    const [day, month, year] = fechaPicker.split("/");
    const fechaCorregida = `${year}-${month}-${day}`;
    
    // Aquí llamas a tu función original pasándole el formato que tu sistema necesita
    handleFormChange(name, fechaCorregida); 
  };
  const formatToDisplay = (isoDate) => {
    if (!isoDate || isoDate.includes('/')) return isoDate; // Evita doble formateo
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl lg:w-5/12 md:w-9/12 mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
              <FilePlus className="w-5 h-5 " />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Agregar Movimiento
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <FormDataPicker
            label="Fecha"
            name="fechaNew"
            value={formatToDisplay(formData.fechaNew)}
            onChange={handleFormChange}
          />
          <FormSelectField
            label="Movimiento"
            value={formData.movimientoSel}
            name="movimientoSel"
            onChange={handleFormChange}
            options={movimientos}
            defaultLabel="Selecciona movimiento"
          />
          <FormSelectField
            label="Estado"
            value={formData.estatusSel}
            name="estatusSel"
            onChange={handleFormChange}
            options={estatus}
            defaultLabel="Selecciona el estado"
          />
          {estatusTerminados.includes(Number(formData.estatusSel)) && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="col-span-2">
                <FormDataPicker
                  label="Fecha Termino"
                  name="fechaTermino"
                  value={formData.fechaTermino}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-span-3">
                {estatusTerminados.includes(Number(formData.movimientoSel)) ? null : (
                  <div className="flex gap-3">
                    <FormDataPicker
                      label="Fecha Pago"
                      name="fechaPago"
                      value={formatoParaPicker(formData.fecha_pago)}
                      onChange={handleFormChange}
                    />
                    {formData.fechaPago ? (
                      <div className="flex items-center justify-center px-3 mt-6 text-base font-semibold">
                        <p>PAGADA</p>
                      </div>
                    ) : (
                      <FormSelectField
                        label="Estado Pago"
                        value={formData.estatusPago}
                        name="estatusPago"
                        onChange={handleFormChange}
                        options={estatus_pagos}
                        defaultLabel="Selecciona el estado"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <FormPrimas
            formData={formData}
            setFormData={setFormData}
            negative={
              Number(formData.movimientoSel) === 4||
              Number(formData.movimientoSel) === 17
            }
          />
          <div className="flex gap-5 justify-end mt-4">
            <button
              className="bg-[#d8324b] hover:bg-[#c2313e] text-white font-semibold px-4 py-2 rounded-lg items-center flex justify-center"
              onClick={onClose}
            >
              <label className="px-1 cursor-pointer">Cancelar</label>
            </button>
            <button
              className="bg-primary hover:bg-[#1b4332] text-white font-semibold px-4 py-2 rounded-lg items-center flex justify-center"
              onClick={handleSubmit}
            >
              <label className="px-1 cursor-pointer">Aceptar</label>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
