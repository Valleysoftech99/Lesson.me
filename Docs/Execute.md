# Guía de implementación del portal

La aplicación MVP ya está implementada en la raíz del repositorio. Para extenderla, usa las specs como contrato antes de modificar el motor:

- [Spec funcional](../Spec/01-MVP.md)
- [Spec técnica y contrato de datos](../Spec/02-Tecnica-y-datos.md)
- [Guía para agregar materias](../README.md)

## Reglas de extensión

1. Para agregar una materia, sigue [la spec de módulos y asistente](../Spec/04-Modulos-y-asistente-de-clases.md): crea su configuración/registro y un tema CSS inspirado en su contexto. No enumeres carpetas en tiempo de ejecución.
2. Aplica temas de materia solamente al contenedor del módulo; no reemplaces el tema global azul-negro.
3. Las clases importadas desde el asistente de la app se almacenan localmente en IndexedDB; nunca se presentan como publicadas o sincronizadas con el repositorio.
4. Si el usuario pide incorporar una clase local al proyecto, agrega el archivo Markdown al módulo y actualiza su `config.json`, preservando el contenido recibido.
5. Mantén HTML semántico, JavaScript vanilla y CSS nativo, sin introducir frameworks ni backend.
6. Mantén las dependencias Markdown locales y sanitiza el HTML generado antes de insertarlo en el documento.
7. Conserva rutas relativas compatibles con GitHub Pages bajo una subruta.
8. Si cambias recursos del shell/offline, actualiza la lista del service worker y su versión de caché.
9. Valida responsive, navegación por teclado, estados de error y lectura offline.
