"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Plan } from "@/hooks/usePlans";
import { createPlan, updatePlan } from "@/hooks/usePlans";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan?: Plan | null;
  onSaved?: () => void;
};

type FormState = {
  nombre: string;
  descripcion: string;
  numero_mensualidades: string;
  precio_mensualidad: string;
  precio_inscripcion: string;
  vigencia_meses: string;
  extension_meses: string;
  activo: boolean;
};

const emptyForm: FormState = {
  nombre: "",
  descripcion: "",
  numero_mensualidades: "1",
  precio_mensualidad: "0",
  precio_inscripcion: "0",
  vigencia_meses: "12",
  extension_meses: "4",
  activo: true,
};

export default function PlanFormModal({
  open,
  onOpenChange,
  plan,
  onSaved,
}: Props) {
  const isEdit = useMemo(() => Boolean(plan?.id), [plan]);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (plan) {
      setF({
        nombre: plan.nombre ?? "",
        descripcion: (plan.descripcion ?? "") as string,
        numero_mensualidades: String(plan.numero_mensualidades ?? "1"),
        precio_mensualidad: String(plan.precio_mensualidad ?? "0"),
        precio_inscripcion: String(plan.precio_inscripcion ?? "0"),
        vigencia_meses: String(plan.vigencia_meses ?? "12"),
        extension_meses: String(plan.extension_meses ?? "4"),
        // si en tu tipo Plan 'activo' ya es number (0/1), lo convertimos a boolean:
        activo: typeof (plan as any).activo === "number" ? Boolean((plan as any).activo) : !!(plan as any).activo,
      });
    } else {
      setF(emptyForm);
    }
    setErrors({});
  }, [plan, open]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((s) => ({ ...s, [k]: v }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!f.nombre.trim()) e.nombre = "Requerido";
    const nn = Number(f.numero_mensualidades);
    if (!Number.isFinite(nn) || nn < 1) e.numero_mensualidades = "Debe ser >= 1";
    const pm = Number(f.precio_mensualidad);
    if (!Number.isFinite(pm) || pm < 0) e.precio_mensualidad = "Número inválido";
    const pi = Number(f.precio_inscripcion);
    if (!Number.isFinite(pi) || pi < 0) e.precio_inscripcion = "Número inválido";
    const vg = Number(f.vigencia_meses);
    if (!Number.isFinite(vg) || vg < 1) e.vigencia_meses = "Debe ser >= 1";
    const ex = Number(f.extension_meses);
    if (!Number.isFinite(ex) || ex < 0) e.extension_meses = "Debe ser >= 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      // ⚠️ FIX: convertir booleano a 0/1 porque el backend/typen de hook espera number
      const payload = {
        nombre: f.nombre.trim(),
        descripcion: f.descripcion.trim() || null,
        numero_mensualidades: Number(f.numero_mensualidades),
        precio_mensualidad: Number(f.precio_mensualidad),
        precio_inscripcion: Number(f.precio_inscripcion),
        vigencia_meses: Number(f.vigencia_meses),
        extension_meses: Number(f.extension_meses),
        activo: f.activo ? 1 : 0, // ← aquí el cambio clave
      };

      if (isEdit && plan) {
        await updatePlan(plan.id, payload);
      } else {
        await createPlan(payload);
      }

      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Error al guardar el plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar plan" : "Nuevo plan"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza la información del plan."
              : "Crea un nuevo plan para asignarlo a alumnos."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Nombre *</Label>
            <Input
              value={f.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Plan Básico"
            />
            {errors.nombre && (
              <p className="text-xs text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Descripción</Label>
            <Textarea
              value={f.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="space-y-2">
            <Label>Mensualidades *</Label>
            <Input
              type="number"
              min={1}
              value={f.numero_mensualidades}
              onChange={(e) => set("numero_mensualidades", e.target.value)}
            />
            {errors.numero_mensualidades && (
              <p className="text-xs text-red-600">
                {errors.numero_mensualidades}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Monto mensual *</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={f.precio_mensualidad}
              onChange={(e) => set("precio_mensualidad", e.target.value)}
            />
            {errors.precio_mensualidad && (
              <p className="text-xs text-red-600">
                {errors.precio_mensualidad}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Inscripción *</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={f.precio_inscripcion}
              onChange={(e) => set("precio_inscripcion", e.target.value)}
            />
            {errors.precio_inscripcion && (
              <p className="text-xs text-red-600">
                {errors.precio_inscripcion}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Vigencia (meses) *</Label>
            <Input
              type="number"
              min={1}
              value={f.vigencia_meses}
              onChange={(e) => set("vigencia_meses", e.target.value)}
            />
            {errors.vigencia_meses && (
              <p className="text-xs text-red-600">{errors.vigencia_meses}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Extensión (meses) *</Label>
            <Input
              type="number"
              min={0}
              value={f.extension_meses}
              onChange={(e) => set("extension_meses", e.target.value)}
            />
            {errors.extension_meses && (
              <p className="text-xs text-red-600">
                {errors.extension_meses}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <Checkbox
              id="activo"
              checked={f.activo}
              onCheckedChange={(v) => set("activo", Boolean(v))}
            />
            <Label htmlFor="activo">Activo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {isEdit ? "Guardar cambios" : "Crear plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
