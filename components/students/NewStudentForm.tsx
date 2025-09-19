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
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
};

const fetcher = (url: string) => api.get(url).then(r => r.data.data ?? r.data);

export default function NewStudentForm({ open, onOpenChange, onCreated }: Props) {
  // ------- planes desde BD -------
  const { data: planesData, isLoading: loadingPlanes } = useSWR<Plan[]>("/planes", fetcher);

  // ------- estado del formulario (campos mínimos + extras que ya usas) -------
  const [form, setForm] = useState({
    matricula: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    genero: "M",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigo_postal: "",
    contacto_emergencia: "",
    telefono_emergencia: "",
    relacion_emergencia: "",
    fecha_inscripcion: new Date().toISOString().slice(0, 10),
    fecha_inicio: new Date().toISOString().slice(0, 10),
    plan_id: "",
    estatus: "activo",
    motivo_baja: "",
    notas: "",
    documentos_url: "",
  });

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const fotoPreview = useMemo(() => (fotoFile ? URL.createObjectURL(fotoFile) : ""), [fotoFile]);

  useEffect(() => {
    if (!open) {
      setFotoFile(null);
      setForm((f) => ({ ...f, matricula: "", nombre: "", apellido_paterno: "", apellido_materno: "" }));
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.plan_id) {
      alert("Selecciona un plan.");
      return;
    }

    try {
      // Si vas a subir foto real, aquí podrías llamar a /upload y tomar la URL resultante.
      // Por ahora, si no hay foto => "sin fotografía"
      const foto_url = fotoFile ? "sin_foto_por_ahora" : ""; // <-- cámbialo si implementas /upload

      // documentos_url en textarea: CSV -> array JSON
      const docsArray =
        form.documentos_url
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean) ?? [];

      await api.post("/alumnos", {
        ...form,
        plan_id: Number(form.plan_id),
        foto_url, // opcional
        documentos_url: docsArray,
      });

      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || "Error creando alumno");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-full
          max-w-[min(100vw-2rem,1000px)]
          p-0
        "
      >
        <form onSubmit={handleSubmit} className="h-[80vh] flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Registrar Nuevo Alumno</DialogTitle>
            <DialogDescription>Completa la información del alumno.</DialogDescription>
          </DialogHeader>

          {/* SCROLLABLE CONTENT */}
          <div className="px-6 pb-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input name="nombre" value={form.nombre} onChange={handleChange} required />
              </div>
              <div>
                <Label>Apellido paterno *</Label>
                <Input name="apellido_paterno" value={form.apellido_paterno} onChange={handleChange} required />
              </div>
              <div>
                <Label>Apellido materno</Label>
                <Input name="apellido_materno" value={form.apellido_materno} onChange={handleChange} />
              </div>

              <div>
                <Label>Fecha de Nacimiento</Label>
                <Input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
              </div>
              <div>
                <Label>Género</Label>
                <Select
                  value={form.genero}
                  onValueChange={(v) => setForm((f) => ({ ...f, genero: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Teléfono</Label>
                <Input name="telefono" value={form.telefono} onChange={handleChange} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" name="email" value={form.email} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <Label>Dirección</Label>
                <Input name="direccion" value={form.direccion} onChange={handleChange} />
              </div>

              <div>
                <Label>Ciudad</Label>
                <Input name="ciudad" value={form.ciudad} onChange={handleChange} />
              </div>
              <div>
                <Label>Estado</Label>
                <Input name="estado" value={form.estado} onChange={handleChange} />
              </div>
              <div>
                <Label>Código Postal</Label>
                <Input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
              </div>

              <div>
                <Label>Contacto de Emergencia</Label>
                <Input name="contacto_emergencia" value={form.contacto_emergencia} onChange={handleChange} />
              </div>
              <div>
                <Label>Teléfono de Emergencia</Label>
                <Input name="telefono_emergencia" value={form.telefono_emergencia} onChange={handleChange} />
              </div>
              <div>
                <Label>Relación</Label>
                <Input name="relacion_emergencia" value={form.relacion_emergencia} onChange={handleChange} />
              </div>

              <div>
                <Label>Fecha de Inscripción *</Label>
                <Input type="date" name="fecha_inscripcion" value={form.fecha_inscripcion} onChange={handleChange} required />
              </div>
              <div>
                <Label>Fecha de Inicio *</Label>
                <Input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
              </div>

              {/* Plan desde la BD */}
              <div className="md:col-span-2">
                <Label>Plan *</Label>
                <Select
                  value={form.plan_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, plan_id: v }))}
                  disabled={loadingPlanes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPlanes ? "Cargando planes..." : "Seleccionar plan"} />
                  </SelectTrigger>
                  <SelectContent>
                    {planesData?.filter(p => !!p.activo).map((p) => (
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
                  value={form.estatus}
                  onValueChange={(v) => setForm((f) => ({ ...f, estatus: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="graduado">Graduado</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Motivo de baja (opcional)</Label>
                <Input name="motivo_baja" value={form.motivo_baja} onChange={handleChange} />
              </div>

              {/* Fotografía */}
              <div className="md:col-span-2">
                <Label>Fotografía</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFotoFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="text-sm text-muted-foreground">
                    {fotoFile ? "archivo seleccionado" : "sin fotografía"}
                  </div>
                </div>
                {fotoPreview ? (
                  <img src={fotoPreview} alt="preview" className="mt-2 h-24 w-24 rounded object-cover border" />
                ) : null}
              </div>

              <div className="md:col-span-2">
                <Label>Documentos (URLs, separadas por coma)</Label>
                <Textarea
                  name="documentos_url"
                  value={form.documentos_url}
                  onChange={handleChange}
                  placeholder='https://example.com/ine.pdf, https://example.com/curp.jpg'
                />
              </div>

              <div className="md:col-span-2">
                <Label>Notas</Label>
                <Textarea name="notas" value={form.notas} onChange={handleChange} />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Registrar Alumno</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
