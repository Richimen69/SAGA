import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { agente } from "@/shared/utils/Constans";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUsuario, useCatalogos } from "../../hooks";
import { crearTramite } from "../../services/tramites.service";
import { fetchClientes } from "../../services/datosTramites";

// Movimientos cuyo pago es "NO APLICA" (ids del catálogo)
const MOVIMIENTOS_SIN_PAGO = [1, 2, 4, 6, 8, 9, 11, 14, 16, 17];

// Fecha de hoy en formato yyyy-mm-dd usando la hora local (no UTC)
const hoy = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const initialForm = () => ({
  movimiento: null,
  agente: null,
  fecha: hoy(),
  cliente: null,
  afianzadora: null,
  beneficiario: null,
});

// Estilos de react-select alineados con el resto de campos (44px, borde 10px, foco verde azulado)
const selectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 10,
    borderColor: hasError ? "#b91c1c" : state.isFocused ? "#003f4f" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(0,63,79,0.35)" : "none",
    "&:hover": { borderColor: hasError ? "#b91c1c" : "#003f4f" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#003f4f"
      : state.isFocused
        ? "#e6f0f2"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#14323b",
  }),
  placeholder: (base) => ({ ...base, color: "#6b7280" }),
});

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const FormularioTramite = ({ isVisible, onClose, onSuccess }) => {
  const usuario = useUsuario();
  const { catalogos, loading: catalogosLoading } = useCatalogos();
  const [clientes, setClientes] = useState([]);
  const [afianzadoras, setAfianzadoras] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Al corregir un campo, se quita su error
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Formulario limpio cada vez que se abre
  useEffect(() => {
    if (isVisible) {
      setFormData(initialForm());
      setErrors({});
      setLoading(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (catalogosLoading || !usuario) return;

    const { movimientos, afianzadoras, beneficiarios } = catalogos || {};
    setMovimientos(movimientos || []);
    setAfianzadoras(afianzadoras || []);
    setBeneficiarios(beneficiarios || []);

    const fetchData = async () => {
      try {
        const clientesData = await fetchClientes();
        setClientes(
          clientesData.map((cliente) => ({
            value: cliente.id_cli,
            label: cliente.nombre_cli,
          })),
        );
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };

    fetchData();
  }, [catalogos, catalogosLoading, usuario]);

  const validate = () => {
    const e = {};
    if (!formData.fecha) e.fecha = "Selecciona la fecha.";
    if (!formData.movimiento) e.movimiento = "Selecciona un movimiento.";
    if (!formData.cliente) e.cliente = "Selecciona un cliente.";
    if (!formData.beneficiario) e.beneficiario = "Selecciona un beneficiario.";
    if (!formData.afianzadora) e.afianzadora = "Selecciona una afianzadora.";
    if (!formData.agente) e.agente = "Selecciona un agente.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);

    const pago = MOVIMIENTOS_SIN_PAGO.includes(formData.movimiento.value)
      ? "NO APLICA"
      : "PENDIENTE";

    const data = {
      creado_por: usuario.username,
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
        onClose();
        onSuccess();
      } else {
        // El modal se queda abierto para que no se pierdan los datos capturados
        toast.error(result.message || "Error al guardar el trámite.");
        if (result.errors && Object.keys(result.errors).length > 0) {
          Object.entries(result.errors).forEach(([campo, mensajes]) => {
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
    }
  };

  return (
    <Dialog
      open={isVisible}
      onOpenChange={(open) => {
        if (!open && !loading) onClose();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="w-full max-w-xl gap-0 overflow-visible p-0"
      >
        <div className="rounded-t-lg border-b border-gray-200 px-6 py-5">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Nuevo trámite
          </DialogTitle>
          <p className="mt-1 text-sm text-gray-600">
            Todos los campos son obligatorios.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id="tramite-fecha" label="Fecha" error={errors.fecha}>
              <input
                id="tramite-fecha"
                type="date"
                value={formData.fecha}
                disabled={loading}
                aria-invalid={!!errors.fecha}
                onChange={(e) => handleChange("fecha", e.target.value)}
                className={`h-11 w-full rounded-[10px] border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003f4f] disabled:bg-gray-100 ${
                  errors.fecha ? "border-red-700" : "border-gray-300"
                }`}
              />
            </Field>

            <Field
              id="tramite-movimiento"
              label="Movimiento"
              error={errors.movimiento}
            >
              <Select
                inputId="tramite-movimiento"
                options={movimientos}
                value={formData.movimiento}
                onChange={(value) => handleChange("movimiento", value)}
                placeholder="Buscar movimiento..."
                noOptionsMessage={() => "Sin resultados"}
                isDisabled={loading}
                aria-invalid={!!errors.movimiento}
                styles={selectStyles(!!errors.movimiento)}
              />
            </Field>
          </div>

          <Field id="tramite-cliente" label="Cliente / Fiado" error={errors.cliente}>
            <Select
              inputId="tramite-cliente"
              options={clientes}
              value={formData.cliente}
              onChange={(value) => handleChange("cliente", value)}
              placeholder="Seleccionar cliente..."
              noOptionsMessage={() => "Sin resultados"}
              isClearable
              isDisabled={loading}
              aria-invalid={!!errors.cliente}
              styles={selectStyles(!!errors.cliente)}
            />
          </Field>

          <Field
            id="tramite-beneficiario"
            label="Beneficiario"
            error={errors.beneficiario}
          >
            <Select
              inputId="tramite-beneficiario"
              options={beneficiarios}
              value={formData.beneficiario}
              onChange={(value) => handleChange("beneficiario", value)}
              placeholder="Seleccionar beneficiario..."
              noOptionsMessage={() => "Sin resultados"}
              isClearable
              isDisabled={loading}
              aria-invalid={!!errors.beneficiario}
              styles={selectStyles(!!errors.beneficiario)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              id="tramite-afianzadora"
              label="Afianzadora"
              error={errors.afianzadora}
            >
              <Select
                inputId="tramite-afianzadora"
                options={afianzadoras}
                value={formData.afianzadora}
                onChange={(value) => handleChange("afianzadora", value)}
                placeholder="Seleccionar afianzadora..."
                noOptionsMessage={() => "Sin resultados"}
                isClearable
                isDisabled={loading}
                aria-invalid={!!errors.afianzadora}
                styles={selectStyles(!!errors.afianzadora)}
              />
            </Field>

            <Field id="tramite-agente" label="Agente" error={errors.agente}>
              <Select
                inputId="tramite-agente"
                options={agente}
                value={formData.agente}
                onChange={(value) => handleChange("agente", value)}
                placeholder="Buscar agente..."
                noOptionsMessage={() => "Sin resultados"}
                isDisabled={loading}
                aria-invalid={!!errors.agente}
                styles={selectStyles(!!errors.agente)}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-[10px] border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#003f4f] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-[10px] bg-[#003f4f] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#002b36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003f4f] disabled:opacity-70"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormularioTramite;