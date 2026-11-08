# Especificación funcional — Lesson.me MVP

## 1. Propósito

Definir la primera versión funcional de Lesson.me, un portal web estático para consultar lecciones organizadas por materias. La aplicación debe funcionar en GitHub Pages y adaptarse a escritorio y móvil. El agente de código crea cada materia/tema y la app ofrece un asistente para cargar clases Markdown en el navegador.

Esta especificación precede a la implementación. No incluye todavía contenidos reales de Latín, Programación u otras materias.

## 2. Decisiones confirmadas

- Nombre visible: **Lesson.me — Dont be Burro**.
- Idioma de la interfaz: español.
- El primer entregable contiene la estructura y los estados vacíos, no lecciones de demostración.
- Las materias futuras se solicitan al agente de código, que crea la carpeta/configuración, registra la materia y prepara un tema UI inspirado en ella, sin reemplazar el shell global.
- Las lecciones de una materia ya creada se agregan desde un asistente dentro de la app seleccionando un archivo Markdown. El asistente las conserva en ese navegador y permite exportarlas para incorporarlas permanentemente al repositorio.
- Se permite leer offline la aplicación y las lecciones que ya se hayan visitado.
- La arquitectura es estática: HTML semántico, CSS nativo y JavaScript vanilla; sin frameworks, backend, autenticación ni base de datos de servidor. IndexedDB se usa únicamente para las clases importadas localmente.
- El contenido de las lecciones se escribe en archivos Markdown planos.
- La interfaz base, antes de elegir una materia, usa un tema oscuro azul-negro, con azul principal y oro secundario.
- El tema base no se reemplaza al entrar en una materia: cada estudio aplica su propia identidad oscura solo al área de estudio/lector.

## 3. Alcance del MVP

### Incluido

- Inicio/selector de materias alimentado por un índice JSON central que el agente actualiza al crear una materia.
- Estado vacío claro cuando no hay materias registradas, indicando que se puede solicitar un módulo al agente de código.
- Vista de una materia con su lista de lecciones y lector Markdown.
- Navegación entre inicio, materia y lección mediante URL compartible y compatible con GitHub Pages.
- Temas visuales seleccionables por materia mediante clases CSS y variables.
- Tema base oscuro independiente de los temas de cada materia.
- Diseño responsive, con navegación de lecciones utilizable en pantallas pequeñas.
- Tablas y contenido comparativo en dos columnas.
- Indicadores y mensajes para carga, contenido no encontrado y errores de configuración/conexión.
- PWA instalable y caché offline del shell y de las lecciones visitadas.
- Asistente por materia para seleccionar, previsualizar y agregar una clase `.md`.
- Persistencia local en el navegador de las clases importadas y exportación del `.md` original.

### Fuera del alcance inicial

- Editor de lecciones en el navegador.
- Inicio de sesión, sincronización, backend o base de datos de servidor.
- Búsqueda, favoritos, progreso de estudio o edición de contenido.
- Carga automática de directorios por enumeración del servidor.
- Materias o lecciones de ejemplo.
- Escritura directa al repositorio desde la aplicación web.
- Sincronización de clases locales entre navegadores/dispositivos.

## 4. Estructura de experiencia

### 4.1 Inicio

- Presenta la marca **Lesson.me — Dont be Burro** y el propósito del portal.
- Usa fondo azul-negro muy oscuro, superficies oscuras diferenciadas, azul como color principal y oro como detalle/acento. Este aspecto se aplica en el inicio y selector de materias.
- Si existen materias válidas, muestra una tarjeta/enlace por materia con título y metadatos disponibles.
- Si el índice existe y contiene una lista vacía, muestra un estado vacío amable que indique que aún no hay materias y que se puede solicitar una al agente de código.
- Si no se puede cargar o interpretar el índice, muestra un error distinguible del estado vacío y ofrece una acción para reintentar.

### 4.2 Vista de materia

- Muestra el nombre de la materia y su tema visual.
- El tema de una materia se aplica dentro del contenido del estudio y no cambia la cabecera ni el aspecto base global.
- Presenta las lecciones declaradas en la configuración y las clases importadas localmente mediante el asistente.
- Seleccionar una lección la carga y la muestra en el lector sin recargar innecesariamente toda la aplicación.
- Si la materia no tiene lecciones, muestra un estado vacío propio de la materia.
- Incluye una forma visible de volver al inicio y de seleccionar otra lección.
- Incluye una acción accesible **Agregar clase** que abre el asistente de importación Markdown para esta materia.

### 4.2.1 Asistente para agregar una clase

1. El usuario abre el asistente desde una materia existente.
2. Selecciona un archivo `.md` mediante el selector de archivos del navegador.
3. La aplicación valida que sea un Markdown legible y muestra un título sugerido (desde el primer encabezado o, en su defecto, desde el nombre del archivo) que el usuario puede corregir.
4. Antes de importar, presenta una vista previa del Markdown renderizado con el mismo saneamiento del lector.
5. Al confirmar, agrega la clase al listado local de esa materia y permite abrirla en el lector inmediatamente.
6. La clase y los metadatos necesarios se guardan en IndexedDB de ese navegador para seguir disponibles tras recargar y sin conexión.
7. El asistente ofrece exportar el archivo Markdown con un nombre de archivo adecuado. Un aviso explica que la importación local no modifica GitHub Pages ni otros dispositivos.
8. Para publicar la clase permanentemente, el usuario solicita al agente de código que copie el Markdown al repositorio y lo registre en el `config.json` de la materia. La app no escribe al repositorio.

