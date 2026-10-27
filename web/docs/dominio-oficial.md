# Dominio oficial de La Factory Hub

La única dirección que se debe compartir o instalar es:

https://hub.lafactorycoworking.com

## Cambios preparados

- Comunicados, invitaciones, bienvenidas, enlaces copiados, avisos de paquetes
  y recuperación de contraseña usan el dominio oficial.
- El antiguo alias `web-six-liart-89.vercel.app` redirige permanentemente al
  dominio oficial, conservando rutas y parámetros. Esto también sirve para
  los botones de correos enviados antes de la corrección.
- La redirección solo afecta a ese alias; los despliegues de prueba siguen
  disponibles en sus propias direcciones.

Estos cambios solo entran en vigor cuando se publica esta versión en
producción. No basta con redesplegar la versión anterior.

## Antes de publicar: comprobar Supabase

En el proyecto de producción, abrir **Authentication → URL Configuration**:

1. **Site URL:** `https://hub.lafactorycoworking.com`.
2. Incluir estas direcciones en **Redirect URLs**:
   - `https://hub.lafactorycoworking.com/auth/callback`
   - `https://hub.lafactorycoworking.com/onboarding`
3. Conservar de momento las direcciones antiguas permitidas para no
   invalidar correos de acceso que todavía estén vigentes.

El archivo `supabase/config.toml` es de desarrollo local; editarlo no
confirma ni actualiza por sí solo estos ajustes del proyecto alojado.
La configuración de producción debe comprobarse en Supabase.

## Publicar y verificar

1. Publicar los cambios en el proyecto de Vercel `web`, en producción.
2. Mantener tanto el alias antiguo como `hub.lafactorycoworking.com`
   asociados al proyecto. No eliminar el alias del que dependen los correos.
3. En una ventana privada, pulsar el botón del correo original. La barra de
   direcciones debe terminar en `hub.lafactorycoworking.com` y mostrar el
   acceso habitual.
4. Comprobar que una ruta del alias antiguo conserva sus parámetros, por
   ejemplo `/login?source=comunicado`.
5. Iniciar sesión con una cuenta de prueba y confirmar que aparecen las
   reservas existentes. Probar también recuperación de contraseña y una
   invitación válida de prueba. No utilizar el token de otra persona.
6. Enviar un comunicado de prueba solo a una persona elegida expresamente
   y comprobar que «Abrir la app» lleva al dominio oficial.

## Qué explicar a Mireia y a la comunidad

Mireia debe actualizar sus favoritos y entrar siempre por el dominio
oficial. No hace falta reenviar el comunicado original: después de publicar,
su botón antiguo redirigirá al dominio correcto.

Texto opcional para compartir manualmente:

> La dirección oficial de la app es https://hub.lafactorycoworking.com.
> El enlace anterior lleva a la misma app y os redirigirá a esta dirección.
> Si os pide iniciar sesión de nuevo, utilizad vuestra cuenta habitual;
> vuestras reservas se mantienen. Si añadisteis la app al móvil desde el
> enlace anterior, volved a añadirla desde esta dirección y activad las
> notificaciones si queréis recibir avisos.

Compartir este texto después de comprobar la redirección en producción.
Las sesiones y permisos del navegador dependen del dominio: no se pueden
traspasar automáticamente. Quien instaló la app desde Vercel debería
volver a añadirla desde el dominio oficial, activar las notificaciones y
comprobar que recibe avisos antes de quitar el acceso antiguo.

## Referencias

- https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting
- https://supabase.com/docs/guides/auth/redirect-urls
