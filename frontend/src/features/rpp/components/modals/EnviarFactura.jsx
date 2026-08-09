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
import DatePicker from "react-datepicker";
import { toast } from "sonner";
import { uploadArchivo } from "@/features/rpp/services/rpp";
import { useNavigate } from "react-router-dom";
import { updateTramites } from "@/features/rpp/services/rpp";
import { format, parse } from "date-fns";

export default function EnviarFactura({ onClose, id_tramite, costo }) {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [calculos, setCalculos] = useState(null);
  const [file, setFile] = useState(null);
  const [fileXML, setFileXML] = useState(null);
  const [fecha, setFecha] = useState(null);

  useEffect(() => {
    let sum = 0;
    for (let i = 0; i < costo.length; i++) {
      sum += parseFloat(costo[i]) || 0;
    }
    setTotal(sum);
    const comisiones = Number(sum);
    const iva = comisiones * 0.16;
    const subtotal = iva + comisiones;
    const ivaRet = (iva / 3) * 2;
    const isrRet = comisiones * 0.1;
    const totalH = subtotal - ivaRet - isrRet;
    setCalculos({
      comisiones: comisiones,
      iva: iva,
      subtotal: subtotal,
      ivaRet: ivaRet,
      isrRet: isrRet,
      total: totalH,
    });
  }, [costo]);

  const actualizarTramite = async () => {
    if (!file) {
      toast.error("Selecciona un archivo");
      return;
    }
    const response = await handleUpload();
    console.log(response); // Espera la subida del archivo
    if (!response || !response.message) {
      toast.error("Error al subir el archivo.");
      return;
    }
    for (let i = 0; i < id_tramite.length; i++) {
      const data = {
        id: id_tramite[i],
        estatus: "ESPERANDO PAGO",
        url_factura: response.path,
        url_xml: fileXML.name,
        fecha_factura: fecha,
      };
      try {
        const result = await updateTramites(data);
        if (result.message) {
          toast.success("Guardado exitosamente.");
        } else {
          toast.error("Error al guardar el trámite.");
        }
      } catch (error) {
        toast.error("Hubo un problema al guardar el trámite.");
      }
    }
    navigate(0);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("Archivo seleccionado:", selectedFile);

    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  const handleXMLChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("Archivo seleccionado:", selectedFile);

    if (selectedFile) {
      setFileXML(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Selecciona un archivo");
      return null;
    }

    try {
      const response = await uploadArchivo(file);
      const responseXML = await uploadArchivo(fileXML);

      console.log("Respuesta del backend:", response);
      console.log("Respuesta del backend:", responseXML);
      if (response?.message && responseXML?.message) {
        toast.success("Archivo subido correctamente");
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
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar Factura</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Comisiones
            </Label>
            <Label htmlFor="name" className="text-right">
              ${total} MXN
            </Label>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              IVA
            </Label>
            <Label htmlFor="name" className="text-right">
              ${calculos?.iva?.toFixed(2)} MXN
            </Label>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Subtotal
            </Label>
            <Label htmlFor="name" className="text-right">
              ${calculos?.subtotal?.toFixed(2)} MXN
            </Label>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              IVA Ret
            </Label>
            <Label htmlFor="name" className="text-right">
              ${calculos?.ivaRet?.toFixed(2)} MXN
            </Label>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              ISR Ret
            </Label>
            <Label htmlFor="name" className="text-right">
              ${calculos?.isrRet?.toFixed(2)} MXN
            </Label>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Total
            </Label>
            <Label htmlFor="name" className="text-right">
              ${calculos?.total?.toFixed(2)} MXN
            </Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Fecha
            </Label>
            {/* DatePicker input real con padding izquierdo para que no se solape con el ícono */}
            <div className="col-span-3">
              <DatePicker
                popperPlacement="bottom-start"
                toggleCalendarOnIconClick
                selected={fecha ? parse(fecha, "dd/MM/yyyy", new Date()) : null}
                onChange={(date) => {
                  if (date) {
                    const formattedDate = format(date, "dd/MM/yyyy");
                    setFecha(formattedDate);
                  }
                }}
                dateFormat="dd/MM/yyyy"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-xs transition-all duration-150 focus:border-gray-400 focus:outline-hidden focus:ring-2 focus:ring-gray-300 hover:shadow-md"
              />
            </div>
          </div>
          <div className="grid items-center gap-1.5">
            <Label htmlFor="picture">Factura</Label>
            <Input id="picture" type="file" onChange={handleFileChange} />
          </div>
          <div className="grid items-center gap-1.5">
            <Label htmlFor="picture">XML</Label>
            <Input id="picture" type="file" onChange={handleXMLChange} />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              actualizarTramite();
            }}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
