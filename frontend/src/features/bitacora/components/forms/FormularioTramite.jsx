import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Toaster, toast } from "sonner";
import { agente } from "@/shared/utils/Constans";
import { X } from "lucide-react";
import { useUsuario, useCatalogos } from "../../hooks";
import { crearTramite } from "../../services/tramites.service";
import {
  fetchClientes,
} from "../../services/datosTramites";
import { useNavigate } from "react-router-dom";
const FormularioTramite = ({ isVisible, onClose, onSuccess }) => {
  const usuario = useUsuario();
  const { catalogos, loading: catalogosLoading } = useCatalogos();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [btnSave, setBtnSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    movimiento: null,
    agente: null,
    fecha: "",
    cliente: null,
    afianzadora: null,
    beneficiario: null,
  });
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  useEffect(() => {
    if (catalogosLoading || !usuario) return;
  
    const { movimientos, afianzadoras, beneficiarios } = catalogos;
  
    setMovimientos(movimientos);
    setAfianzadoras(afianzadoras);
    setBeneficiarios(beneficiarios);
  
    const fetchData = async () => {
      try {
        const clientesData = await fetchClientes();
        setClientes(
          clientesData.map((cliente) => ({
            value: cliente.id_cli,
            label: cliente.nombre_cli,
          }))
        );
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
  
    fetchData();
  }, [catalogos, catalogosLoading, usuario]);
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnSave(true);
    setLoading(true);

    // Verifica campos requeridos
    if (
      !formData.cliente ||
      !formData.afianzadora ||
      !formData.beneficiario ||
      !formData.agente ||
      !formData.movimiento
    ) {
      toast.error("Rellene los campos");
      setBtnSave(false);
      setLoading(false);
      return;
    }
    let pago = "PENDIENTE";
    const movimientosEspeciales = [1,2,4,6,8,9,11,14,16,17];

    if (movimientosEspeciales.includes(formData.movimiento.value)) {
      pago = "NO APLICA";
    }

    const data = {
      creado_por: usuario.usuario_usu,
      fecha: formData.fecha,
      cliente_id: formData.cliente.value,
      cliente_nombre: formData.cliente.label,
      agente_id: 1,
      agente_nombre: formData.agente.label,
      beneficiario_id: formData.beneficiario.value,
      beneficiario_nombre: formData.beneficiario.label,
      afianzadora_id: formData.afianzadora.value,
      afianzadora_nombre: formData.afianzadora.label,
      movimiento: formData.movimiento.value,
      estatus: 1,
      tipo_proceso: "BC",
      programa_proveedores: false,
      estatus_pago: pago,
    };
    try {
      const result = await crearTramite(data);
      if (result.success) {
        toast.success(result.message || "Trámite guardado exitosamente.");
        setFormData({
          movimiento: null,
          agente: null,
          fecha: "",
          cliente: null,
          afianzadora: null,
          beneficiario: null,
        });
      } else {
        // Mostrar el mensaje principal del error
        toast.error(result.message || "Error al guardar el trámite.");

        // Mostrar cada error específico de cada campo
        if (result.errors && Object.keys(result.errors).length > 0) {
          Object.entries(result.errors).forEach(([campo, mensajes]) => {
            // mensajes puede ser un array o un string
            const textoError = Array.isArray(mensajes)
              ? mensajes.join(", ")
              : mensajes;

            toast.error(`${campo}: ${textoError}`);
          });
        }
      }
    } catch (error) {
      toast.error("Hubo un problema inesperado al guardar el trámite.");
    } finally {
      setLoading(false);
      setBtnSave(false);
      onClose();
      onSuccess();
    }
  };

  if (!isVisible) return null;

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
    <div
      className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg md:w-2/6 w-3/4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex bg-primary p-7 rounded-t-2xl justify-between items-center">
          <h2 className="text-lg font-bold text-white">Nuevo Trámite</h2>
          <button
            className="hover:bg-white/20 p-2 rounded-xl flex justify-center items-center"
            onClick={onClose}
          >
            <X color="#ffff" size={30} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex  flex-col gap-2 ">
            <p className="block text-gray-700">Fecha</p>
            <input
              type="date"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              value={formData.fecha}
              onChange={(e) => handleChange("fecha", e.target.value)}
            />
          </div>
          {/* Selector de Cliente */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Cliente:</label>
            <Select
              options={clientes}
              value={formData.cliente}
              onChange={(value) => handleChange("cliente", value)}
              placeholder="Seleccionar cliente..."
              isClearable
            />
          </div>

          {/* Selector de Afianzadora */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Afianzadora:</label>
            <Select
              options={afianzadoras}
              value={formData.afianzadora}
              onChange={(value) => handleChange("afianzadora", value)}
              placeholder="Seleccionar afianzadora..."
              isClearable
            />
          </div>

          {/* Selector de Beneficiario */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Beneficiario:</label>
            <Select
              options={beneficiarios}
              value={formData.beneficiario}
              onChange={(value) => handleChange("beneficiario", value)}
              placeholder="Seleccionar beneficiario..."
              isClearable
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Selecciona un agente:
            </label>
            <Select
              options={agente}
              value={formData.agente}
              onChange={(value) => handleChange("agente", value)}
              placeholder="Buscar agente..."
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Selecciona un movimiento:
            </label>
            <Select
              options={movimientos}
              value={formData.movimiento}
              onChange={(value) => handleChange("movimiento", value)}
              placeholder="Buscar movimiento..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-300 px-4 py-2 rounded mr-2"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={btnSave}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default FormularioTramite;
