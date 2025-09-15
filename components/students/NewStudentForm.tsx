"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"; // ← verifica que EXISTE este archivo y exporte esos nombres
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export default function NewStudentForm({ open, onOpenChange }: Props) {
  const [nombre, setNombre] = React.useState("");
  const [apellidos, setApellidos] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [planId, setPlanId] = React.useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(
      "/alumnos",
      {
        nombre,
        apellido_paterno: apellidos,
        email,
        telefono,
        plan_id: Number(planId),
        fecha_inscripcion: new Date().toISOString().slice(0, 10),
        fecha_inicio: new Date().toISOString().slice(0, 10),
        estatus: "activo",
      },
      { withCredentials: true }
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle>Registrar Nuevo Alumno</DialogTitle></DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div><label className="text-sm">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
          <div><label className="text-sm">Apellidos</label>
            <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} /></div>
          <div><label className="text-sm">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="text-sm">Teléfono</label>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} /></div>
          <div>
            <label className="text-sm">Plan</label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Plan Básico</SelectItem>
                <SelectItem value="2">Plan Intermedio</SelectItem>
                <SelectItem value="3">Plan Avanzado</SelectItem>
                <SelectItem value="4">Plan Intensivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Registrar Alumno</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