El asistente no debe requerir pegar el contenido en un editor propio; el archivo `.md` es la fuente de contenido.

### 4.3 Vista de lectura

- Renderiza títulos, párrafos, listas, enlaces, bloques de código, tablas y formato común de Markdown.
- Mantiene legibilidad en móvil y escritorio; tablas anchas y comparaciones no deben romper el ancho de la página.
- Las comparaciones lado a lado deben poder expresarse con una convención de contenido documentada al implementar el parser/estilos. En pantallas estrechas pueden apilarse verticalmente.
- Los enlaces externos deben identificarse como externos y no deben impedir la navegación interna.
- Un fallo al cargar una lección debe mostrar un mensaje y permitir volver a intentar o seleccionar otra.

### 4.4 Navegación móvil

- La lista de lecciones debe poder abrirse y cerrarse en móvil sin quedar fija ocupando el área principal.
- El control debe tener nombre accesible, estado expandido/contraído y funcionar con teclado.
- En escritorio, la lista puede permanecer visible como barra lateral.

## 5. Requisitos de contenido y operación

- Cada materia se identifica por un `id` estable, independiente de su título visible.
- El catálogo central enumera explícitamente cada materia; no se presupone que el alojamiento permita listar carpetas.
- Cada módulo del repositorio declara explícitamente las lecciones versionadas y sus rutas Markdown.
- Las rutas de recursos deben funcionar tanto en despliegue en la raíz como bajo una ruta de proyecto de GitHub Pages.
- El agente crea la materia, la configuración, el registro y el tema UI contextual. El usuario no debe crear esos archivos manualmente.
- Para cargar una clase de uso local no se requiere editar JSON; el asistente la conserva en el navegador actual.
- Para publicar permanentemente una clase importada, se solicita al agente que agregue/versione el `.md` y actualice la configuración del módulo.
- El README o guía de contenido debe explicar cómo solicitar un módulo al agente y cómo usar el asistente de clases.

## 6. Requisitos no funcionales

- Interfaz completamente en español, salvo nombres propios o contenido redactado por el usuario.
- HTML semántico y navegación por teclado.
- Contraste suficiente para lectura prolongada en el tema base y en los temas de materias.
- Sin dependencias de red necesarias para cargar el shell o el parser Markdown.
- Sin errores silenciosos: diferenciar índice inválido, configuración inválida, lección ausente y falta de red cuando corresponda.
- El contenido Markdown no debe poder inyectar HTML ejecutable en la interfaz. El HTML crudo debe deshabilitarse o sanearse antes de mostrarlo.

## 7. Criterios de aceptación

1. Con un catálogo válido sin materias, la app muestra el estado vacío y no una pantalla de error.
2. Con una materia creada por el agente y configuración válida, aparece en el inicio sin requerir cambios manuales del usuario al motor compartido.
3. Al abrir una materia, se muestran las lecciones declaradas en su configuración.
4. Al seleccionar una lección válida, se renderiza su Markdown; al seleccionar una ruta inexistente, aparece un error recuperable.
5. Se puede navegar entre inicio, materia y lección, y recargar/compartir la URL de una vista sin perder el contexto válido.
6. La app y los recursos de interfaz esenciales se cargan en una primera visita online.
7. Tras visitar una lección online, esa lección y el shell pueden volver a abrirse offline; una lección nunca visitada puede indicar que no está disponible sin conexión.
8. Las tablas y comparaciones son legibles en escritorio y móvil; el contenido no causa desbordamiento horizontal de toda la página.
9. Los controles principales son utilizables con teclado y mantienen etiquetas/estados accesibles.
10. Un Markdown con HTML potencialmente ejecutable se muestra como texto seguro o se elimina/sanea; no ejecuta scripts ni atributos activos.
11. Los errores de catálogo/configuración se presentan como error y no como catálogo vacío.
12. La app puede alojarse en GitHub Pages desde una ruta de proyecto y todas sus vistas, datos, lecciones y recursos siguen cargando correctamente.
13. El inicio y selector de materias mantienen el tema azul-negro con acentos azules y dorados antes y después de visitar un estudio.
14. Entrar a un estudio cambia el tema del área del estudio/lector al tema configurado, pero conserva sin cambios el tema base de la cabecera y el marco global.
15. En una materia se puede seleccionar un archivo `.md`, revisar su título y vista previa, confirmar y abrir la clase sin modificar manualmente JSON.
16. Una clase importada permanece disponible tras recargar la app en el mismo navegador y puede exportarse como `.md`.
17. La UI informa que las clases importadas se guardan solo en ese navegador y no se publican/sincronizan automáticamente.
18. Ningún contenido seleccionado desde `.md` ejecuta HTML o scripts al previsualizarse o leerse.

## 8. Preguntas abiertas para una iteración posterior

No bloquean el comienzo del MVP y no se deben resolver inventando requisitos:

- Icono, favicon y recursos gráficos de marca.
- Diseño visual final de tarjetas, navegación y animaciones.
- Convención exacta de Markdown para bloques comparativos lado a lado.
- Selección definitiva de tipografías locales y licencias.
- Política de actualización/invalidación de lecciones ya cacheadas.
- Nombres y metadatos finales de las primeras materias.
