import React from "react";
import { Btn as ActionButton } from "../ui/Btn";
import { AlertTriangle, Check, X } from "lucide-react";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Acción",
  message = "¿Estás seguro de que quieres continuar?",
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Contenedor principal del modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <AnimatedWrapper isVisible={isOpen} variant="scaleUp">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end gap-3">
            <ActionButton onClick={onClose} color="secondary" icon={<X />}>
              Cancelar
            </ActionButton>
            <ActionButton onClick={onConfirm} color="green" icon={<Check />}>
              Aceptar
            </ActionButton>
          </div>
        </div>
      </AnimatedWrapper>
    </div>
  );
};
