# Especificación técnica y contrato de datos — Lesson.me MVP

## 1. Arquitectura

Aplicación estática de una sola página, publicada en GitHub Pages:

- `index.html`: shell semántico y puntos de montaje de la interfaz.
- `assets/css/core.css`: estructura, componentes y responsive.
- `assets/css/themes.css`: variables y temas por materia.
- `assets/js/app.js`: catálogo, navegación, carga de configuraciones/lecciones y estados de interfaz.
- `assets/js/vendor/marked.js`: parser Markdown local.
- `assets/js/vendor/purify.min.js`: sanitizador local del HTML producido por el parser.
- `manifest.json`: metadatos de instalación PWA.
- `sw.js`: caché del shell y de recursos visitados.
- `estudios/index.json`: catálogo central de materias.
- `estudios/<id>/config.json`: configuración y lista explícita de lecciones de una materia.
- `estudios/<id>/lecciones/*.md`: lecciones en texto plano.
- IndexedDB del navegador: almacenamiento local de clases importadas mediante el asistente; no reemplaza los archivos fuente del repositorio.

No se introducen servidor, proceso de compilación o framework para el MVP. `package.json` y `package-lock.json` fijan las versiones de las dependencias vendorizadas; `node_modules/` no forma parte del despliegue ni es necesario para ejecutar la aplicación.

## 2. Catálogo central

Ruta: `estudios/index.json`.

Esquema inicial:

```json
{
  "schemaVersion": 1,
  "studies": [
    {
      "id": "latin",
      "title": "Latín",
      "description": "Descripción opcional",
      "icon": "Aa",
      "config": "estudios/latin/config.json"
    }
  ]
}
```

Reglas:

- `schemaVersion` es entero obligatorio y permite evolucionar el formato explícitamente.
- `studies` es un arreglo obligatorio; vacío significa que todavía no se registraron materias.
- `id` es obligatorio, único y estable; usar minúsculas ASCII, números y guiones.
- `title` es obligatorio y no vacío.
- `description` e `icon` son opcionales; si se omiten, la interfaz conserva una presentación válida sin ellos.
- `config` es una ruta relativa desde la raíz publicada de la aplicación a la configuración del estudio.
- La app valida datos consumidos y presenta errores claros. Un formato inválido no se interpreta como una lista vacía.
- No se permite cargar configuraciones desde otro origen.

## 3. Configuración de materia

Ejemplo de `estudios/latin/config.json`:

```json
{
  "schemaVersion": 1,
  "id": "latin",
  "title": "Latín",
  "theme": "latin",
  "lessons": [
    {
      "id": "clase-01",
      "title": "Título de la lección",
      "path": "estudios/latin/lecciones/clase-01.md"
    }
  ]
}
```

Reglas:

- `schemaVersion`, `id`, `title`, `theme` y `lessons` son obligatorios.
- `id` debe coincidir con el del catálogo.
- `theme` identifica una clase CSS de un tema registrado. El agente de código puede incorporar un tema nuevo inspirado en la materia, usando una clase con identificador validado y variables CSS propias. Los temas iniciales incluyen `latin`, `hacker` y `default`.
- `lessons` es un arreglo explícito; vacío representa una materia sin lecciones.
- Cada lección tiene `id` único dentro de la materia, `title` no vacío y `path` relativo al despliegue.
- `path` debe permanecer dentro de la raíz de la aplicación y del área de contenido esperada; rechazar esquemas externos y rutas que intenten salir de la raíz.
- Las rutas de configuración/lecciones se resuelven desde una base de despliegue común, no concatenando supuestos sobre `/`, para funcionar en GitHub Pages de usuario y de proyecto.

## 4. Navegación y URL

- La vista actual debe ser representable en la URL para permitir recarga y compartir enlaces.
- Usar fragmentos (`#`) para el estado de navegación del SPA, evitando depender de reglas de reescritura del servidor estático.
- Definir una forma estable equivalente a inicio, estudio y lección, basada en los `id` del catálogo/configuración.
- Al iniciar, validar el fragmento contra el catálogo cargado; si no es válido, mostrar inicio y comunicar el estado de forma coherente, sin romper el resto de la app.
- Botones/enlaces de navegación deben respetar atrás/adelante del navegador.
- Los recursos estáticos y archivos JSON/Markdown usan rutas relativas a la base del despliegue para funcionar bajo subrutas de GitHub Pages.

