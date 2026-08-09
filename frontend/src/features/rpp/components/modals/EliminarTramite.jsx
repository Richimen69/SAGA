import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { borrarTramite } from "@/features/rpp/services/rpp";
import { useNavigate } from "react-router-dom";
export default function EliminarTramite({ onClose, id_tramite }) {
  const navigate = useNavigate();
  const handleContinue = async () => {
    try {
      for (let i = 0; i < id_tramite.length; i++) {
        const response = await borrarTramite(id_tramite[i]);
        console.log(response)
        if (response.success) {
          toast.success("Borrado exitosamente.");
        } else {
          toast.error("Error");
        }
      }
      navigate(0)
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Hubo un problema al borra el trámite.");
    }
  };
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desea borrar los tramites?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede revertir
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue}>
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
