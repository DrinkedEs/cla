# L&A Dental App

App web mobile-first para L&A con autenticacion real, MySQL local y dashboards por rol. El rol `doctor` representa al estudiante de odontologia que publica su perfil, CV, fotos y servicios.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MySQL local con `mysql2/promise`
- Validacion con `zod`
- Hash de contrasenas con `bcryptjs`
- Sesiones por cookie HTTP-only

## Lo que ya hace

- Registro de `paciente` con datos basicos y perfil clinico
- Registro de `doctor` con CV PDF obligatorio, fotos opcionales y servicio inicial obligatorio
- Login/logout real con redireccion por rol
- Dashboard protegido para paciente con feed, agenda, mensajes e historial
- Dashboard protegido para doctor con feed, agenda, mensajeria e historial clinico
- CRUD propio de cuenta para ambos roles
- CRUD completo de servicios para doctor
- Alta y baja de fotos del perfil del doctor
- Publicaciones persistentes para el feed del doctor
- Agenda persistente entre pacientes y doctores
- Conversaciones y mensajes persistentes
- Expedientes e intervenciones clinicas persistentes
- Catalogo publico de servicios y perfiles conectado a MySQL

## Modelo de datos

- `users`
- `sessions`
- `patient_profiles`
- `doctor_profiles`
- `doctor_photos`
- `doctor_services`
- `file_assets`
- `doctor_posts`
- `post_reactions`
- `appointments`
- `appointment_status_history`
- `conversations`
- `conversation_members`
- `messages`
- `clinical_records`
- `clinical_record_entries`

El SQL base vive en [database/schema.sql](/C:/Users/jackm/Desktop/CLA/database/schema.sql:1).

## Variables de entorno

Crea `.env.local` tomando como base [`.env.example`](/C:/Users/jackm/Desktop/CLA/.env.example:1):

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=la_dental
APP_BASE_URL=http://localhost:3000
SESSION_MAX_AGE_DAYS=14
```

`DB_NAME` ya no esta amarrado a `la_dental`: el bootstrap usa el valor configurado en el entorno.

## Instalacion local

```bash
npm install
npm run db:init
npm run dev
```

La app corre por defecto en `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:init
npm run db:backfill-assets
npm run db:seed-demo
```

## Flujo de base de datos local

1. Asegura que tu servidor MySQL local este arriba.
2. Deja `root/root` o ajusta `.env.local`.
3. Ejecuta `npm run db:init`.
4. El script usa `DB_NAME`; si la base no existe y tu usuario tiene permisos, la crea con `utf8mb4` y luego crea o actualiza las tablas necesarias.

## Despliegue en AlwaysData

Esta app se despliega como sitio `Node.js`, no como sitio estatico: usa rutas server-side, sesiones por cookie y MariaDB/MySQL para autenticacion, perfiles, servicios y archivos.

La salida de produccion usa `output: "standalone"` en [next.config.ts](/C:/Users/jackm/Desktop/CLA/next.config.ts:1), y el artifact Linux se genera con [build-linux-deployable.yml](/C:/Users/jackm/Desktop/CLA/.github/workflows/build-linux-deployable.yml:1).

### Requisitos recomendados

- Sitio en AlwaysData sobre el subdominio `https://[account].alwaysdata.net`
- Node.js `22 LTS`
- MariaDB/MySQL en `mysql-[account].alwaysdata.net`
- HTTPS forzado desde la configuracion del sitio

### Variables de entorno para produccion

Crea `.env.local` en el servidor con valores como estos:

```env
DB_HOST=mysql-[account].alwaysdata.net
DB_PORT=3306
DB_USER=[usuario_mysql]
DB_PASSWORD=[password_mysql]
DB_NAME=[base_creada_en_alwaysdata]
APP_BASE_URL=https://[account].alwaysdata.net
SESSION_MAX_AGE_DAYS=14
```

### Flujo real que funciono

AlwaysData puede matar `npm run build`, `npm install` o la descarga de `swc` por memoria/cuota. La ruta estable fue:

1. Subir el repo a GitHub.
2. Ejecutar el workflow `Build Linux Deployable` en GitHub Actions.
3. Descargar el artifact Linux `alwaysdata-deploy-linux.tar.gz`.
4. Subir ese `tar.gz` por SSH/SCP a una carpeta limpia del servidor, por ejemplo `$HOME/www/la-dental-app-v5`.
5. Extraer el artifact y arrancar la salida `standalone` directamente con `node server.js`.

### Build Linux con GitHub Actions

1. Haz push del repo a GitHub.
2. En `Actions`, corre `Build Linux Deployable`.
3. Descarga el artifact `alwaysdata-deploy-linux`.
4. Extrae el artifact descargado en tu PC si viene envuelto en `.zip`.
5. Toma el archivo `alwaysdata-deploy-linux.tar.gz` y subelo al servidor.

### Subida por SSH/SCP

