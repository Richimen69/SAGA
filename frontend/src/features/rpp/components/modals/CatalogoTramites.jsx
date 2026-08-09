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
import { catalagosID } from "@/features/rpp/services/rpp";
import { updateCatalago } from "@/features/rpp/services/rpp";
export default function CatalogoTramites({ onClose, id }) {
  const [normal, setNormal] = useState("");
  const [express, setExpress] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        const response = await catalagosID(id);
        setNormal(response.costo_normal);
        setExpress(response.tramite_express);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };
    fetchCatalogo();
  }, []);

  const actualizarCatalago = async () => {
    const data = {
      id: id,
      costo_normal: normal,
      tramite_express: express,
    };
    try {
      const result = await updateCatalago(data);
      console.log(result)
      if (result.success) {
        toast.success("Guardado exitosamente.");
      } else {
        toast.error("Error al guardar.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Hubo un problema al guardar el trámite.");
    }
    navigate(0);
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tramite</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right col-span-2">
              Costo Normal
            </Label>
            <Input
              id="name"
              value={normal}
              onChange={(e) => setNormal(e.target.value)}
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right col-span-2">
              Costo Express
            </Label>
            <Input
              id="name"
              value={express}
              onChange={(e) => setExpress(e.target.value)}
              className="col-span-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
                actualizarCatalago();
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