## 5. Renderizado Markdown

- Cargar el parser desde el repositorio, no desde CDN, para permitir el funcionamiento offline.
- Convertir Markdown con Marked y sanear la salida con DOMPurify antes de insertarla, de forma que el contenido no ejecute scripts, manejadores de eventos ni URLs peligrosas.
- No insertar datos de catálogo/configuración como HTML sin escapado.
- Mantener las versiones de Marked y DOMPurify fijadas en el manifiesto npm y conservar los avisos de licencia junto a las copias locales.
- Aplicar estilos a elementos semánticos: encabezados, enlaces, listas, tablas, citas, imágenes y bloques de código.
- Las tablas deben envolverse o tratarse de forma responsive para no desbordar la vista.
- Además de tablas GFM con `|`, se interpretan bloques consecutivos de filas separadas por tabulaciones como tablas, usando la primera fila como encabezado. No se depende de HTML arbitrario en las lecciones.
- Una línea de sección aislada con el formato `N. Título` se interpreta como encabezado de sección; las listas numeradas consecutivas siguen siendo listas.

## 6. Temas y estilos

- El tema global base se aplica a `:root`/`body`, en todas las rutas. Usar fondo azul-negro profundo (`#050a16`), superficies elevadas azul marino, texto de alto contraste, azul como acento primario y oro (`#d4af37`) como acento secundario para detalles, bordes y estados destacados.
- Al entrar a una materia, ocultar la cabecera y el pie globales y aplicar el tema de esa materia a toda la ventana, tanto al elegir/agregar clases como al leerlas.
- En lectura, mantener una sidebar visible en escritorio para cambiar de clase rápidamente; en móvil, permitir abrirla y cerrarla con el control accesible de navegación.
- El selector de materias pertenece al tema base y debe conservarlo aunque se navegue a un estudio y se vuelva al inicio.
- Definir colores, superficies, tipografía y acentos como variables CSS.
- Tema Latín: carbón `#1a1a1d`, marfil/pergamino `#f5f5dc`, borgoña `#800020` y oro sutil `#d4af37`; encabezados serif y cuerpo legible.
- Tema Programación: fondo `#0a0a0c`, acentos verde `#00ff66` o cian `#00f0ff`, tipografía monoespaciada.
- Respetar legibilidad, foco visible, contraste y preferencias de movimiento reducido.
- La estructura del lector permanece compartida; solo cambia la presentación del tema.
- Al crear una materia nueva, el agente debe revisar el contexto de la materia y las specs, crear/actualizar el tema visual dedicado dentro de `assets/css/themes.css`, registrar la materia en el catálogo, crear su configuración y comprobar que el tema se aplica solo al contenedor de esa materia. No debe retematizar el shell global.

## 6.1 Importación de clases en navegador

- La acción **Agregar clase** aparece dentro de una materia ya registrada.
- Usar un selector de archivos nativo limitado a `.md`/`text/markdown`; no solicitar acceso amplio al sistema de archivos.
- Leer el archivo con la API de archivos del navegador y conservar el texto Markdown original.
- Sugerir título desde el primer encabezado Markdown; si falta, usar el nombre base del archivo. Permitir editar el título antes de confirmar.
- Renderizar una vista previa usando Marked y DOMPurify antes de agregar la clase.
- Mantener almacenamiento separado del catálogo fuente del repositorio: guardar contenido original y metadatos mínimos (id local único, studyId, título, nombre de archivo y fecha de importación) en IndexedDB.
- Añadir clases importadas a la lista local de la materia y permitir navegación/renderizado con las mismas reglas de seguridad que las clases del repositorio.
- Las clases locales deben sobrevivir recargas y estar disponibles offline en ese perfil/navegador.
- Al estar en IndexedDB, las clases importadas localmente están disponibles offline sin depender de que el Service Worker haya visitado antes un archivo fuente en red.
- Los IDs locales deben tener espacio de nombres propio y no colisionar con IDs definidos en `config.json`.
- Proporcionar una acción para descargar/exportar el Markdown original. Sanear el nombre sugerido de archivo y conservar la extensión `.md`.
- Informar claramente que el contenido de IndexedDB solo existe en el navegador actual; la app estática no puede escribir archivos, cambiar `config.json`, publicar ni sincronizar con GitHub.
- Para publicación permanente, el usuario debe pedir al agente de código que cree/actualice el archivo `.md` en el repositorio y lo registre en la configuración del módulo. No guardar tokens de GitHub ni implementar una integración de escritura.
- Manejar errores de lectura, tipo de archivo y almacenamiento con mensajes recuperables; no reemplazar silenciosamente el catálogo o contenido del repositorio.

