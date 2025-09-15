"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
};

export default function ConfirmDeleteDialog({ open, onOpenChange, onConfirm, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar alumno</DialogTitle>
          <DialogDescription>Esta acción marcará el alumno como <b>baja</b>. ¿Deseas continuar?</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={() => onConfirm()} disabled={loading}>
            {loading ? "Eliminando…" : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
