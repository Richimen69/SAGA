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
import { obtenerTramitesId } from "@/features/rpp/services/rpp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditarTramite({ onClose, id_tramite }) {
  const navigate = useNavigate();
  const [observacion, setObservacion] = useState("");
  const [folio, setFolio] = useState("");
  const [propietario, setPropietario] = useState("");
  const [direccion, setDireccion] = useState("");
  const [distrito, setDistrito] = useState("");
  const [costo, setCosto] = useState("");
  const [estatus, setEstatus] = useState("");
  useEffect(() => {
    const fetchTramites = async () => {
      try {
        const response = await obtenerTramitesId(id_tramite);
        setObservacion(response?.observaciones || "");
        setFolio(response?.folio_re || "");
        setPropietario(response?.nombre_propietario_empresa || "");
        setDireccion(response?.direccion_bi || "");
        setDistrito(response?.distrito_ciudad || "");
        setCosto(response?.pagado_a_gestor_rpp || "");
        setEstatus(response?.estatus || "");
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };
    fetchTramites();
  }, [id_tramite]);
  const editar = async () => {
    const data = {
      id: id_tramite,
      nombre_propietario_empresa: propietario,
      direccion_bi: direccion,
      folio_re: folio,
      distrito_ciudad: distrito,
      estatus: estatus,
      pagado_a_gestor_rpp: costo,
      observaciones: observacion,
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
    navigate(0);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tramite</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="name" className="">
              Estatus:
            </Label>
            <Select value={estatus} onValueChange={setEstatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Estatus..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN PROCESO">EN PROCESO</SelectItem>
                <SelectItem value="EN ESPERA DE APROBACION">
                  EN ESPERA DE APROBACION
                </SelectItem>
                <SelectItem value="EN REVISION">EN REVISION</SelectItem>
                <SelectItem value="ESPERANDO PAGO">ESPERANDO PAGO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="name" className="">
              Folio:
            </Label>
            <Input
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="name" className="">
              Propietario:
            </Label>
            <Input
              value={propietario}
              onChange={(e) => setPropietario(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="name" className="">
              Dirección:
            </Label>
            <Input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="name" className="">
              Distrito:
            </Label>
            <Input
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 gap-4 items-center">
            <Label htmlFor="name" className="">
              Pago a Gestor:
            </Label>
            <Input
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="name" className="">
              Observaciones:
            </Label>
            <Textarea
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
              editar();
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
