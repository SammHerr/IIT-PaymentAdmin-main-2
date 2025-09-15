"use client";

import * as React from "react";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
};

export default function NewStudentForm({ open, onOpenChange, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // campos
  const [matricula, setMatricula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apPat, setApPat] = useState("");
  const [apMat, setApMat] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [genero, setGenero] = useState<"M" | "F" | "Otro">("M");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [cp, setCp] = useState("");
  const [contactoEmer, setContactoEmer] = useState("");
  const [telEmer, setTelEmer] = useState("");
  const [relEmer, setRelEmer] = useState("");
  const [fechaIns, setFechaIns] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [fechaInicio, setFechaInicio] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [planId, setPlanId] = useState<string>("1");
  const [estatus, setEstatus] = useState<"activo"|"graduado"|"baja"|"suspendido"|"saldo_pendiente">("activo");
  const [motivoBaja, setMotivoBaja] = useState("");
  const [notas, setNotas] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string>("");

  const [docUrls, setDocUrls] = useState<string>(""); // coma-separado -> array

  const handleUploadPhoto = async (file?: File) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    const res = await api.post("/upload/photo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    setFotoUrl(res.data.url);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload = {
        matricula: matricula || undefined,
        nombre,
        apellido_paterno: apPat,
        apellido_materno: apMat,
        fecha_nacimiento: fechaNac,
        genero,
        telefono,
        email,
        direccion,
        ciudad,
        estado,
        codigo_postal: cp,
        contacto_emergencia: contactoEmer,
        telefono_emergencia: telEmer,
        relacion_emergencia: relEmer,
        fecha_inscripcion: fechaIns,
        fecha_inicio: fechaInicio,
        plan_id: Number(planId),
        estatus,
        motivo_baja: motivoBaja,
        notas,
        foto_url: fotoUrl,
        documentos_url: docUrls
          .split(",")
          .map(s => s.trim())
          .filter(Boolean), // array
      };

      await api.post("/alumnos", payload, { withCredentials: true });

      onOpenChange(false);
      onCreated?.();
      toast({ title: "Alumno registrado" });
      // limpiar
      setMatricula(""); setNombre(""); setApPat(""); setApMat(""); setFechaNac("");
      setGenero("M"); setTelefono(""); setEmail(""); setDireccion(""); setCiudad("");
      setEstado(""); setCp(""); setContactoEmer(""); setTelEmer(""); setRelEmer("");
      setFechaIns(new Date().toISOString().slice(0,10));
      setFechaInicio(new Date().toISOString().slice(0,10));
      setPlanId("1"); setEstatus("activo"); setMotivoBaja(""); setNotas(""); setFotoUrl(""); setDocUrls("");
    } catch (error: any) {
      setErr(error?.response?.data?.error || "No se pudo registrar el alumno.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Alumno</DialogTitle>
          <DialogDescription>Completa la información del alumno</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Identidad */}
          <div>
            <Label>Matrícula (opcional)</Label>
            <Input value={matricula} onChange={(e)=>setMatricula(e.target.value)} />
          </div>
          <div>
            <Label>Nombre *</Label>
            <Input value={nombre} onChange={(e)=>setNombre(e.target.value)} required />
          </div>
          <div>
            <Label>Apellido Paterno *</Label>
            <Input value={apPat} onChange={(e)=>setApPat(e.target.value)} required />
          </div>
          <div>
            <Label>Apellido Materno</Label>
            <Input value={apMat} onChange={(e)=>setApMat(e.target.value)} />
          </div>
          <div>
            <Label>Fecha de Nacimiento</Label>
            <Input type="date" value={fechaNac} onChange={(e)=>setFechaNac(e.target.value)} />
          </div>
          <div>
            <Label>Género</Label>
            <Select value={genero} onValueChange={(v)=>setGenero(v as any)}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="F">F</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacto */}
          <div>
            <Label>Teléfono</Label>
            <Input value={telefono} onChange={(e)=>setTelefono(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Dirección</Label>
            <Input value={direccion} onChange={(e)=>setDireccion(e.target.value)} />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input value={ciudad} onChange={(e)=>setCiudad(e.target.value)} />
          </div>
          <div>
            <Label>Estado</Label>
            <Input value={estado} onChange={(e)=>setEstado(e.target.value)} />
          </div>
          <div>
            <Label>Código Postal</Label>
            <Input value={cp} onChange={(e)=>setCp(e.target.value)} />
          </div>

          {/* Emergencia */}
          <div>
            <Label>Contacto de Emergencia</Label>
            <Input value={contactoEmer} onChange={(e)=>setContactoEmer(e.target.value)} />
          </div>
          <div>
            <Label>Teléfono de Emergencia</Label>
            <Input value={telEmer} onChange={(e)=>setTelEmer(e.target.value)} />
          </div>
          <div>
            <Label>Relación</Label>
            <Input value={relEmer} onChange={(e)=>setRelEmer(e.target.value)} />
          </div>

          {/* Plan / fechas / estatus */}
          <div>
            <Label>Fecha de Inscripción *</Label>
            <Input type="date" required value={fechaIns} onChange={(e)=>setFechaIns(e.target.value)} />
          </div>
          <div>
            <Label>Fecha de Inicio *</Label>
            <Input type="date" required value={fechaInicio} onChange={(e)=>setFechaInicio(e.target.value)} />
          </div>
          <div>
            <Label>Plan *</Label>
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
          <div>
            <Label>Estatus *</Label>
            <Select value={estatus} onValueChange={(v)=>setEstatus(v as any)}>
              <SelectTrigger><SelectValue placeholder="Estatus" /></SelectTrigger>
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
            <Label>Motivo de baja (si aplica)</Label>
            <Input value={motivoBaja} onChange={(e)=>setMotivoBaja(e.target.value)} />
          </div>

          {/* Foto */}
          <div className="md:col-span-2">
            <Label>Fotografía</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={(e)=>handleUploadPhoto(e.target.files?.[0])} />
              {fotoUrl ? <span className="text-sm text-muted-foreground">Subida ✓</span> : <span className="text-sm">sin fotografía</span>}
            </div>
          </div>

          {/* Documentos / notas */}
          <div className="md:col-span-2">
            <Label>Documentos (URLs, separadas por coma)</Label>
            <Input value={docUrls} onChange={(e)=>setDocUrls(e.target.value)} placeholder="https://... , https://..." />
          </div>
          <div className="md:col-span-2">
            <Label>Notas</Label>
            <Textarea value={notas} onChange={(e)=>setNotas(e.target.value)} />
          </div>

          {err && <p className="text-sm text-red-600 md:col-span-2">{err}</p>}

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
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
