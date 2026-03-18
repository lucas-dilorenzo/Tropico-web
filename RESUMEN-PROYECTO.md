# Resumen del Proyecto Trópico-web

## Lo que está funcionando

### Autenticación
- Login con email + contraseña
- Recuperar contraseña (genera link copiable)
- Establecer contraseña (primer acceso y recovery)
- Logout
- Protección de rutas (público vs autenticado vs admin)

### Panel de Admin - ABM Socios
- Listado de socios con filtros en tiempo real (búsqueda por nombre/apellido/email/nro. socio + estado)
- Ordenamiento por columna (nombre, nro. socio, estado, activo)
- Paginación de 25 registros con ventana de páginas
- Crear socio con validaciones server-side completas (campos obligatorios, formato email, DNI/teléfono numéricos, DNI único, límites de longitud)
- Email con selector de dominio predefinido + opción "otro"
- Estado con valores predefinidos (enum) + opción "otro" libre
- Generar link de invitación copiable al crear socio
- Editar socio
- Dar de baja / reactivar (soft delete)
- Generar link de reseteo de contraseña copiable desde el listado

### Infraestructura
- Next.js + TypeScript + Tailwind CSS
- Supabase (Auth + DB con RLS)
- Middleware con refresh de sesión y control de roles
- 6 tablas con índices, triggers y Row Level Security
- Validaciones server-side en todas las acciones
- Rollback automático en caso de fallo al crear socio
- Constantes compartidas (estados de socios)

## Lo que falta

| Paso | Tarea | Estado |
|------|-------|--------|
| 4 | Contenido/Noticias - CRUD posts con fotos y video YouTube + etiqueta "Nuevo" por socio | Pendiente |
| 5 | Catálogo - ABM categorías + ABM productos con fotos | Pendiente |
| 6 | Perfil del socio - ver y editar (nombre, apellido, teléfono, email, contraseña) | Pendiente |
| 7 | Diseño/pulido final | Pendiente |

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── recuperar-clave/page.tsx
│   │   ├── establecer-clave/page.tsx
│   │   └── logout/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx              (navbar con links según rol)
│   │   ├── inicio/page.tsx
│   │   └── admin/
│   │       ├── page.tsx            (panel principal)
│   │       └── socios/
│   │           ├── page.tsx        (listado con filtros, orden y paginación)
│   │           ├── socio-form.tsx  (formulario compartido crear/editar)
│   │           ├── socio-row.tsx   (fila de tabla con acciones)
│   │           ├── socios-filtros.tsx (filtros en tiempo real)
│   │           ├── socios-th.tsx   (headers ordenables)
│   │           ├── nuevo/page.tsx  (crear socio)
│   │           └── [id]/editar/page.tsx (editar socio)
│   └── auth/callback/route.ts     (magic link y recovery)
├── lib/
│   ├── supabase/
│   │   ├── client.ts   (browser)
│   │   ├── server.ts   (server components)
│   │   └── admin.ts    (service role)
│   ├── actions/
│   │   └── socios.ts   (server actions CRUD)
│   └── constants.ts    (ESTADOS_SOCIO y otros valores compartidos)
├── middleware.ts
supabase/
└── migrations/
    ├── 00001_initial_schema.sql
    └── 00002_split_nombre_apellido.sql
scripts/
├── seed-admin.ts
├── seed-socios.ts
└── check-admin.ts
```

## Datos de acceso (desarrollo)
- URL: http://localhost:3000
- Admin: admin@tropico.test / admin123
