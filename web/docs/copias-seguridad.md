# Copias semanales de La Factory

Destino previsto: Google Drive de La Factory, carpeta `Backups La Factory/Supabase`.
Ejecución: GitHub Actions, lunes a las 07:23, zona `Europe/Madrid`, y botón manual en Actions.
El Mac no necesita estar encendido. El horario es orientativo: GitHub puede retrasar una ejecución.

## Estado de la activación

El workflow y el exportador están preparados. No considerar las copias automáticas activas
hasta publicar el workflow, configurar los secretos, ejecutar una primera copia desde Actions
y comprobar el archivo en el Drive de La Factory. La programación queda desactivada hasta
establecer la variable de Actions `BACKUP_ENABLED=true` después de esa primera prueba.
Conectar Drive a un chat no autoriza por sí
solo al proceso independiente de GitHub Actions.

En la preparación del 3 de noviembre de 2026 se creó el proyecto Google Cloud y el cliente
OAuth de escritorio, pero no se concedió acceso a Drive. Google mantiene desactivado
«Publicar app» hasta completar la información de marca. Antes de autorizar el proceso
permanente, completar las páginas públicas de descripción, privacidad y condiciones con
información fiel a esta integración y revisar el estado de publicación. No activar copias
semanales con una autorización de prueba que pueda caducar a los siete días.

## Contenido

- `roles.sql`: roles, sin sus contraseñas de conexión.
- `schema.sql`: estructura de la aplicación, funciones y políticas exportadas por Supabase CLI.
- `data.sql`: registros de la app y de autenticación, incluidos los datos de las cuentas de acceso.
- `storage/` y `storage-manifest.json`: archivos originales de Storage, configuración de buckets,
  rutas originales, tamaños y hashes. El nombre local es un hash para evitar rutas inseguras.
- `migrations/`: migraciones del repositorio, incluidas personalizaciones sobre Auth y Storage.
- `metadata.json` y `checksums.json`: información de la copia y hashes SHA-256 de sus archivos.

La copia se comprime y cifra con GnuPG/AES-256 antes de salir hacia Drive. Solo se suben
el `.tar.gz.gpg` y su `.sha256`; no se publican datos ni artefactos de backup en GitHub.
No se borran copias antiguas automáticamente.

Cada ejecución descifra la copia temporalmente y verifica todos sus hashes antes de subirla.
Después comprueba la copia subida con `rclone check`. Estas verificaciones de integridad no
sustituyen una restauración completa de prueba en un proyecto aislado.

El dump de datos usa una instantánea de Postgres. Los archivos de Storage se descargan aparte:
si el inventario cambia durante su descarga, falla la ejecución para que se reintente.
No hay una instantánea atómica conjunta de base de datos y archivos.

## Autorización inicial de Drive

Una persona con acceso al Google Drive de La Factory debe autorizarlo una vez. No enviar
contraseñas, tokens ni la clave de recuperación por email o chat.

1. Instalar `rclone` desde su distribución oficial.
2. Crear un cliente OAuth propio de Google Drive según la documentación de rclone. No depender
   del cliente compartido de rclone, en retirada. Usar una app interna de Workspace o configurar
   su consentimiento correctamente para uso continuo: el modo externo «Testing» puede caducar
   la autorización en siete días, justo antes de la siguiente copia semanal.
3. Ejecutar `rclone config` y crear un remoto llamado exactamente `factory`, de tipo `drive`.
   Usar el cliente OAuth propio y el alcance `drive.file`: permite acceder a archivos y carpetas
   creados por esta integración, sin abrir el resto del Drive. Autorizar con la cuenta de La Factory.
   Si es una unidad compartida de Workspace, seleccionarla en la configuración.
4. Guardar la configuración resultante como secreto `BACKUP_RCLONE_CONFIG` del repositorio.
   GitHub usará su propia autorización; el plugin de Drive del chat no la sustituye.
5. La carpeta `Backups La Factory/Supabase` se creará en la primera subida con esa autorización.

