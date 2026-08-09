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
import { nuevoUsuario } from "@/features/rpp/services/rpp";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
export function FormularioUsers({ onClose }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [user, setUser] = useState("");
  const [rol, setRol] = useState("");

  const generatePassword = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
  };
  const addUser = async () => {
    const data = {
      nombre_usuario: user,
      contrasena: password,
      rol_id: rol,
    };
    const response = await nuevoUsuario(data);
    if (response.success) {
      toast.success("Usuario agregado exitosamente.");
      setTimeout(() => {
        navigate(0);
      }, 1500);
    } else {
      toast.error("Error en agregar.");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar nuevo usuario</DialogTitle>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Contraseña
            </Label>
            <Input
              type="text"
              value={password}
              readOnly
              className="col-span-2 w-full"
            />
            <button
              onClick={() => generatePassword()}
              className="flex items-center"
            >
              <IconContext.Provider
                value={{
                  className: "global-class-name",
                  size: "2em",
                }}
              >
                <MdOutlineWifiProtectedSetup />
              </IconContext.Provider>
            </button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rol" className="text-right">
              Rol
            </Label>
            <Select onValueChange={setRol}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona el rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="2">Agente</SelectItem>
                  <SelectItem value="1">Afianzadora</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              addUser();
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
