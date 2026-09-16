# Newsletters y HTML — La Factory

## Diseño aprobado

Usar un único documento HTML completo, preferentemente de 600 px de ancho máximo, con tablas de presentación y CSS inline para compatibilidad. Fondo claro, logo compacto, título marrón sobre blanco o crema y espacios generosos. Evitar logo marrón grande seguido de otra pastilla marrón. Pie claro con claim discreto. Arial/Helvetica como fallback. Usar `assets/` y la especificación de marca para colores y proporciones.

## Idiomas

La solución elegida por la usuaria es sencilla: un correo con catalán, español e inglés completos, en ese orden. Arriba hay enlaces CAT, ES y EN que apuntan a `#ca`, `#es` y `#en`. Los destinos llevan identificadores únicos. Puede incluirse «volver arriba» en cada sección. No ocultar contenido con JavaScript, no crear páginas externas ni cambiar el sistema por iniciativa propia.

Los saltos internos no son compatibles con todos los clientes. No prometas que funcionan en Gmail, Outlook o móvil. Los tres idiomas deben quedar accesibles mediante desplazamiento aunque los enlaces fallen. Realizar una prueba real en los clientes que use la marca. Si el usuario quiere un selector que muestre solamente un idioma, explicar la limitación y pedir autorización antes de cambiar de solución.

## Mailrelay

La plataforma elegida es Mailrelay. Entregar un HTML importable, no código para pegar como texto en Gmail. Consultar la documentación de Mailrelay o el panel actual para obtener las variables exactas de baja y versión web. No trasladar etiquetas de Mailchimp ni asumir que un marcador usado en una campaña anterior es válido en esta cuenta. Un borrador puede incluir `[[UNSUBSCRIBE_URL_MAILRELAY]]` y `[[WEB_VERSION_URL]]`, pero deben resolverse y comprobarse antes de enviar. Mantener el texto legal aprobado por la responsable; no inventarlo ni sustituirlo por un aviso genérico presentado como definitivo. Incluir las obligaciones de identificación y baja que correspondan a la campaña y la plataforma.

No copiar literalmente HTML antiguo con etiquetas de documento duplicadas. El resultado debe tener un único `<!DOCTYPE html>`, `<html>`, `<head>` y `<body>`, HTML válido y atributos `lang` en las secciones. Para Mailchimp, si se solicita expresamente, adaptar las variables verificadas y considerar su recomendación de `<base href=" ">` al importar anclas; no usar esa solución como garantía universal.

## Imágenes y enlaces

La URL pública de referencia del logo cuadrado es:
`https://lafactorycoworking.com/wp-content/uploads/2024/09/IG_LOGO.jpg`

Verificar que sigue accesible antes de usarla. Para email enviado, preferir un archivo alojado en el gestor de Mailrelay o una URL HTTPS pública verificada. No usar `file://`, rutas locales, archivos sandbox, `cid:` sin adjunto real, imágenes base64 como única solución ni marcadores `{{LOGO_URL}}` sin resolver. Mantener el JPEG original, su fondo y su proporción. No confundir la vista previa local con el envío definitivo.

No inventar enlaces de reserva, formularios, redes sociales ni páginas de preferencias. Si se requiere una URL que falta, solicitarla o dejar un marcador explícito de borrador.

## Flujo y control de calidad

Identificar el objetivo y el público. Conservar los textos proporcionados y traducir solo lo necesario. Comprobar fecha y día de semana si corresponde, horarios, tarifas, condiciones de acceso y firma. Preparar el HTML y, si las herramientas lo permiten, una vista previa local. Revisar móvil y escritorio, enlaces, logo, textos alternativos y contraste. Indicar qué datos están pendientes y entregar el archivo sin afirmar que se ha enviado. La prueba real de email y la aprobación de contenido son previas al envío general.

Los ejemplos de 2026 son muestras históricas de diseño y tono; nunca arrastrar sus fechas ni promesas a una campaña nueva.
