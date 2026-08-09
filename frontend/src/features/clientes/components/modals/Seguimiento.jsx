import { useState, useEffect, useCallback } from "react";
import React from "react";
import { addSeguimiento, obetenerSeguimientos } from "../../services/clientes";
import { X, MessageCirclePlus, Check, Plus } from "lucide-react";
import { SeguimientoList } from "../SeguimientoList";
import { FormSeguimiento } from "../forms/FormSeguimiento";
import { Btn } from "../ui/Btn";
import { ConfirmationModal } from "./ConfirmationModal";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";
import { activarCliente } from "../../services/clientes";

export const Seguimiento = ({
  isOpen,
  onClose,
  cliente,
  id_cli,
  onSuccess,
  onActivate,
}) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [totalSeguimientos, setTotalSeguimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para la carga inicial
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const handleActivateClick = () => {
    setIsConfirmOpen(true);
  };
  const handleConfirmClose = () => {
    setIsConfirmOpen(false);
  };
  const handleActivate = async () => {
    try {
      // 1. Llamada a la API
      await activarCliente({ id_cli: id_cli, tipo_cliente: "CA" });

      // 2. Ejecutar la función que refresca la lista (si existe)
      if (onActivate) {
        onActivate();
      }

      // 3. Cerrar los modales
      setIsConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error("Error al activar cliente:", error);
    }
  };

  const handleConfirmAccept = () => {
    handleActivate();
  };

  const fetchSeguimientos = useCallback(async () => {
    if (!id_cli) return;
    setIsLoading(true);
    try {
      const response = await obetenerSeguimientos(id_cli);
      setTotalSeguimientos(response);
    } catch (error) {
      console.error("Error al obtener seguimientos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id_cli]);

  useEffect(() => {
    if (!isOpen) {
      setIsFormVisible(false); // Resetea el estado al cerrar
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isFormVisible) {
      fetchSeguimientos();
    }
  }, [isOpen, isFormVisible, fetchSeguimientos]);

  const handleSubmit = useCallback(
    async (formData) => {
      try {
        await addSeguimiento(formData);
        setIsFormVisible(false);
        if (onSuccess) onSuccess();
        await fetchSeguimientos();
      } catch (error) {
        console.error("Error al agregar seguimiento:", error);
      }
    },
    [onSuccess, fetchSeguimientos]
  );
  const handleShowForm = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  const handleHideForm = useCallback(() => {
    setIsFormVisible(false);
  }, []);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <AnimatedWrapper isVisible={isOpen} variant="scaleUp">
        <div className="relative bg-white rounded-2xl shadow-2xl mx-4 transform transition-all w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                <MessageCirclePlus className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Seguimiento de Cliente
                </h3>
                <h1>{cliente}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Btn onClick={handleActivateClick} color="green" icon={<Check />}>
                Activar Cliente
              </Btn>
              <Btn onClick={handleShowForm} color="secondary" icon={<Plus />}>
                Agregar Seguimiento
              </Btn>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          {isLoading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : isFormVisible ? (
            <FormSeguimiento
              id_cli={id_cli}
              onCancel={handleHideForm}
              onSubmit={handleSubmit}
            />
          ) : (
            <SeguimientoList seguimientos={totalSeguimientos} />
          )}
        </div>
      </AnimatedWrapper>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleConfirmClose}
        onConfirm={handleActivate}
        title="Activar Cliente"
        message={`¿Estás seguro de que quieres activar a ${cliente}?`}
      />
    </div>
  );
};
