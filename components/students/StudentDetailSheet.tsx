"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; alumnoId?: number | null; };

export default function StudentDetailSheet({ open, onOpenChange, alumnoId }: Props) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !alumnoId) return;
    setLoading(true);
    api.get(`/alumnos/${alumnoId}`, { withCredentials: true })
      .then((r) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [open, alumnoId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Detalle del Alumno</SheetTitle>
        </SheetHeader>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
        ) : !data ? (
          <p className="mt-4 text-sm text-muted-foreground">Sin información</p>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <div><span className="font-medium">Matrícula:</span> {data.matricula}</div>
            <div><span className="font-medium">Nombre:</span> {data.nombre} {data.apellido_paterno} {data.apellido_materno ?? ""}</div>
            <div><span className="font-medium">Plan:</span> {data.plan_nombre}</div>
            <div><span className="font-medium">Estatus:</span> {data.estatus}</div>
            <div><span className="font-medium">Email:</span> {data.email ?? "—"}</div>
            <div><span className="font-medium">Teléfono:</span> {data.telefono ?? "—"}</div>
            <div><span className="font-medium">Fecha inscripción:</span> {data.fecha_inscripcion ? new Date(data.fecha_inscripcion).toLocaleDateString() : "—"}</div>
            <div><span className="font-medium">Fecha inicio:</span> {data.fecha_inicio ? new Date(data.fecha_inicio).toLocaleDateString() : "—"}</div>
            <div><span className="font-medium">Vigencia:</span> {data.fecha_vigencia ? new Date(data.fecha_vigencia).toLocaleDateString() : "—"}</div>
            <div><span className="font-medium">Notas:</span> {data.notas ?? "—"}</div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
