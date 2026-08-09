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

export default function AjustarPrecio({ onClose, id_tramite }) {
  const [totalChange, setTotal] = useState("");
  const navigate = useNavigate();
  const ajustar = async () => {
    const comisiones = Number(totalChange);
    const iva = comisiones * 0.16;
    const subtotal = iva + comisiones;
    const ivaRet = (iva / 3) * 2;
    const isrRet = comisiones * 0.1;
    const total = subtotal - ivaRet - isrRet;
    for (let i = 0; i < id_tramite.length; i++) {
      const data = {
        id: id_tramite[i],
        costo_tramite: totalChange,
        costo_final: total
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
          <DialogTitle>Ajustar precio de tramite</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Comisiones
            </Label>
            <Input
              id="name"
              value={totalChange}
              onChange={(e) => setTotal(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              ajustar();
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
