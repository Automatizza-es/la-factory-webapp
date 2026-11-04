import Link from "next/link";

export default function BackupInformationPage() {
  return (
    <>
      <h1>La Factory Backups</h1>
      <p>Herramienta interna para conservar copias de seguridad de los datos de la aplicación de La Factory Coworking en su Google Drive.</p>
      <h2>Cómo funciona</h2>
      <p>Una ejecución programada en GitHub Actions exporta la base de datos y los archivos de Supabase. Cifra la copia antes de subirla a la carpeta de copias del Drive autorizado por La Factory y comprueba su integridad.</p>
      <p>El horario previsto es cada lunes a las 07:23, hora de Madrid. La ejecución depende de la disponibilidad de los servicios y puede retrasarse o fallar.</p>
      <h2>Acceso limitado a Drive</h2>
      <p>La integración solicita el permiso de Google Drive para archivos creados o abiertos con esta aplicación (<code>drive.file</code>). La configuración prevista solo utiliza los archivos y las carpetas que crea para las copias de seguridad.</p>
      <p>El permiso permite gestionar esos archivos, incluida su modificación o eliminación. El proceso programado está configurado para añadir copias y comprobarlas; no borra copias antiguas automáticamente.</p>
      <h2>Uso por administración</h2>
      <p>La autorización corresponde a la cuenta de Google de La Factory. Los miembros de la comunidad no necesitan conectar sus cuentas de Google ni registrarse en esta herramienta.</p>
      <p>Consulta la <Link href="/copias/privacidad">información de privacidad</Link> y las <Link href="/copias/condiciones">condiciones de uso interno</Link> antes de autorizar la integración.</p>
    </>
  );
}
