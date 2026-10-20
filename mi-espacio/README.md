# Mi Espacio

App estilo Notion, simple, para tres cosas: **finanzas**, **laburo** y **personal**. Se instala en el celu y en la compu (PWA), tiene gráficos y manda notificaciones.

## Qué tiene

- **Inicio:** saludo, balance del mes, presupuesto usado, tareas para hoy, próximos pagos y dos gráficos (gastos por categoría y tareas hechas por semana).
- **Finanzas:**
  - Ingresos y gastos por categoría, en **pesos o dólares** (con cotización manual del dólar para los totales).
  - **Presupuesto mensual** por categoría, con barra de progreso y aviso al llegar al 80% y al pasarte.
  - **Gastos fijos** (alquiler, servicios, tarjeta) con día de vencimiento. Al marcarlos como pagados se cargan solos como gasto del mes.
  - Gráficos: dona por categoría y barras de ingresos contra gastos de los últimos 6 meses. Con ‹ › cambiás de mes.
- **Laburo** y **Personal:** tareas con fecha, prioridad, estado (pendiente / en curso / hecha) y notas. Para agregar una, escribís y apretás Enter. Se agrupan en Vencidas / Hoy / Mañana / Próximas / Sin fecha.
- **Notificaciones** (horarios configurables en Ajustes):
  - Resumen diario a la mañana.
  - Tareas que vencen hoy o mañana (a la tarde).
  - Vencimientos de pagos, desde 1 a 7 días antes.
  - Recordatorio a la noche para cargar los gastos (solo si ese día no cargaste nada).
- **Nube:** cada una entra con su email y ve solo sus datos, sincronizados entre la compu y el celu.
- **Funciona sin internet** y tiene copia de seguridad (exportar e importar en JSON).

## Cómo usarla

Es una página estática: no hace falta compilar nada.

- **Online:** con GitHub Pages activado en este repo, queda en `https://<usuario>.github.io/Skills/mi-espacio/`.
- **En la compu:** `cd mi-espacio && python3 -m http.server 8000` y abrís `http://localhost:8000`.

### Instalarla en el celular
- **iPhone:** en Safari, Compartir → *Agregar a inicio*. Abrila desde el ícono y activá las notificaciones en Ajustes (en iPhone solo funcionan con la app instalada).
- **Android:** en Chrome, menú ⋮ → *Instalar app*.

## Activar la nube (Supabase, gratis, ~5 minutos)

1. Creá una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. En **SQL Editor**, pegá esto y apretá *Run*:

   ```sql
   create table if not exists public.espacio_data (
     user_id uuid primary key references auth.users(id) on delete cascade,
     data jsonb not null default '{}'::jsonb,
     updated_at timestamptz not null default now()
   );
   alter table public.espacio_data enable row level security;
   create policy "cada una ve lo suyo" on public.espacio_data
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```

3. En **Authentication → URL Configuration**, poné la dirección de la app (por ejemplo `https://<usuario>.github.io/Skills/mi-espacio/`) en *Site URL* y en *Redirect URLs*.
4. (Recomendado para iPhone) En **Authentication → Email Templates → Magic Link**, agregá `{{ .Token }}` al texto del mail. Así llega un código de 6 dígitos para escribir dentro de la app, sin tener que abrir un link en Safari.
5. En **Project Settings → API**, copiá la *Project URL* y la *anon public key* y pegalas en `config.js`. Así sirven para las tres sin tener que cargarlas cada vez. La otra opción es pegarlas en **Ajustes → Nube** de la app.
6. En la app: **Ajustes → Nube**, escribís tu email, te llega el código y listo.

> La *anon key* puede ser pública: cada persona solo puede leer y escribir su propia fila gracias a la política de seguridad (RLS) del paso 2.

### Cómo sincroniza
Se guarda primero en el dispositivo y después se sube a la nube (al cambiar algo, al volver a abrir la app y al recuperar la conexión). Si editaste en dos dispositivos a la vez, se combinan ítem por ítem y gana la edición más reciente.

## Límites de las notificaciones
Sin un servidor de push, los avisos se disparan cuando la app está abierta o en segundo plano. Al abrirla, también salen los avisos de ese día que quedaron pendientes. En Android, con la app instalada desde Chrome, además se revisan solos cada tanto aunque esté cerrada (eso lo decide el navegador). Si más adelante querés avisos exactos con la app cerrada en iPhone, el paso siguiente sería una función programada de Supabase que mande Web Push.

## Archivos
| Archivo | Qué hace |
|---|---|
| `index.html` | Estructura y navegación |
| `app.js` | Toda la lógica: datos, vistas, gráficos, recordatorios y sincronización |
| `styles.css` | Estilos (modo claro y oscuro automáticos) |
| `sw.js` | Service worker: modo offline y avisos en segundo plano |
| `config.js` | URL y clave de Supabase (opcional) |
| `manifest.webmanifest`, `icon*` | Datos para instalarla como app |
