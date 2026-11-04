import type { Metadata } from "next";

export const metadata: Metadata = { title: "Condiciones de las copias" };

export default function BackupTermsPage() {
  return (
    <>
      <h1>Condiciones de uso interno</h1>
      <h2>Finalidad y personas autorizadas</h2>
      <p>La Factory Backups es una integración de uso interno de La Factory Coworking para conservar copias de su aplicación. La conexión a Google Drive debe realizarla una persona autorizada para administrar esa cuenta y los datos incluidos en las copias.</p>
      <h2>Qué permite la autorización</h2>
      <p>La conexión permite a la integración gestionar los archivos de Drive creados o abiertos con ella. La automatización prevista añade copias cifradas y verifica sus archivos. No ofrece un registro público, un servicio de almacenamiento para terceros ni acceso a las copias desde estas páginas informativas.</p>
      <h2>Custodia y recuperación</h2>
      <p>La administración debe conservar la clave de recuperación fuera de las propias copias, controlar quién puede acceder a ella y revisar los permisos de la carpeta de Drive. Sin esa clave no se podrá descifrar el contenido.</p>
      <p>Las comprobaciones de integridad detectan determinados errores en los archivos. No sustituyen una prueba completa de restauración. La recuperación debe planificarse y probarse en un entorno separado antes de modificar los datos de la aplicación en uso.</p>
      <h2>Disponibilidad y límites</h2>
      <p>La programación es semanal y depende de GitHub Actions, Supabase y Google Drive, sus cuotas y la vigencia de las autorizaciones. Puede haber retrasos o ejecuciones fallidas. Una copia semanal puede dejar sin recuperar los cambios posteriores a la última copia correcta.</p>
      <p>La exportación de la base de datos y la descarga de archivos se realizan por separado; no constituyen una instantánea conjunta de ambos sistemas. La copia tampoco sustituye la conservación de la configuración externa, los secretos ni el código necesario para reconstruir el servicio.</p>
      <h2>Detener la integración</h2>
      <p>La administración puede desactivar la programación y revocar la conexión desde la cuenta de Google. Las copias que ya existan seguirán en Drive hasta que una persona autorizada las elimine.</p>
      <p>Contacto para esta herramienta: <a href="mailto:coworkingtbf@gmail.com">coworkingtbf@gmail.com</a>.</p>
    </>
  );
}
