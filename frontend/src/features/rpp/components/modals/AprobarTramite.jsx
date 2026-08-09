import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { uploadArchivo } from "@/features/rpp/services/rpp";
import { updateTramites } from "@/features/rpp/services/rpp";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
export default function AprobarTramite({ onClose, id_tramite }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const aprobar = async () => {
    try {
      if (!Array.isArray(id_tramite) || id_tramite.length === 0) {
        console.error("Error: id_tramite no es un array válido o está vacío");
        return;
      }
      handleUpload();
      for (let i = 0; i < id_tramite.length; i++) {
        const data = {
          id: id_tramite[i],
          estatus: "EN ESPERA DE APROBACION",
          url_cert_revisado: file.name,
        };
        const response = await updateTramites(data);
        if (response.success) {
          toast.success("Guardado exitosamente.");
        } else {
          toast.error("Error");
        }
      }
    } catch (error) {
      console.error("Error", error);
    }
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    //console.log("Archivo seleccionado:", selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Selecciona un archivo");
      return null;
    }

    try {
      const response = await uploadArchivo(file);

      //console.log("Respuesta del backend:", response);
      
      if (response?.message) {
        toast.success("Archivo subido correctamente");
        navigate(0);
        return response;
      } else {
        toast.error("Error en la respuesta del backend");
        return null;
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      toast.error("Hubo un problema al subir el archivo.");
      return null;
    }
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar certificado</DialogTitle>
          <DialogDescription>¿Desea guardar cambios?</DialogDescription>
          <div className="grid items-center gap-1.5">
            <Label htmlFor="picture">Certificado</Label>
            <Input id="picture" type="file" onChange={handleFileChange} />
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              aprobar();
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
