# Resumen del Proyecto Trópico-web

## Lo que está funcionando

### Autenticación
- Login con email + contraseña
- Recuperar contraseña (envía email via Supabase)
- Establecer contraseña (primer acceso y recovery)
- Logout
- Protección de rutas (público vs autenticado vs admin)

### Panel de Admin - ABM Socios
- Listado de socios con filtros (búsqueda por nombre/apellido/email/nro. socio + estado activo/inactivo)
- Crear socio (datos personales + datos administrativos/sensibles)
- Editar socio
- Dar de baja / reactivar (soft delete)
- Resetear contraseña de un socio

### Infraestructura
- Next.js + TypeScript + Tailwind CSS
- Supabase (Auth + DB con RLS)
- Middleware con refresh de sesión y control de roles
- 6 tablas con índices, triggers y Row Level Security

## Lo que falta (según la spec)

| Paso | Tarea | Estado |
|------|-------|--------|
| 3 | ABM Socios - envío de magic link al crear socio | Parcial (genera link pero no envía email automáticamente) |
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
│   │           ├── page.tsx        (listado con filtros)
│   │           ├── socio-form.tsx  (formulario compartido)
│   │           ├── socio-row.tsx   (fila de tabla)
│   │           ├── nuevo/page.tsx  (crear socio)
│   │           └── [id]/editar/page.tsx (editar socio)
│   └── auth/callback/route.ts     (magic link y recovery)
├── lib/
│   ├── supabase/
│   │   ├── client.ts   (browser)
│   │   ├── server.ts   (server components)
│   │   └── admin.ts    (service role)
│   └── actions/
│       └── socios.ts   (server actions CRUD)
├── middleware.ts
supabase/
└── migrations/
    ├── 00001_initial_schema.sql
    └── 00002_split_nombre_apellido.sql
scripts/
├── seed-admin.ts
└── check-admin.ts
```

## Datos de acceso (desarrollo)
- URL: http://localhost:3000
- Admin: admin@tropico.test / admin123
