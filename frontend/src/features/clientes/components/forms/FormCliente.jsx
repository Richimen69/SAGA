import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
export default function FormCliente({ onClose }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    empresa: "",
    nombreContacto: "",
    puesto: "",
    correo: "",
    telefono: "",
    celular: "",
    tipo: "",
    tipoPersona: "",
    rfc: "",
    observaciones: "",
  });
  const [cliente, setCliente] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setCliente(value !== "PROS");
  };

  const handleSubmit = async () => {
    // Verificar si los campos requeridos están completos
    if (!formData.nombreContacto || !formData.telefono) {
      toast.error("Rellene los campos");
      return;
    }
    const data = {
      nombre_cli: formData.empresa,
      telefono_cli: formData.telefono,
      correo_cli: formData.correo,
      tipo_persona_cli: formData.tipoPersona,
      rfc_cli: formData.rfc,
      contacto_cli: formData.nombreContacto,
      telefono_c_cli: formData.celular,
      tipo_cliente: formData.tipo,
      observaciones: formData.observaciones,
      puesto_c: formData.puesto,
    };

    try {
      const result = await addCliente(data);
      console.log(data);
      if (result.success) {
        toast.success("Guardado exitosamente.");
      } else {
        toast.error("Error al guardar");
      }
      console.log(result);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Hubo un problema al guardar: Informar a IT");
    }
    navigate(0)
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar registro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombreContacto">Nombre Contacto</Label>
              <Input
                id="nombreContacto"
                name="nombreContacto"
                value={formData.nombreContacto}
                onChange={handleChange}
                placeholder="Nombre completo del contacto"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="puesto">Puesto</Label>
              <Input
                id="puesto"
                name="puesto"
                value={formData.puesto}
                onChange={handleChange}
                placeholder="Puesto del contacto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                name="celular"
                type="tel"
                value={formData.celular}
                onChange={handleChange}
                placeholder="1234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono oficina</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="1234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                type="text"
                value={formData.observaciones}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <RadioGroup
                defaultValue="PROS"
                value={formData.tipo}
                onValueChange={(value) => handleRadioChange("tipo", value)}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CA" id="CA" />
                  <Label htmlFor="CA">Cliente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PROS" id="PROS" />
                  <Label htmlFor="PROS">Prospecto</Label>
                </div>
              </RadioGroup>
            </div>
            {cliente ? (
              <div>
                <div className="space-y-2">
                  <Label>Tipo de persona</Label>
                  <RadioGroup
                    defaultValue="1"
                    value={formData.tipoPersona}
                    onValueChange={(value) =>
                      handleRadioChange("tipoPersona", value)
                    }
                    className="flex flex-row space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="fisica" />
                      <Label htmlFor="fisica">Física</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="moral" />
                      <Label htmlFor="moral">Moral</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC</Label>
                  <Input
                    id="rfc"
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleChange}
                    placeholder="Registro Federal de Contribuyentes"
                  />
                </div>
              </div>
            ) : null}
          </CardContent>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              handleSubmit();
            }}
          >
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
