import { api } from "@/lib/api";
import type { Alumno, AlumnoListFilters, ApiListResponse, ApiOneResponse } from "@/types/alumnos";

export async function listStudents(filters: AlumnoListFilters = {}) {
  const { data } = await api.get<ApiListResponse<Alumno>>("/alumnos", { params: filters });
  return data;
}

export async function getStudent(id: number) {
  const { data } = await api.get<ApiOneResponse<Alumno>>(`/alumnos/${id}`);
  return data;
}

export async function createStudent(payload: Partial<Alumno>) {
  const { data } = await api.post<ApiOneResponse<Alumno>>("/alumnos", payload);
  return data;
}

export async function updateStudent(id: number, payload: Partial<Alumno>) {
  const { data } = await api.put<ApiOneResponse<Alumno>>(`/alumnos/${id}`, payload);
  return data;
}

export async function deleteStudent(id: number) {
  const { data } = await api.delete(`/alumnos/${id}`);
  return data as { success: boolean; message?: string };
}
