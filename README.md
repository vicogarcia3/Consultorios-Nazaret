# Consultorios Nazaret — nueva web (versión inicial)

Proyecto independiente de la web existente. No modifica consultoriosnazaret.com.

## Ejecutar

1. Instalar Node.js (20.9 o superior).
2. Abrir esta carpeta en VS Code.
3. Abrir terminal y ejecutar `npm install`.
4. Ejecutar `npm run dev`.
5. Abrir http://localhost:3000.

## Editar contenido provisional

`lib/site-data.ts` contiene los textos, servicios, equipo, obras sociales, logo, foto y contacto. Para cargar imágenes provisionales, copiar archivos en `public/` y usar rutas como `/consultorio.jpg`.

- `heroImageUrl: '/consultorio.jpg'`
- `logoUrl: '/logo.png'`
- `whatsapp: '5493511234567'` (número de ejemplo; reemplazar por el real)

## Próximas etapas

- Definir base de datos y panel administrador.
- Sustituir `getClinicContent()` por la lectura de datos publicados.
- Implementar autenticación con roles y seguridad.
- Implementar reservas y su flujo de administración.
- Validación, pruebas y migración en un despliegue separado antes de reemplazar la web actual.

**Nota:** Iniciar sesión y Reservar turno muestran páginas temporales (no son formularios funcionales). Los tratamientos listados son ejemplos y deben verificarse. No se publican números ni datos de contacto ficticios.
