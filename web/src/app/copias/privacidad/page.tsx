import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad de las copias" };

export default function BackupPrivacyPage() {
  return (
    <>
      <h1>Privacidad de las copias de seguridad</h1>
      <p>Esta información describe únicamente la integración interna La Factory Backups, gestionada por La Factory Coworking. No sustituye la información de privacidad de la aplicación de coworking.</p>
      <h2>Qué datos utiliza</h2>
      <p>Las copias pueden contener los datos guardados en la aplicación: perfiles y datos de contacto, tarifas e historiales, reservas, incidencias, paquetería, comunicaciones, cuentas de acceso y archivos almacenados en Supabase. Su contenido se cifra antes de enviarse a Google Drive.</p>
      <p>Para conectarse a Drive se utiliza una autorización de Google y la información necesaria para identificar, subir y verificar los archivos de las copias, como nombres, tamaños e identificadores. La herramienta no solicita acceso a Gmail, Calendar ni al conjunto del Drive de la cuenta.</p>
      <h2>Para qué se utilizan</h2>
      <p>La finalidad es conservar copias y facilitar la recuperación de la aplicación ante pérdida o corrupción de datos. El proceso no utiliza los datos de Google para publicidad, venta de información ni entrenamiento de modelos de inteligencia artificial.</p>
      <h2>Dónde se procesan y guardan</h2>
      <ul>
        <li>Supabase mantiene los datos de origen.</li>
        <li>GitHub Actions procesa temporalmente la exportación, el cifrado y las comprobaciones.</li>
        <li>Google Drive conserva los archivos cifrados en la cuenta autorizada de La Factory.</li>
      </ul>
      <p>Las credenciales necesarias se guardan como secretos de la automatización. Las copias no se publican como archivos ni como artefactos descargables en el repositorio de GitHub. La clave de recuperación debe conservarse también en un lugar seguro bajo control de La Factory.</p>
      <h2>Acceso y conservación</h2>
      <p>El acceso depende de los permisos que La Factory conceda sobre la cuenta y la carpeta de Drive, y del acceso a la clave de recuperación. La integración no cambia los permisos de compartición de Drive.</p>
      <p>El proceso no elimina copias antiguas automáticamente. La administración debe revisar su conservación y eliminarlas cuando dejen de ser necesarias. Cambiar o eliminar un dato en la aplicación no modifica las copias históricas que ya se hayan guardado.</p>
      <h2>Revocar el acceso o pedir ayuda</h2>
      <p>La persona titular de la cuenta puede revocar la autorización desde las conexiones con aplicaciones de terceros de su cuenta de Google. Esto detiene el acceso futuro de la integración, pero no elimina las copias existentes. La administración puede detener la programación y gestionar por separado las copias conservadas.</p>
      <p>Para consultas sobre los datos o las copias, escribe a <a href="mailto:coworkingtbf@gmail.com">coworkingtbf@gmail.com</a>.</p>
    </>
  );
}
