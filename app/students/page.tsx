// app/students/page.tsx  ← SIN "use client"
import StudentsTable from "@/components/students/StudentsTable"; // default import

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function StudentsPage() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
      </div>
      <StudentsTable />
    </div>
  );
}