## 7. Service worker y offline

- Registrar el service worker solo en contextos seguros compatibles (HTTPS o localhost).
- Usar rutas relativas a la base publicada; no asumir que el sitio está en la raíz del dominio.
- Cachear el shell y los recursos esenciales versionados de la app para que la interfaz pueda abrir offline tras la primera visita online.
- Cachear una lección Markdown al solicitarla correctamente; no guardar respuestas fallidas como si fueran contenido.
- Estrategia: recursos del shell servidos desde caché/versionados con actualización controlada; para lecciones, intentar red y usar una copia cacheada si la red falla.
- Las lecciones de archivos fuente no visitadas no se prometen disponibles offline; las importaciones locales confirmadas en IndexedDB sí quedan disponibles offline en el navegador actual.
- Versionar el nombre de caché y limpiar las cachés antiguas propias durante la activación, sin borrar datos ajenos al sitio.
- Si una lección no existe en red ni en caché, comunicar que no está disponible offline.

## 8. Estados y errores

La interfaz debe distinguir al menos:

- Cargando catálogo, configuración o lección.
- Catálogo válido sin estudios.
- Estudio válido sin lecciones.
- Datos JSON inválidos o incompatibles con `schemaVersion`.
- Estudio/lección no declarados o archivo no encontrado.
- Error de red con copia cacheada disponible.
- Error de red sin copia offline disponible.

Los mensajes deben explicar el problema en lenguaje claro y ofrecer una acción útil cuando sea posible (reintentar, volver al inicio o elegir otra lección). No convertir errores en arreglos vacíos ni ocultarlos en consola como única notificación.

## 9. Accesibilidad y responsive

- Usar landmarks HTML, jerarquía correcta de encabezados, botones y enlaces nativos.
- Controles de navegación alcanzables por teclado y con foco visible.
- El menú móvil comunica su estado a tecnologías de asistencia.
- No usar solo color para comunicar selección, tema o estado de error.
- Verificar anchuras móviles y escritorio; el lector debe conservar ancho de línea cómodo y permitir desplazamiento contenido de tablas/bloques anchos.

## 10. Procedimiento para agregar contenido

1. Crear una carpeta `estudios/<id>/`.
2. Crear `config.json` con el esquema y el `id` correspondiente.
3. Crear las lecciones `.md` declaradas, bajo `lecciones/`.
4. Agregar una entrada al arreglo `studies` en `estudios/index.json`.
5. Crear o actualizar el tema CSS dedicado a la materia en `assets/css/themes.css`, manteniendo el tema base en cabecera/shell.
6. Probar localmente con servidor HTTP estático; `fetch()` y service workers no se validan de forma fiable abriendo el HTML como `file://`.
7. Publicar los archivos mediante GitHub Pages.

La creación de materias/temas es una tarea solicitada al agente de código. La incorporación cotidiana de clases se realiza desde el asistente de la app; el agente solo interviene si el usuario desea hacer permanente una clase importada en el repositorio.

Este procedimiento no debe requerir editar `index.html` ni el motor JavaScript.

## 11. Verificación técnica mínima

- Validar que el catálogo y las configuraciones de ejemplo estructural (sin lecciones de muestra) cumplen el esquema y permiten listas vacías.
- Probar catálogo vacío, una materia y errores de JSON/rutas.
- Probar URL de inicio, materia y lección con recarga y navegación atrás/adelante.
- Probar el despliegue bajo una subruta simulada o equivalente a GitHub Pages de proyecto.
- Probar Markdown común, tabla ancha, comparación en móvil y salida segura de HTML no confiable.
- En una sesión de navegador: abrir online, visitar una lección, desconectar y comprobar shell y lección visitada; comprobar mensaje para una lección no visitada.
- Importar un `.md`, comprobar sugerencia/edición de título, vista previa saneada, inclusión en la lista, apertura, persistencia tras recarga, lectura offline y exportación original.
- Confirmar que los datos locales no alteran `estudios/index.json` ni `config.json`, y que la interfaz explica sus límites de sincronización/publicación.
- Comprobar instalación PWA en un navegador compatible y que la app siga siendo utilizable si la instalación no está disponible.
