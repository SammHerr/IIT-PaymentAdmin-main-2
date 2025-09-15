"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type Props = {
  id: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated?: () => void;
};

export default function EditStudentSheet({ id, open, onOpenChange, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    api.get(`/alumnos/${id}`).then(r => setData(r.data.data));
  }, [id, open]);

  const uploadPhoto = async (f?: File) => {
    if (!f) return;
    const fd = new FormData();
    fd.append("photo", f);
    const res = await api.post("/upload/photo", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setData((d: any) => ({ ...d, foto_url: res.data.url }));
  };

  const save = async () => {
    try {
      setLoading(true);
      const payload = { ...data };
      // documentos_url si viene string, pásalo a array
      if (typeof payload.documentos_url === "string") {
        payload.documentos_url = payload.documentos_url
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      await api.put(`/alumnos/${id}`, payload);
      toast({ title: "Alumno actualizado" });
      onUpdated?.();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error actualizando", description: e?.response?.data?.error, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[720px] sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Alumno</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Matrícula</Label>
            <Input value={data.matricula ?? ""} onChange={(e)=>setData({...data, matricula:e.target.value})} />
          </div>
          <div>
            <Label>Nombre</Label>
            <Input value={data.nombre ?? ""} onChange={(e)=>setData({...data, nombre:e.target.value})} />
          </div>
          <div>
            <Label>Apellido Paterno</Label>
            <Input value={data.apellido_paterno ?? ""} onChange={(e)=>setData({...data, apellido_paterno:e.target.value})} />
          </div>
          <div>
            <Label>Apellido Materno</Label>
            <Input value={data.apellido_materno ?? ""} onChange={(e)=>setData({...data, apellido_materno:e.target.value})} />
          </div>
          <div>
            <Label>Fecha Nacimiento</Label>
            <Input type="date" value={(data.fecha_nacimiento ?? "").slice(0,10)} onChange={(e)=>setData({...data, fecha_nacimiento:e.target.value})} />
          </div>
          <div>
            <Label>Género</Label>
            <Select value={data.genero ?? "M"} onValueChange={(v)=>setData({...data, genero:v})}>
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
            <Input value={data.telefono ?? ""} onChange={(e)=>setData({...data, telefono:e.target.value})} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={data.email ?? ""} onChange={(e)=>setData({...data, email:e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <Label>Dirección</Label>
            <Input value={data.direccion ?? ""} onChange={(e)=>setData({...data, direccion:e.target.value})} />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input value={data.ciudad ?? ""} onChange={(e)=>setData({...data, ciudad:e.target.value})} />
          </div>
          <div>
            <Label>Estado</Label>
            <Input value={data.estado ?? ""} onChange={(e)=>setData({...data, estado:e.target.value})} />
          </div>
          <div>
            <Label>Código Postal</Label>
            <Input value={data.codigo_postal ?? ""} onChange={(e)=>setData({...data, codigo_postal:e.target.value})} />
          </div>

          <div>
            <Label>Contacto Emergencia</Label>
            <Input value={data.contacto_emergencia ?? ""} onChange={(e)=>setData({...data, contacto_emergencia:e.target.value})} />
          </div>
          <div>
            <Label>Teléfono Emergencia</Label>
            <Input value={data.telefono_emergencia ?? ""} onChange={(e)=>setData({...data, telefono_emergencia:e.target.value})} />
          </div>
          <div>
            <Label>Relación</Label>
            <Input value={data.relacion_emergencia ?? ""} onChange={(e)=>setData({...data, relacion_emergencia:e.target.value})} />
          </div>

          <div>
            <Label>Fecha Inscripción</Label>
            <Input type="date" value={(data.fecha_inscripcion ?? "").slice(0,10)} onChange={(e)=>setData({...data, fecha_inscripcion:e.target.value})} />
          </div>
          <div>
            <Label>Fecha Inicio</Label>
            <Input type="date" value={(data.fecha_inicio ?? "").slice(0,10)} onChange={(e)=>setData({...data, fecha_inicio:e.target.value})} />
          </div>
          <div>
            <Label>Plan (id)</Label>
            <Input type="number" value={data.plan_id ?? 1} onChange={(e)=>setData({...data, plan_id:Number(e.target.value)})} />
          </div>
          <div>
            <Label>Estatus</Label>
            <Select value={data.estatus ?? "activo"} onValueChange={(v)=>setData({...data, estatus:v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="graduado">Graduado</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="saldo_pendiente">Saldo Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label>Motivo de baja</Label>
            <Input value={data.motivo_baja ?? ""} onChange={(e)=>setData({...data, motivo_baja:e.target.value})} />
          </div>

          <div className="md:col-span-2">
            <Label>Foto actual</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={(e)=>uploadPhoto(e.target.files?.[0])} />
              {data.foto_url ? <a className="text-sm underline" href={data.foto_url} target="_blank">ver</a> : <span className="text-sm">sin fotografía</span>}
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Documentos (URLs, coma)</Label>
            <Input
              value={Array.isArray(data.documentos_url) ? data.documentos_url.join(", ") : (data.documentos_url ?? "")}
              onChange={(e)=>setData({...data, documentos_url:e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Notas</Label>
            <Textarea value={data.notas ?? ""} onChange={(e)=>setData({...data, notas:e.target.value})} />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button>
            <Button onClick={save} disabled={loading}>{loading ? "Guardando..." : "Guardar cambios"}</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