Ejemplo desde Windows:

```bash
scp C:\Users\jackm\Downloads\alwaysdata-deploy-linux.tar.gz [account]@ssh-[account].alwaysdata.net:~/www/la-dental-app-v5/
```

En el servidor:

```bash
mkdir -p $HOME/www/la-dental-app-v5
cd $HOME/www/la-dental-app-v5
tar -xzf alwaysdata-deploy-linux.tar.gz
rm -f alwaysdata-deploy-linux.tar.gz
```

Despues crea `.env.local` y ejecuta:

```bash
npm run db:init
```

No hace falta correr `npm run build` en el servidor.

### Configuracion del sitio en AlwaysData

En `Web > Sites`:

- `Type`: `Node.js`
- `Working directory`: `/home/[account]/www/la-dental-app-v5`
- `Command`: `node server.js`
- `Node.js version`: `22`

En `Environment` define estas variables:

```env
HOSTNAME=::
PORT=8100
DB_HOST=mysql-[account].alwaysdata.net
DB_PORT=3306
DB_USER=[usuario_mysql]
DB_PASSWORD=[password_mysql]
DB_NAME=[base_creada_en_alwaysdata]
APP_BASE_URL=https://[account].alwaysdata.net
SESSION_MAX_AGE_DAYS=14
NODE_ENV=production
```

Importante:

- No pongas `HOSTNAME=$IP` en `Environment`; AlwaysData no expande esa variable ahi y el proceso falla con `ENOTFOUND $IP`.
- En este proyecto funciono `HOSTNAME=::` y `PORT=8100`.
- El proceso correcto de arranque es `node server.js`, no `npm run start`.
- Si quieres validar manualmente por SSH, puedes probar:

```bash
cd $HOME/www/la-dental-app-v5
export HOSTNAME="::"
export PORT="8100"
node server.js
```

### Notas de despliegue

- `npm run db:init` trabaja contra la base indicada en `DB_NAME`; no depende de un nombre fijo.
- Si quieres poblar una demo funcional con feed, citas, mensajes e historial, ejecuta `npm run db:seed-demo` despues de `npm run db:init`.
- En AlwaysData lo normal es crear la base primero desde el panel. Si localmente usas un usuario con permisos, el script tambien puede crear la base faltante de forma automatica.
- Los CV y fotos nuevos se guardan en `file_assets` dentro de MariaDB/MySQL, asi que no necesitas disco compartido para los uploads en produccion.
- Si vienes de una version antigua que aun referenciaba archivos en disco, sube esos archivos historicos y luego ejecuta `npm run db:backfill-assets`.
- Si no tienes datos historicos en filesystem, `storage/` y `tmp/` no forman parte del despliegue productivo.
- Si un despliegue queda mezclado o bloqueado por permisos, usa una carpeta nueva (`la-dental-app-v2`, `v3`, `v4`, `v5`, etc.) y cambia el `Working directory` del sitio.
- Si AlwaysData muestra `Connection to upstream failed`, revisa los logs del sitio y confirma que realmente exista un proceso `node server.js`.

## Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `PATCH /api/me`
- `DELETE /api/me`
- `GET /api/feed`
- `POST /api/feed`
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments`
- `GET /api/messages`
- `POST /api/messages`
- `GET /api/clinical-records`
- `POST /api/clinical-records`
- `GET /api/doctor/services`
- `POST /api/doctor/services`
- `PATCH /api/doctor/services`
- `DELETE /api/doctor/services`
- `POST /api/doctor/photos`
- `DELETE /api/doctor/photos`
- `GET /media/[assetId]`

## Almacenamiento de archivos

- Los CV y las fotos se guardan directamente en MySQL/MariaDB dentro de `file_assets`.
- El binario se almacena como `LONGBLOB`, junto con nombre original, MIME, hash SHA-256 y tamano.
- Los archivos publicos se sirven desde `GET /media/[assetId]`.
- Si vienes de una version anterior que guardaba rutas en disco, ejecuta `npm run db:backfill-assets` para migrar esos archivos al blob en base de datos.

## Flujo manual recomendado

1. Registra un paciente en `/registro`.
2. Verifica que redirige a `/paciente`.
3. Actualiza sus datos y comprueba `GET /api/me`.
4. Registra un doctor en `/registro` con CV PDF.
5. Verifica que redirige a `/doctor`.
6. Crea, edita y elimina servicios desde el dashboard del doctor.
7. Sube y elimina fotos del perfil del doctor.
8. Revisa `/buscar`, `/resultados` y `/doctores/[slug]`.
9. Desactiva una cuenta y confirma que deja de verse en el catalogo.

## Notas de alcance

- No hay panel admin en esta fase.
- La V2 ya incluye persistencia para feed, agenda, mensajes e historial clinico.
- La UI publica usa el lenguaje del producto, pero internamente los permisos trabajan con solo 2 roles reales: `paciente` y `doctor`.
