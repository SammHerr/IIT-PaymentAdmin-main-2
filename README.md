# Sistema de Gestión de Cobranza y Control de Alumnos

Sistema web desarrollado con Next.js para automatizar el control de pagos, seguimiento de mensualidades, morosidades, estatus de alumnos y generación de reportes para centros educativos.

## 🚀 Características Principales

### 1. Gestión de Alumnos
- Registro completo de estudiantes con matrícula única
- Control de planes contratados (5, 8 o 10 mensualidades)
- Seguimiento de vigencia de planes (12 meses + 4 de extensión)
- Visualización de estatus (activo, graduado, baja)

### 2. Control de Pagos
- Registro detallado de pagos con recibos únicos
- Identificación automática de pagos tardíos
- Cálculo automático de moratorios (1% diario)
- Estados de recibo: pagado, pendiente, cancelado

### 3. Cobranza Automatizada
- Generación automática de listas de cobranza mensual
- Visualización de total esperado vs cobrado
- Control de morosidad individual y porcentaje general
- Seguimiento de saldos pendientes por alumno

### 4. Reportes Dinámicos
- Reportes por alumno, plan, fecha, estatus o morosidad
- Resumen de cobranza mensual con porcentajes
- Separación de ingresos por tipo (mensualidades, moratorios, inscripciones)
- Exportación de reportes en PDF/Excel

### 5. Dashboard Administrativo
- Métricas clave en tiempo real
- Filtros por mes, estatus o tipo de plan
- Visualización de alumnos activos y porcentaje de cobranza
- Control de pagos vencidos y morosidad acumulada

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: bcryptjs para hash de contraseñas

## 📦 Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd student-management-system
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env
\`\`\`
Editar `.env` con tus configuraciones de base de datos.

4. **Configurar la base de datos**
\`\`\`bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:push

# Poblar con datos iniciales (opcional)
npm run db:seed
\`\`\`

5. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Tablas Principales:
- **Site**: Información del centro educativo
- **Plan**: Planes de mensualidades disponibles
- **Membership**: Membresías activas de estudiantes
- **Student**: Información completa de estudiantes
- **Payment**: Registro de todos los pagos

### Relaciones:
- Un sitio puede tener múltiples planes
- Un plan puede tener múltiples membresías
- Un estudiante pertenece a una membresía
- Una membresía puede tener múltiples pagos

## 🔧 API Endpoints

### Estudiantes
- `GET /api/students` - Listar estudiantes con filtros
- `POST /api/students` - Crear nuevo estudiante
- `GET /api/students/[id]` - Obtener estudiante específico
- `PUT /api/students/[id]` - Actualizar estudiante
- `DELETE /api/students/[id]` - Eliminar estudiante

### Pagos
- `GET /api/payments` - Listar pagos con filtros
- `POST /api/payments` - Registrar nuevo pago

### Cobranza
- `GET /api/collections` - Obtener datos de cobranza mensual

### Reportes
- `GET /api/reports` - Generar reportes dinámicos

### Planes
- `GET /api/plans` - Listar planes disponibles
- `POST /api/plans` - Crear nuevo plan

## 📊 Funcionalidades de Cobranza

### Cálculo de Moratorios
- Tasa: 1% diario sobre el monto adeudado
- Cálculo automático basado en días de retraso
- Acumulación en reportes de morosidad

### Estados de Pago
- **Pagado**: Pago completado y registrado
- **Pendiente**: Pago no realizado, puede generar moratorios
- **Cancelado**: Pago anulado o cancelado

### Tipos de Pago
- **Mensualidad**: Pago regular del plan
- **Inscripción**: Pago inicial de registro
- **Moratorio**: Penalización por pago tardío

## 🎯 Uso del Sistema

### Para Administradores:
1. **Dashboard**: Visualizar métricas generales
2. **Gestión de Alumnos**: Registrar y administrar estudiantes
3. **Control de Pagos**: Registrar pagos y generar recibos
4. **Cobranza**: Revisar listas de morosidad y contactar alumnos
5. **Reportes**: Generar análisis detallados por período

### Flujo Típico:
1. Registrar nuevo alumno con plan seleccionado
2. Sistema genera matrícula y membresía automáticamente
3. Registrar pagos conforme se reciben
4. Monitorear morosidad en módulo de cobranza
5. Generar reportes mensuales para análisis

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de datos en frontend y backend
- Manejo seguro de tokens de sesión
- Sanitización de inputs para prevenir SQL injection

## 📈 Métricas y KPIs

El sistema proporciona las siguientes métricas clave:
- Porcentaje de cobranza mensual
- Número de alumnos activos vs total
- Monto de moratorios acumulados
- Distribución de ingresos por tipo
- Tendencias de inscripciones y bajas

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.
