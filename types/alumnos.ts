export type EstatusAlumno = "activo" | "graduado" | "baja" | "suspendido";

export type Alumno = {
  id: number;
  matricula: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  telefono?: string | null;
  email?: string | null;
  fecha_inscripcion: string; // ISO (DATE)
  fecha_inicio: string;      // ISO (DATE)
  fecha_vigencia: string;    // ISO (DATE)
  estatus: EstatusAlumno;
  plan_id: number;
  plan_nombre: string;

  // agregados del select (pueden venir null)
  mensualidades_pagadas?: number | null;
  mensualidades_pendientes?: number | null;
  mensualidades_vencidas?: number | null;
  total_pagado?: number | null;
  saldo_pendiente?: number | null;
};

export type AlumnoListFilters = {
  search?: string;
  estatus?: EstatusAlumno;
  plan_id?: number;
  fecha_inicio_desde?: string; // 'YYYY-MM-DD'
  fecha_inicio_hasta?: string; // 'YYYY-MM-DD'
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  pagination: ApiPagination;
};

export type ApiOneResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};
