"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/app/(auth)/auth-context";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Plus, RotateCw, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

// dinámicos para evitar SSR issues
const NewStudentForm = dynamic(() => import("./NewStudentForm"), { ssr: false });
const StudentDetailSheet = dynamic(() => import("./StudentDetailSheet"), { ssr: false });
const EditStudentSheet = dynamic(() => import("./EditStudentSheet"), { ssr: false });
const ConfirmDeleteDialog = dynamic(() => import("./ConfirmDeleteDialog"), { ssr: false });

type Alumno = {
  id: number;
  matricula: string;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  plan_nombre: string;
  plan_id?: number;
  estatus: "activo" | "graduado" | "baja" | "suspendido" | "saldo_pendiente";
  fecha_inscripcion: string | null;
};

export default function StudentsTable() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";

  const [search, setSearch] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error, mutate, setQuery } = useStudents({
    search, page: 1, limit: 50, sortBy: "id", sortOrder: "desc",
  });

  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => ({ ...q, search })), 300);
    return () => clearTimeout(t);
  }, [search, setQuery]);

  const rows: Alumno[] = useMemo(() => data ?? [], [data]);
  const refetch = () => mutate();

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/alumnos/${deleteId}`, { withCredentials: true });
      setDeleteId(null);
      mutate();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Buscar por nombre o matrícula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Alumno
          </Button>
          <Button variant="outline" onClick={refetch}>
            <RotateCw className="mr-2 h-4 w-4" /> Recargar
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando…</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={6} className="text-center text-red-600 py-8">{error}</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Sin resultados</TableCell></TableRow>
            ) : (
              rows.map((a) => {
                const nombre = `${a.nombre} ${a.apellido_paterno ?? ""} ${a.apellido_materno ?? ""}`.trim();
                const est = a.estatus;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.matricula}</TableCell>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>{a.plan_nombre}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          est === "activo"
                            ? "default"
                            : est === "baja"
                            ? "secondary"
                            : est === "suspendido"
                            ? "secondary"
                            : "secondary"
                        }
                      >
                        {est === "activo"
                          ? "Activo"
                          : est === "baja"
                          ? "Baja"
                          : est === "graduado"
                          ? "Graduado"
                          : est === "saldo_pendiente"
                          ? "Saldo pendiente"
                          : "Suspendido"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.fecha_inscripcion
                        ? new Date(a.fecha_inscripcion).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="icon" variant="ghost" title="Ver" onClick={() => setDetailId(a.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Editar" onClick={() => setEditId(a.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Eliminar"
                            onClick={() => setDeleteId(a.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Crear */}
      <NewStudentForm open={openNew} onOpenChange={setOpenNew} onCreated={refetch} />

      {/* Detalle */}
      <StudentDetailSheet open={detailId !== null} onOpenChange={(v) => !v && setDetailId(null)} alumnoId={detailId ?? undefined} />

      {/* Editar */}
      <EditStudentSheet open={editId !== null} onOpenChange={(v) => !v && setEditId(null)} alumnoId={editId ?? undefined} onSaved={refetch} />

      {/* Eliminar (solo admin) */}
      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
