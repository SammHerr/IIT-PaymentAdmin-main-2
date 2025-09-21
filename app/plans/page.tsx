"use client";

import { useState } from "react";
import { usePlans, deletePlan } from "@/hooks/usePlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PlanFormModal from "@/components/plans/PlanFormModal";
import type { Plan } from "@/hooks/usePlans";

export default function PlansPage() {
  const { list, isLoading, error, mutate } = usePlans();

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const onDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar el plan "${nombre}"?`)) return;
    try {
      await deletePlan(id);
      mutate();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Error eliminando plan");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gestión de Planes</h2>
          <p className="text-sm text-muted-foreground">Administra los planes disponibles</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpenModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Mensualidades</TableHead>
                  <TableHead>Monto Mensual</TableHead>
                  <TableHead>Inscripción</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Extensión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      Cargando…
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-red-600">
                      Error cargando planes
                    </TableCell>
                  </TableRow>
                ) : list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      Sin planes
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nombre}</TableCell>
                      <TableCell>{p.numero_mensualidades}</TableCell>
                      <TableCell>${Number(p.precio_mensualidad).toLocaleString()}</TableCell>
                      <TableCell>${Number(p.precio_inscripcion).toLocaleString()}</TableCell>
                      <TableCell>{p.vigencia_meses} meses</TableCell>
                      <TableCell>{p.extension_meses} meses</TableCell>
                      <TableCell>
                        <Badge variant={p.activo ? "default" : "secondary"}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="icon"
                            title="Editar"
                            onClick={() => {
                              setEditing(p);
                              setOpenModal(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            title="Eliminar"
                            onClick={() => onDelete(p.id, p.nombre)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PlanFormModal
        open={openModal}
        onOpenChange={setOpenModal}
        plan={editing}
        onSaved={() => mutate()}
      />
    </div>
  );
}
