import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Toaster, toast } from "sonner";
import GestionObservaciones from "../components/GestionObservaciones";
import FormPrimas from "../components/forms/FormPrimas";
import { parseDateFromBackend } from "@/shared/utils/dateHelpers";
import { useUsuario, useCatalogos } from "../hooks";
import { Info, Calendar, CheckCircle, FileText, Trash2 } from "lucide-react";
import {
  estatusTerminados,
  movimientosPermitidos,
  estatus_pagos,
  estadoTramite,
  estadoTramiteAseguradora,
} from "@/shared/utils/Constans";
import { format, parseISO } from "date-fns";
import {
  obtenerMovimientos,
  obtenerTareas,
  obtenerTareasCompletas,
} from "@/features/bitacora/services/tareas";
import { fetchTramitesId } from "../services/tramites.service";
import { PendientesBC } from "@/features/bitacora/components/modals/PendientesBC";
import InfoTramite from "../components/InfoTramite";

function TramiteCliente() {
  const usuario = useUsuario();
  const { catalogos, loading: catalogosLoading } = useCatalogos();
  const location = useLocation();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [estatusPagoSeleccionado, setEstatusPago] = useState(null);
  const [estadoTareas, setEstadoTareas] = useState(null);
  const [movimientosTar, setMovimientoTar] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [tareas, setTareas] = useState([]);
  const opcionesTareas = [
    { value: 1, label: "Bloqueado" },
    { value: 0, label: "Desbloqueado" },
  ];

  const { id } = location.state || {};
  const [formData, setFormData] = useState({
    id: location.state?.id,
    estatusSeleccionado: null,
    movimientoSeleccionado: null,
    estatusPago: null,
    fechaPago: null,
    fecha_termino: null,
    fecha_emision: null,
    observaciones: "",
    fianza: "",
    prima_inicial: "",
    prima_futura: "",
    prima_total: "",
    importe_total: "",
    estadoTramite: "",
    afianzadora: "",
    beneficiario: "",
    fecha: "",
    tipo_fianza: ""
  });

  useEffect(() => {
    if (catalogosLoading || !id) return;

    const { afianzadoras, beneficiarios, estatus, movimientos } = catalogos;

    if (!afianzadoras.length || !beneficiarios.length) return;

    const fetchData = async () => {
      try {
        const clienteData = await fetchTramitesId(id);
        setClientes(clienteData.data);
        if (clienteData) {
          const tipoProcesoSeleccionado =
            estadoTramite.find(
              (option) => option.value === clienteData.data.tipo_proceso
            ) ||
            estadoTramiteAseguradora.find(
              (option) => option.value === clienteData.data.tipo_proceso
            );

          const movimientoEncontrado = movimientos.find(
            (option) =>
              option.label.toLowerCase().trim() ===
              clienteData?.data.movimiento_info?.nombre?.toLowerCase().trim()
          );

          setFormData((prev) => ({
            ...prev,
            prima_inicial: clienteData.data.prima_inicial || "",
            prima_futura: clienteData.data.prima_futura || "",
            prima_total: clienteData.data.prima_total || "",
            importe_total: clienteData.data.importe_total || "",
            fianza: clienteData.data.numero_fianza || "",
            relativo_a: clienteData.data.relativo_a || "",
            fecha: parseDateFromBackend(clienteData.data.fecha),
            fechaPago: parseDateFromBackend(clienteData.data.fecha_pago),
            fecha_termino: parseDateFromBackend(clienteData.data.fecha_termino),
            fecha_emision: parseDateFromBackend(clienteData.data.fecha_emision),
            tipo_fianza: clienteData.data.tipo_fianza_id || "",
            observaciones: clienteData.data.observaciones_pago || "",

            estatusSeleccionado: estatus
              ? estatus.find(
                (option) => option.value === clienteData?.data.estatus_info?.id
              ) || null
              : null,

            movimientoSeleccionado: movimientoEncontrado || null,
            estadoTramite: tipoProcesoSeleccionado || "",

            afianzadora: afianzadoras
              ? afianzadoras.find(
                (option) => option.value === clienteData.data.afianzadora_id
              ) || null
              : null,

            beneficiario: beneficiarios
              ? beneficiarios.find(
                (option) => option.label === clienteData.data.beneficiario_nombre
              ) || null
              : null,
          }));

          const estatusPagoPorDefecto = clienteData.data.estatus_pago;
          const estatusPagoValue =
            estatusPagoPorDefecto === "PAGADA"
              ? { value: "PAGADA", label: "PAGADA" }
              : estatus_pagos.find(
                (option) => option.value === estatusPagoPorDefecto
              ) || { value: "PENDIENTE", label: "PENDIENTE" };

          setEstatusPago(estatusPagoValue);
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [catalogos, catalogosLoading, id]);

  const handleChange = (field) => (selectedOption) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedOption,
    }));
  };

  const handleEstatusChange = handleChange("estatusSeleccionado");
  const handleMovimientoChange = handleChange("movimientoSeleccionado");
  const handleEstadoTramiteChange = handleChange("estadoTramite");
  const handleAfianzadora = handleChange("afianzadora");
  const handleBeneficiario = handleChange("beneficiario");

  const handleEstatusPagoChange = (selectedOption) => {
    setEstatusPago(selectedOption);
  };
  const handleTareas = (selectedOption) => {
    setEstadoTareas(selectedOption);
  };

  const clienteEncontrado = clientes;

  const handleSubmit = (e) => {
    e.preventDefault();
    const estatusPago =
      formData.fechaPago === null ? estatusPagoSeleccionado.value : "PAGADA";
    setFormData((prevState) => {
      const nuevaPrimaTotal =
        (Number(prevState.prima_inicial) || 0) +
        (Number(prevState.prima_futura) || 0);

      return {
        ...prevState,
        estatusPago: estatusPago || null,
        prima_total: nuevaPrimaTotal,
      };
    });
    console.log(formData)
    setShowDialog(true);
  };

  const movimientosOptions = movimientosTar.map((mov) => ({
    value: mov.nombre,
    label: mov.nombre,
  }));

  const movimientoEncontrado = movimientosTar.find(
    (option) =>
      option.nombre.toLowerCase().trim() ===
      clienteEncontrado?.movimiento_info?.nombre.toLowerCase().trim()
  );
  const idMovimientoSeleccionado = movimientoEncontrado
    ? movimientoEncontrado.id
    : null;

  useEffect(() => {
    const fetchData = async () => {
      const data = await obtenerTareas(idMovimientoSeleccionado);
      setTareas(data);
    };
    fetchData();
  }, [idMovimientoSeleccionado]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await obtenerTareasCompletas(id);
      setSeleccionadas(data);
    };
    fetchData();
  }, [id]);

  const [seleccionadas, setSeleccionadas] = useState([]);

  const toggleCheckbox = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Select styles matching the UI
  const selectTheme = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary: "#003f4f",
    },
  });

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: '#d1d5db',
      padding: '2px',
      borderRadius: '0.375rem',
    })
  };

  if (!id) return <div>Error: No se encontró el ID del cliente.</div>;

  if (!clienteEncontrado || clienteEncontrado.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-[#003f4f]">
                Folio {clienteEncontrado.folio}
              </h1>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {clienteEncontrado?.estatus_info?.nombre}
              </span>
            </div>
            <div className="flex gap-4 md:gap-8 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#003f4f]">Inicio:</span>
                <DatePicker
                  selected={formData.fecha}
                  onChange={(date) => {
                    if (date) {
                      setFormData((prevState) => ({
                        ...prevState,
                        fecha: date,
                      }));
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="bg-transparent focus:outline-none w-24 cursor-pointer"
                />
              </div>
              {clienteEncontrado.fecha_termino && (
                <p>
                  <span className="font-bold text-[#003f4f]">Término:</span>{" "}
                  {format(parseISO(clienteEncontrado.fecha_termino), "dd/MM/yyyy")}
                </p>
              )}
              <p>
                <span className="font-bold text-[#003f4f]">Fianza:</span>{" "}
                {clienteEncontrado.numero_fianza}
              </p>
            </div>
          </div>
          <button className="text-red-500 hover:text-red-700 transition-colors p-2">
            <Trash2 size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Información General */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#003f4f]"></div>
                <div className="flex items-center gap-2 mb-6 text-[#003f4f]">
                  <Info size={20} />
                  <h2 className="text-lg font-bold">Información General</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fiado</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium h-[42px] flex items-center">
                      {clienteEncontrado.cliente_nombre}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {clienteEncontrado.movimiento === "SEGURO RC" ? "Aseguradora" : "Afianzadora"}
                    </label>
                    <Select
                      options={catalogos.afianzadoras}
                      value={formData.afianzadora}
                      onChange={handleAfianzadora}
                      placeholder="Seleccionar..."
                      styles={selectStyles}
                      theme={selectTheme}
                    />
                  </div>

                  <div className="md:col-span-2 border-t border-gray-100 pt-4"></div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Beneficiario</label>
                    <Select
                      options={catalogos.beneficiarios}
                      value={formData.beneficiario}
                      onChange={handleBeneficiario}
                      placeholder="Seleccionar..."
                      styles={selectStyles}
                      theme={selectTheme}
                    />
                  </div>

                  <div className="md:col-span-2 border-t border-gray-100 pt-4"></div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Agente</label>
                    <div className="p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium h-[42px] flex items-center">
                      {clienteEncontrado.agente_nombre}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Movimiento</label>
                    <Select
                      options={catalogos.movimientos}
                      value={formData.movimientoSeleccionado}
                      onChange={handleMovimientoChange}
                      placeholder="Seleccionar..."
                      styles={selectStyles}
                      theme={selectTheme}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estatus</label>
                    <Select
                      options={catalogos.estatus}
                      value={formData.estatusSeleccionado}
                      onChange={handleEstatusChange}
                      placeholder="Seleccionar..."
                      styles={selectStyles}
                      theme={selectTheme}
                    />
                  </div>
                  {formData.estatusSeleccionado?.value !== 18 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estatus Trámite</label>
                      <Select
                        options={clienteEncontrado.movimiento === "SEGURO RC" ? estadoTramiteAseguradora : estadoTramite}
                        value={formData.estadoTramite}
                        onChange={handleEstadoTramiteChange}
                        placeholder="Seleccionar..."
                        styles={selectStyles}
                        theme={selectTheme}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas e Importes */}
              {estatusTerminados.includes(formData.estatusSeleccionado?.value) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                  <div className="flex items-center gap-2 mb-6 text-[#003f4f]">
                    <Calendar size={20} />
                    <h2 className="text-lg font-bold">Fechas e Importes</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fecha de Termino</label>
                      <DatePicker
                        showIcon
                        toggleCalendarOnIconClick
                        selected={formData.fecha_termino}
                        onChange={(date) => setFormData((prev) => ({ ...prev, fecha_termino: date }))}
                        dateFormat="dd/MM/yyyy"
                        className="w-full border border-gray-300 rounded-md p-2 focus:border-[#003f4f] focus:ring-1 focus:ring-[#003f4f] outline-none"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                  
                  {movimientosPermitidos.includes(formData.movimientoSeleccionado?.value) && (
                    <div className="border-t border-gray-100 pt-6">
                      <FormPrimas formData={formData} setFormData={setFormData} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA */}
            <div className="space-y-6">
              
              {/* Estado de Pago */}
              {estatusTerminados.includes(formData.estatusSeleccionado?.value) && movimientosPermitidos.includes(formData.movimientoSeleccionado?.value) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                  <div className="flex items-center gap-2 mb-6 text-[#003f4f]">
                    <CheckCircle size={20} />
                    <h2 className="text-lg font-bold">Estado de Pago</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</label>
                      {formData.fechaPago !== null ? (
                        <div className="flex items-center gap-3">
                          <span className="bg-[#107c41] text-white px-3 py-1 rounded text-xs font-bold">PAGADA</span>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, fechaPago: null }));
                              setEstatusPago(estatus_pagos[2]);
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-40">
                          <Select
                            options={estatus_pagos}
                            value={estatusPagoSeleccionado}
                            onChange={handleEstatusPagoChange}
                            placeholder="Estado..."
                            styles={selectStyles}
                            theme={selectTheme}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha de Pago</label>
                      <div className="w-40">
                        <DatePicker
                          selected={formData.fechaPago}
                          onChange={(date) => setFormData((prev) => ({ ...prev, fechaPago: date }))}
                          dateFormat="dd/MM/yyyy"
                          className="w-full border border-gray-300 rounded-md p-1.5 text-sm text-right focus:border-[#003f4f] outline-none"
                          placeholderText="Seleccionar..."
                        />
                      </div>
                    </div>

                    {estatusPagoSeleccionado?.label === "NO PAGADA" && (
                      <div className="pt-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Observaciones de pago</label>
                        <textarea
                          value={formData.observaciones}
                          onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:border-[#003f4f] focus:ring-1 focus:ring-[#003f4f] outline-none resize-none"
                          rows="3"
                          placeholder="Escriba aquí sus observaciones..."
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Datos de Fianza / InfoTramite */}
              <div className="bg-white rounded-xl shadow-sm text-white p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={20} className="text-primary" />
                  <h2 className="text-lg font-bold text-primary">Datos de Fianza</h2>
                </div>
                <div className="text-gray-800">
                   <InfoTramite formData={formData} setFormData={setFormData} />
                </div>
              </div>
              
            </div>
          </div>

          {/* ACCIONES (BOTONES) */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 bg-[#f4f6f8]">
            <button
              type="button"
              onClick={() => navigate("/tramites")}
              className="px-6 py-2.5 border border-gray-300 bg-white rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#003f4f] hover:bg-[#002b36] text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Guardar cambios
            </button>
          </div>
        </form>

        {/* OBSERVACIONES GENERALES */}
        <div className="mt-8">
           <GestionObservaciones tramiteId={id} usuario={usuario} />
        </div>
      </div>

      {showDialog && (
        <PendientesBC
          onClose={() => setShowDialog(false)}
          id={id}
          compromiso={clientes.compromisos_detalle?.length > 0 ? clientes.compromisos_detalle[0] : null}
          datosCliente={formData}
          tareas={seleccionadas.length > 0 ? seleccionadas : ""}
          idMovimiento={tareas.map((t) => t.id)}
        />
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default TramiteCliente;