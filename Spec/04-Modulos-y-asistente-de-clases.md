# Especificación funcional — módulos por agente y asistente de clases

## Propósito

Describir el flujo esperado para ampliar Lesson.me sin que el usuario tenga que construir manualmente la estructura de una materia o editar JSON para cargar cada clase:

1. El usuario solicita al agente de código una materia/módulo.
2. El agente crea el módulo y un tema UI inspirado en su contexto.
3. Dentro de ese módulo, el usuario carga clases mediante un asistente de la app seleccionando archivos `.md`.

## A. Crear una materia mediante el agente de código

### Solicitud del usuario

El usuario proporciona el nombre de la materia y, si los conoce, su contexto, paleta, tono visual, organización y archivos iniciales. El agente puede hacer preguntas breves si hace falta aclarar decisiones de diseño o estructura.

Ejemplo de solicitud:

> Agrega la materia Latín a Lesson.me. Quiero una estética de manuscrito clásico, oscura y legible. Crea el módulo y su tema visual. No inventes clases: las cargaré con el asistente de la app.

### Responsabilidades del agente

- Leer las specs y las directrices del proyecto.
- Crear `estudios/<id>/config.json` y directorios necesarios.
- Registrar la materia en `estudios/index.json`.
- Crear un tema CSS inspirado en la materia, compatible con el modo oscuro y la paleta base global.
- Limitar el tema específico al área del módulo/lector; preservar cabecera, inicio y marco base.
- No crear lecciones ficticias si el usuario no las solicitó.
- Validar que el módulo aparece en el selector, carga su vista vacía y muestra correctamente el tema en escritorio/móvil.
- Resumir los archivos creados, cómo probar el módulo y qué preguntas quedan abiertas.

### Separación visual

La base de Lesson.me conserva fondo azul-negro, acentos azules y detalles dorados. El tema Latín, por ejemplo, puede usar carbón, pergamino/marfil y borgoña/oro; otra materia puede tener una estética diferente. El tema inspira la superficie de estudio y el lector, no cambia el shell compartido.

## B. Asistente de importación de clases

### Punto de entrada

Una acción **Agregar clase** aparece en la vista de cada módulo. El asistente conoce el módulo actual y agrega la clase a esa materia, no a otra.

### Flujo

1. **Seleccionar archivo:** selector nativo de archivos, aceptando `.md`.
2. **Confirmar datos:** sugerir el título desde el primer encabezado `#` o desde el nombre del archivo. Permitir corregir el título.
3. **Vista previa:** mostrar el contenido interpretado como Markdown con el mismo tema de la materia y las mismas protecciones del lector.
4. **Agregar:** guardar el texto original y metadatos localmente; mostrar confirmación y permitir abrir la clase.
5. **Exportar para el repositorio:** permitir descargar el `.md` original con un nombre adecuado. Informar que para hacerlo parte de la versión publicada hay que pedir al agente de código que lo agregue al repositorio y registre la lección en la configuración.

No se requiere que el usuario copie y pegue el contenido del archivo ni edite JSON para leer una clase importada en el navegador actual.

## C. Persistencia y límites

- La app estática no escribe al repositorio y no publica archivos en GitHub.
- Las importaciones se guardan en IndexedDB del navegador actual, asociadas al id de la materia.
- Las clases locales se conservan tras recargar y pueden leerse offline en ese mismo navegador/perfil.
- No se sincronizan con otros navegadores/dispositivos ni se consideran respaldadas por Git.
- Exportar el Markdown original permite conservarlo fuera del navegador; el usuario puede solicitar al agente de código incorporarlo a los archivos versionados para publicarlo y sincronizarlo.
- Las clases en los archivos fuente del repositorio siguen disponibles para todos los usuarios; las importaciones locales no alteran esos archivos.

## D. Seguridad y accesibilidad

- Renderizar el contenido Markdown únicamente después de sanear el HTML generado con DOMPurify.
- No ejecutar HTML, scripts ni atributos activos contenidos en la clase.
- Usar controles HTML nativos, etiquetas asociadas, mensajes de error claros, foco visible y navegación por teclado.
- El paso de vista previa debe anunciar su título y estado; los errores de tipo/lectura/almacenamiento deben permitir reintentar o cancelar.
- Mostrar de manera visible que la clase importada solo se guardó localmente y aún no forma parte del repositorio.

## E. Criterios de aceptación

1. El usuario puede solicitar al agente una materia nueva y el agente crea el registro, la configuración, los directorios y un tema contextual sin añadir clases no solicitadas.
2. El módulo nuevo muestra su estado vacío con el tema propio; la cabecera y la base azul-negra con acentos azules/oro no cambian.
3. Desde el módulo, el usuario puede seleccionar un archivo `.md`, verificar/corregir el título y revisar la vista previa.
4. Al confirmar, la clase aparece en la lista y puede leerse inmediatamente con el tema de ese módulo.
5. La clase importada permanece tras recarga y funciona offline en el mismo navegador.
6. El usuario puede descargar el `.md` original y recibe instrucciones claras para pedir al agente que lo incorpore al repositorio.
7. La app no presenta falsamente la clase como publicada ni sincronizada; el catálogo/configuración del repositorio no se modifica al importarla.
8. El Markdown potencialmente peligroso no ejecuta contenido activo.
