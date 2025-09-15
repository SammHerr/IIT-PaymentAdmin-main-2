"use client";

import * as React from "react";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
};

export default function NewStudentForm({ open, onOpenChange, onCreated }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState(""); // -> apellido_paterno
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [planId, setPlanId] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      await api.post(
        "/alumnos",
        {
          // matrícula opcional (backend la genera si falta)
          nombre,
          apellido_paterno: apellidos || "N/A",
          apellido_materno: null,
          email: email || null,
          telefono: telefono || null,

          // requeridos por tu esquema/negocio:
          fecha_inscripcion: hoy,
          fecha_inicio: hoy,
          plan_id: Number(planId),
          estatus: "activo",

          // opcionales en null:
          ciudad: null,
          estado: null,
          direccion: null,
          codigo_postal: null,
          genero: null,
          fecha_nacimiento: null,
          contacto_emergencia: null,
          telefono_emergencia: null,
          relacion_emergencia: null,
          motivo_baja: null,
          notas: null,
          foto_url: null,
          documentos_url: null,
        },
        { withCredentials: true }
      );

      onOpenChange(false);
      setNombre(""); setApellidos(""); setEmail(""); setTelefono(""); setPlanId("1");
      onCreated?.();
    } catch (error: any) {
      setErr(error?.response?.data?.error || "No se pudo registrar el alumno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Alumno</DialogTitle>
          <DialogDescription>Ingresa la información del nuevo estudiante</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Nombre</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>

          <div>
            <Label>Apellidos</Label>
            <Input
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="(se usará como apellido paterno)"
              required
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>

          <div>
            <Label>Teléfono</Label>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>

          <div>
            <Label>Plan</Label>
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

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Registrar Alumno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
