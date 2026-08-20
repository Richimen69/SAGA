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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsuario } from "../../hooks";
import { useNavigate } from "react-router-dom";
import { completarCompromiso } from "@/features/bitacora/services/tramites.service";
import { updateTramite } from "@/features/bitacora/services/tramites.service";
export default function CancelarComp({ onClose, compromiso, tramite }) {
  const [date, setDate] = React.useState(null);
  const [user, setUser] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const usuario = useUsuario();
  const navigate = useNavigate();
  const terminarCompromiso = async () => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    const fechaFormateada = `${year}-${month}-${day}`;
    const data = {
      completado_por: user,
      fecha_completado: fechaFormateada,
    };
    const tramiteData = {
      estatus: 18,
      fecha: tramite.fecha,
      creado_por: usuario.usuario_usu,
    };
    try {
      const result = await completarCompromiso(data, compromiso);
      const tramiteResult = await updateTramite(tramiteData, tramite.id);
      console.log(tramiteResult);
      console.log(result);

      if (tramiteResult) {
        toast.success("Compromiso guardado exitosamente.");
        onClose();
        navigate(0);
      } else {
        toast.error("Error al guardar el Compromiso.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Hubo un problema al guardar el trámite.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Terminar Compromiso</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              onChange={(e) => setUser(e.target.value)}
              placeholder="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid w-full gap-1.5 relative">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Fecha
              </Label>

              <div className="col-span-3">
                <DatePicker
                  selected={fecha}
                  onChange={(date) => {
                    if (date) {
                      setFecha(date);
                    }
                  }}
                  dateFormat="dd/MM/yyyy"
                  className="bg-transparent focus:outline-none w-24 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              terminarCompromiso();
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
