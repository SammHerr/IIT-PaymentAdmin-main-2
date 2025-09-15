"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  alumnoId?: number | null;
  onSaved?: () => void;
};

export default function EditStudentSheet({ open, onOpenChange, alumnoId, onSaved }: Props) {
  const [form, setForm] = useState<any>({ email: "", telefono: "", estatus: "activo", plan_id: 1 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !alumnoId) return;
    setLoading(true);
    setErr(null);
    api.get(`/alumnos/${alumnoId}`, { withCredentials: true })
      .then((r) => {
        const a = r.data.data;
        setForm({
          email: a.email ?? "",
          telefono: a.telefono ?? "",
          estatus: a.estatus ?? "activo",
          plan_id: a.plan_id ?? 1,
        });
      })
      .catch(() => setErr("No se pudo cargar el alumno"))
      .finally(() => setLoading(false));
  }, [open, alumnoId]);

  const save = async () => {
    if (!alumnoId) return;
    setLoading(true);
    setErr(null);
    try {
      await api.put(`/alumnos/${alumnoId}`, {
        email: form.email || null,
        telefono: form.telefono || null,
        estatus: form.estatus,
        plan_id: Number(form.plan_id),
      }, { withCredentials: true });
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <SheetContent side="right" className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Editar Alumno</SheetTitle>
        </SheetHeader>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm((s: any) => ({ ...s, email: e.target.value }))} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => setForm((s: any) => ({ ...s, telefono: e.target.value }))} />
            </div>
            <div>
              <Label>Estatus</Label>
              <Select value={form.estatus} onValueChange={(v) => setForm((s: any) => ({ ...s, estatus: v }))}>
                <SelectTrigger><SelectValue placeholder="Estatus" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="graduado">Graduado</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                  <SelectItem value="saldo_pendiente">Saldo pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={String(form.plan_id)} onValueChange={(v) => setForm((s: any) => ({ ...s, plan_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Plan Básico</SelectItem>
                  <SelectItem value="2">Plan Intermedio</SelectItem>
                  <SelectItem value="3">Plan Avanzado</SelectItem>
                  <SelectItem value="4">Plan Intensivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        )}

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={save} disabled={loading}>
            {loading ? "Guardando…" : "Guardar cambios"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
