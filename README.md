
<img width="961" height="259" alt="tropico" src="https://github.com/user-attachments/assets/d369d560-38bd-4957-ae54-b81b50cd7163" />

# Trópico Web

> Plataforma de gestión para cooperativas y organizaciones de socios.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

---

## ¿Qué es Trópico Web?

Trópico Web es una aplicación web full-stack para administrar socios, contenido y catálogo de una cooperativa u organización. Permite a los administradores gestionar el ciclo de vida completo de los socios — desde el alta con invitación, hasta la baja — y a los socios acceder a su perfil e información de la organización.

---

## Funcionalidades

### Panel de administración
- **ABM Socios** — alta, edición, baja/reactivación y reseteo de contraseña
- **Invitación por link** — generación de links de acceso copiables para compartir por WhatsApp o email
- **Filtros en tiempo real** — búsqueda por nombre, email o número de socio con filtro por estado
- **Ordenamiento por columna** — nombre, número de socio, estado y activo
- **Paginación** — 25 registros por página

### Autenticación
- Login con email y contraseña
- Recuperación de contraseña por link
- Establecer contraseña en el primer acceso
- Protección de rutas por rol (`socio` / `admin`)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) con App Router |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Backend / Auth / DB | [Supabase](https://supabase.com) (PostgreSQL + RLS) |
| Runtime | Node.js |

---

## Instalación

### Requisitos
- Node.js 18+
- Proyecto en [Supabase](https://supabase.com)

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/lucas-dilorenzo/Tropico-web.git
cd Tropico-web

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Completar con las credenciales de tu proyecto Supabase

# Aplicar migraciones (desde el dashboard de Supabase o CLI)
# supabase db push

# Crear usuario admin inicial
npx tsx scripts/seed-admin.ts

# Iniciar servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Linter

npx tsx scripts/seed-admin.ts    # Crear usuario admin
npx tsx scripts/seed-socios.ts   # Crear socios de prueba
```

---

## Licencia

Uso privado — todos los derechos reservados.
