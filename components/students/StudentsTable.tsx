"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useStudents, type StudentsQuery } from "@/hooks/useStudents";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Plus } from "lucide-react";

// Modal: solo en cliente
const NewStudentForm = dynamic(() => import("./NewStudentForm"), { ssr: false });

type Alumno = {
  id: number;
  matricula: string;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  plan_nombre: string;
  estatus: "activo" | "graduado" | "baja" | "suspendido";
  fecha_inscripcion: string | null;
};

export default function StudentsTable() {
  const [search, setSearch] = useState("");
  const [openNew, setOpenNew] = useState(false);

  const { data, loading, error, setQuery, refetch } = useStudents({
    page: 1,
    limit: 50,
    sortBy: "id",
    sortOrder: "desc",
  } as StudentsQuery);

  // Debounce del buscador → actualiza la query del hook
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => ({ ...q, search, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [search, setQuery]);

  const rows: Alumno[] = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((a: any) => ({
      id: a.id,
      matricula: a.matricula,
      nombre: a.nombre,
      apellido_paterno: a.apellido_paterno,
      apellido_materno: a.apellido_materno,
      plan_nombre: a.plan_nombre,
      estatus: a.estatus,
      fecha_inscripcion: a.fecha_inscripcion,
    })) as Alumno[];
  }, [data]);

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
            Recargar
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-600 py-8">
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Sin resultados
                </TableCell>
              </TableRow>
            ) : (
              rows.map((a) => {
                const nombreCompleto = `${a.nombre} ${a.apellido_paterno ?? ""} ${
                  a.apellido_materno ?? ""
                }`.trim();
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.matricula}</TableCell>
                    <TableCell>{nombreCompleto}</TableCell>
                    <TableCell>{a.plan_nombre}</TableCell>
                    <TableCell>
                      <Badge variant={a.estatus === "activo" ? "default" : "secondary"}>
                        {a.estatus === "activo"
                          ? "Activo"
                          : a.estatus === "graduado"
                          ? "Graduado"
                          : a.estatus === "baja"
                          ? "Baja"
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
                        <Button size="icon" variant="ghost" title="Ver">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NewStudentForm
        open={openNew}
        onOpenChange={(v) => {
          setOpenNew(v);
          if (!v) refetch();
        }}
      />
    </div>
  );
}
