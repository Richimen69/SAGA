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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTramites } from "@/features/rpp/services/rpp";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
export default function CancelarTramite({ onClose, id_tramite }) {
  const navigate = useNavigate();
  const [observacion, setObservacion] = useState("");
  const cancelar = async () => {
    for (let i = 0; i < id_tramite.length; i++) {
      const data = {
        id: id_tramite[i],
        estatus: "CANCELADO",
        observaciones: observacion
      };
      try {
        const result = await updateTramites(data);
        console.log(result);
        if (result.success) {
          toast.success("Guardado exitosamente.");
        } else {
          toast.error("Error al guardar.");
        }
      } catch (error) {
        console.error("Error al enviar la solicitud:", error);
        toast.error("Hubo un problema al guardar el trámite.");
      }
    }
    navigate(0);
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancelar Tramite</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="name" className="">
              Observaciones:
            </Label>
            <Textarea
              id="name"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              cancelar();
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
