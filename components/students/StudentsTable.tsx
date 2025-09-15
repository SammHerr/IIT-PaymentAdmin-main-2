"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useAuth } from "@/app/(auth)/auth-context";
import { api } from "@/lib/api";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Plus, Trash2, RefreshCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

// Modales con carga dinámica
const NewStudentForm = dynamic(() => import("./NewStudentForm"), { ssr: false });
const EditStudentSheet = dynamic(() => import("./EditStudentSheet"), { ssr: false });
const StudentDetailSheet = dynamic(() => import("./StudentDetailSheet"), { ssr: false });

type Alumno = {
  id: number;
  matricula: string;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  plan_nombre: string;
  estatus: "activo" | "graduado" | "baja" | "suspendido" | "saldo_pendiente";
  fecha_inscripcion: string | null;
  foto_url?: string | null;
};

export default function StudentsTable() {
  const [search, setSearch] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDelId, setConfirmDelId] = useState<number | null>(null);
  const [motivoBaja, setMotivoBaja] = useState("");

  const { user } = useAuth();

  const { data, isLoading, error, mutate, setQuery } = useStudents({
    search,
    page: 1,
    limit: 50,
    sortBy: "id",
    sortOrder: "desc",
  });

  const rows: Alumno[] = useMemo(() => data ?? [], [data]);

  const handleDelete = async () => {
    if (!confirmDelId) return;
    try {
      await api.delete(`/alumnos/${confirmDelId}`, { data: { motivo_baja: motivoBaja } });
      setConfirmDelId(null);
      setMotivoBaja("");
      mutate();
      toast({ title: "Alumno dado de baja" });
    } catch (e: any) {
      toast({ title: "No se pudo eliminar", description: e?.response?.data?.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Buscar por nombre o matrícula..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setQuery(q => ({ ...q, search: e.target.value })); }}
          className="max-w-md"
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Recargar
          </Button>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Alumno
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
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.matricula}</TableCell>
                    <TableCell>{nombre}</TableCell>
                    <TableCell>{a.plan_nombre}</TableCell>
                    <TableCell>
                      <Badge variant={
                        a.estatus === "activo" ? "default" :
                        a.estatus === "baja" ? "secondary" :
                        a.estatus === "suspendido" ? "destructive" : "outline"
                      }>
                        {a.estatus === "saldo_pendiente" ? "Saldo Pendiente" :
                         a.estatus.charAt(0).toUpperCase() + a.estatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.fecha_inscripcion ? new Date(a.fecha_inscripcion).toLocaleDateString() : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button size="icon" variant="ghost" title="Ver" onClick={() => setDetailId(a.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Editar" onClick={() => setEditId(a.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user?.rol === "admin" && (
                          <Button size="icon" variant="ghost" title="Eliminar" onClick={() => setConfirmDelId(a.id)}>
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
      <NewStudentForm
        open={openNew}
        onOpenChange={(v) => { setOpenNew(v); if (!v) mutate(); }}
        onCreated={() => mutate()}
      />

      {/* Editar */}
      {editId && (
        <EditStudentSheet
          id={editId}
          open={!!editId}
          onOpenChange={(v) => { if (!v) setEditId(null); }}
          onUpdated={() => mutate()}
        />
      )}

      {/* Ver detalle */}
      {detailId && (
        <StudentDetailSheet
          id={detailId}
          open={!!detailId}
          onOpenChange={(v) => { if (!v) setDetailId(null); }}
        />
      )}

      {/* Confirmar eliminación con motivo */}
      <Dialog open={!!confirmDelId} onOpenChange={(v) => { if (!v) { setConfirmDelId(null); setMotivoBaja(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar de baja al alumno</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm">Ingresa el motivo de la baja:</p>
            <Textarea value={motivoBaja} onChange={(e) => setMotivoBaja(e.target.value)} placeholder="Motivo..." />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setConfirmDelId(null); setMotivoBaja(""); }}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete}>Confirmar baja</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