## Secretos de GitHub Actions

En `Automatizza-es/la-factory-webapp` → Settings → Secrets and variables → Actions:

| Nombre | Contenido |
| --- | --- |
| `BACKUP_SUPABASE_ACCESS_TOKEN` | Token de Supabase limitado al proyecto de La Factory, con los permisos que requiere `db dump` |
| `BACKUP_SUPABASE_PROJECT_REF` | Identificador del proyecto Supabase |
| `BACKUP_SUPABASE_URL` | URL del proyecto Supabase |
| `BACKUP_SUPABASE_SERVICE_ROLE_KEY` | Clave del servidor para leer los archivos privados de Storage |
| `BACKUP_ENCRYPTION_PASSPHRASE` | Clave aleatoria de recuperación de al menos 32 caracteres |
| `BACKUP_RCLONE_CONFIG` | Configuración del remoto `factory` autorizado en La Factory |

Guardar también la clave de recuperación en el gestor de contraseñas de La Factory, fuera de
GitHub y de las copias cifradas. Perder esa clave impide recuperar los archivos.
La prueba local usa una clave privada en `.backups/recovery-key.txt`, que nunca se versiona.
Antes de usar esa misma clave en la nube, conservarla en el gestor de contraseñas de La Factory.

Supabase permite crear tokens limitados a un proyecto desde Account → Access Tokens. Preferir
uno específico para estas copias frente al token de acceso completo que crea `supabase login`.
El CLI crea un rol de conexión temporal para exportar: además de lectura de configuración,
necesita el permiso Database que permite crear ese rol. Comprobar los permisos con la primera
ejecución manual antes de activar la programación.

Publicar los archivos del workflow y ejecutar **Actions → Supabase weekly backup to La Factory Drive →
Run workflow**. Comprobar su finalización y que aparecen dos archivos en la carpeta fechada de Drive.
Solo después, crear la variable de Actions `BACKUP_ENABLED` con valor `true` para activar los lunes.
Configurar las notificaciones propias de GitHub para recibir fallos de Actions. En repositorios
públicos, comprobar también que GitHub no deshabilite la programación por inactividad del repositorio.

## Ejecución manual local

Con `supabase login`, las variables locales existentes y la clave de recuperación en el entorno:

```sh
python3 web/scripts/backup_supabase.py --native-pg-bin /opt/homebrew/opt/libpq/bin
```

No pegar la clave en el historial de la terminal. Cargarla desde el gestor de contraseñas o desde
el archivo local privado. Sin `--native-pg-bin`, Supabase CLI utiliza Docker.
Las copias y las credenciales temporales quedan fuera de Git mediante `.gitignore`.

## Recuperación

1. Descargar el `.tar.gz.gpg` y su `.sha256` de Drive. Verificar `shasum -a 256 -c archivo.sha256`.
2. Descifrar con `gpg --output copia.tar.gz --decrypt archivo.tar.gz.gpg`, introduciendo la clave
   cuando la solicite GnuPG. Abrir en una carpeta privada de un entorno de recuperación.
3. Crear un proyecto Supabase aislado de prueba y seguir la guía oficial para restaurar roles,
   esquema y datos. Revisar primero migraciones, extensiones y personalizaciones de Auth/Storage.
4. Recuperar los archivos usando `storage-manifest.json`: cada entrada relaciona el archivo local
   con el bucket y la ruta originales. Verificar los hashes tras recuperar.
5. Comprobar accesos, usuarios, reservas, tarifas, horas y fotos antes de conectar la app al destino.

No restaurar sobre producción sin una revisión específica. Las contraseñas de roles Postgres,
los secretos de Vercel, las credenciales de proveedores y la configuración externa de Auth/SMTP
no se recuperan automáticamente con este archivo; deben conservarse por separado.

Referencias:
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore
- https://supabase.com/docs/guides/platform/personal-access-tokens
- https://rclone.org/drive/
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
