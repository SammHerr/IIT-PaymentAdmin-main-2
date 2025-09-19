"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Plan = { id: number; nombre: string; activo: number | boolean };

type Props = {
  id: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated?: () => void;
};

const fetcher = (url: string) => api.get(url).then(r => r.data.data ?? r.data);

export default function EditStudentSheet({ id, open, onOpenChange, onUpdated }: Props) {
  const { data: planes } = useSWR<Plan[]>("/planes", fetcher);

  const [form, setForm] = useState<any>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const fotoPreview = useMemo(() => (fotoFile ? URL.createObjectURL(fotoFile) : ""), [fotoFile]);

  // cargar alumno
  useEffect(() => {
    const load = async () => {
      if (!id || !open) return;
      const r = await api.get(`/alumnos/${id}`);
      setForm(r.data.data);
      setFotoFile(null);
    };
    load();
  }, [id, open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      let foto_url = form?.foto_url ?? "";
      if (fotoFile) {
        // Subida real si implementas /upload; por ahora dejamos el actual.
        // foto_url = "nueva_url";
      }

      // documentos_url si viene como CSV en textarea (cuando hayas permitido editar)
      let documentos = form.documentos_url;
      if (typeof documentos === "string") {
        documentos = documentos
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      await api.put(`/alumnos/${id}`, {
        ...form,
        plan_id: Number(form.plan_id),
        foto_url,
        documentos_url: documentos,
      });

      onOpenChange(false);
      onUpdated?.();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Error actualizando alumno");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[min(100vw-2rem,1000px)] p-0">
        <form onSubmit={handleSubmit} className="h-[80vh] flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Editar Alumno</DialogTitle>
            <DialogDescription>Actualiza los datos del alumno.</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 overflow-y-auto">
            {!form ? (
              <div className="text-sm text-muted-foreground">Cargando…</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input name="nombre" value={form.nombre ?? ""} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Apellido paterno *</Label>
                  <Input name="apellido_paterno" value={form.apellido_paterno ?? ""} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Apellido materno</Label>
                  <Input name="apellido_materno" value={form.apellido_materno ?? ""} onChange={handleChange} />
                </div>

                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    name="fecha_nacimiento"
                    value={(form.fecha_nacimiento ?? "").slice(0, 10)}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label>Género</Label>
                  <Select
                    value={form.genero ?? "M"}
                    onValueChange={(v) => setForm((f: any) => ({ ...f, genero: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Teléfono</Label>
                  <Input name="telefono" value={form.telefono ?? ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" name="email" value={form.email ?? ""} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <Label>Dirección</Label>
                  <Input name="direccion" value={form.direccion ?? ""} onChange={handleChange} />
                </div>

                <div>
                  <Label>Ciudad</Label>
                  <Input name="ciudad" value={form.ciudad ?? ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input name="estado" value={form.estado ?? ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Código Postal</Label>
                  <Input name="codigo_postal" value={form.codigo_postal ?? ""} onChange={handleChange} />
                </div>

                <div>
                  <Label>Contacto de Emergencia</Label>
                  <Input name="contacto_emergencia" value={form.contacto_emergencia ?? ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Teléfono de Emergencia</Label>
                  <Input name="telefono_emergencia" value={form.telefono_emergencia ?? ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Relación</Label>
                  <Input name="relacion_emergencia" value={form.relacion_emergencia ?? ""} onChange={handleChange} />
                </div>

                <div>
                  <Label>Fecha Inscripción</Label>
                  <Input type="date" name="fecha_inscripcion" value={(form.fecha_inscripcion ?? "").slice(0, 10)} onChange={handleChange} />
                </div>
                <div>
                  <Label>Fecha Inicio</Label>
                  <Input type="date" name="fecha_inicio" value={(form.fecha_inicio ?? "").slice(0, 10)} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <Label>Plan (id)</Label>
                  <Select
                    value={String(form.plan_id ?? "")}
                    onValueChange={(v) => setForm((f: any) => ({ ...f, plan_id: Number(v) }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {planes?.filter(p => !!p.activo).map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estatus *</Label>
                  <Select
                    value={form.estatus ?? "activo"}
                    onValueChange={(v) => setForm((f: any) => ({ ...f, estatus: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="graduado">Graduado</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Motivo de baja</Label>
                  <Input name="motivo_baja" value={form.motivo_baja ?? ""} onChange={handleChange} />
                </div>

                <div className="md:col-span-2">
                  <Label>Foto actual</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
                    />
                    <a
                      href={form.foto_url || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline"
                    >
                      {form.foto_url ? "ver" : "sin fotografía"}
                    </a>
                  </div>
                  {fotoPreview ? (
                    <img src={fotoPreview} alt="preview" className="mt-2 h-24 w-24 rounded object-cover border" />
                  ) : null}
                </div>

                <div className="md:col-span-2">
                  <Label>Documentos (URLs, coma)</Label>
                  <Textarea
                    name="documentos_url"
                    value={
                      Array.isArray(form.documentos_url)
                        ? form.documentos_url.join(", ")
                        : (form.documentos_url ?? "")
                    }
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Notas</Label>
                  <Textarea name="notas" value={form.notas ?? ""} onChange={handleChange} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
