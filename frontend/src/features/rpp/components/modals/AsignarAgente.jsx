import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdOutlineWifiProtectedSetup } from "react-icons/md";
import { IconContext } from "react-icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { obtenerAgentes, updateTramites } from "@/features/rpp/services/rpp";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
export function AsignarAgente({ onClose, id_tramite }) {
  const navigate = useNavigate();
  const [agentes, setAgentes] = useState([]);
  const [agenteSeleccionado, setAgenteSeleccionado] = useState("");
  const [costo, setCosto] = useState("");

  useEffect(() => {
    const fetchAgentes = async () => {
      try {
        const response = await obtenerAgentes();
        setAgentes(response);
        console.log(response);
      } catch (error) {
        console.error("Error al obtener las opciones:", error);
      }
    };
    fetchAgentes();
  }, []);
  const asignarAgente = async () => {
    try {
      if (!Array.isArray(id_tramite) || id_tramite.length === 0) {
        console.error("Error: id_tramite no es un array válido o está vacío");
        return;
      }

      for (let i = 0; i < id_tramite.length; i++) {
        const data = {
          id: id_tramite[i],
          estatus: "EN PROCESO",
          pagado_a_gestor_rpp: costo,
          agente: agenteSeleccionado,
        };
        const response = await updateTramites(data);
        if (response.success) {
          toast.success("Agente asignado exitosamente.");
          setTimeout(() => {
            navigate(0);
          }, 1500);
        } else {
          toast.error("Error en la asignacion.");
        }
      }
    } catch (error) {
      console.error("Error en asignarAgente:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar tramites</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="costo" className="text-right">
              Costo
            </Label>
            <Input
              id="costo"
              placeholder="$500.00"
              className="col-span-3"
              onChange={(e) => setCosto(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rol" className="text-right">
              Agente
            </Label>
            <Select onValueChange={setAgenteSeleccionado}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona el agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Array.isArray(agentes) &&
                    agentes.map((agente) => (
                      <SelectItem key={agente.id} value={agente.nombre_usuario}>
                        {agente.nombre_usuario}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              asignarAgente();
            }}
          >
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
