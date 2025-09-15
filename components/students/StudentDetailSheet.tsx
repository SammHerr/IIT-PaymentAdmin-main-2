"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Props = {
  id: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function StudentDetailSheet({ id, open, onOpenChange }: Props) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    api.get(`/alumnos/${id}`).then(r => setData(r.data.data));
  }, [id, open]);

  if (!data) return null;

  const nombre = `${data.nombre} ${data.apellido_paterno ?? ""} ${data.apellido_materno ?? ""}`.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[720px] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle de Alumno</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            {data.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.foto_url} alt="foto" className="h-20 w-20 rounded object-cover border" />
            ) : (
              <div className="h-20 w-20 flex items-center justify-center rounded border text-xs text-muted-foreground">
                sin fotografía
              </div>
            )}
            <div>
              <div className="font-semibold text-lg">{nombre}</div>
              <div className="text-sm text-muted-foreground">Matrícula: {data.matricula ?? "—"}</div>
              <div className="text-sm text-muted-foreground">Plan: {data.plan_nombre}</div>
              <div className="text-sm text-muted-foreground">Estatus: {data.estatus}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><strong>Fecha Nac.</strong> <div>{data.fecha_nacimiento ? new Date(data.fecha_nacimiento).toLocaleDateString() : "—"}</div></div>
            <div><strong>Género</strong> <div>{data.genero ?? "—"}</div></div>
            <div><strong>Teléfono</strong> <div>{data.telefono ?? "—"}</div></div>
            <div><strong>Email</strong> <div>{data.email ?? "—"}</div></div>
            <div className="col-span-2"><strong>Dirección</strong> <div>{data.direccion ?? "—"}, {data.ciudad ?? ""} {data.estado ?? ""} CP {data.codigo_postal ?? ""}</div></div>
            <div><strong>Contacto Emergencia</strong> <div>{data.contacto_emergencia ?? "—"}</div></div>
            <div><strong>Tel. Emergencia</strong> <div>{data.telefono_emergencia ?? "—"}</div></div>
            <div><strong>Relación</strong> <div>{data.relacion_emergencia ?? "—"}</div></div>
            <div><strong>Fecha Inscripción</strong> <div>{data.fecha_inscripcion ? new Date(data.fecha_inscripcion).toLocaleDateString() : "—"}</div></div>
            <div><strong>Fecha Inicio</strong> <div>{data.fecha_inicio ? new Date(data.fecha_inicio).toLocaleDateString() : "—"}</div></div>
            <div><strong>Motivo Baja</strong> <div>{data.motivo_baja ?? "—"}</div></div>
            <div className="col-span-2"><strong>Notas</strong> <div>{data.notas ?? "—"}</div></div>
            <div className="col-span-2">
              <strong>Documentos</strong>
              <div className="flex flex-col gap-1">
                {Array.isArray(data.documentos_url) && data.documentos_url.length > 0
                  ? data.documentos_url.map((u: string, i: number) => (
                      <a key={i} href={u} target="_blank" className="text-blue-600 underline">{u}</a>
                    ))
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
