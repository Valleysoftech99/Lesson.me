# Lesson.me — Dont be Burro

Portal estático y responsive para organizar materias y leer lecciones Markdown. Está preparado para GitHub Pages y permite consultar offline las lecciones ya visitadas.

## Ejecutar la aplicación en Windows

1. Abre PowerShell en la carpeta del proyecto.
2. Inicia un servidor HTTP local:

   ```powershell
   python -m http.server 8000
   ```

   Si el comando `python` no está disponible, prueba `py -m http.server 8000`.
3. Abre [http://localhost:8000](http://localhost:8000) en el navegador.
4. Para detener el servidor, vuelve a PowerShell y pulsa `Ctrl+C`.

No abras `index.html` directamente como `file://`: la aplicación necesita `fetch()` y un servidor para cargar el catálogo, las configuraciones y las lecciones.

No hace falta instalar paquetes npm para ejecutar el portal; el parser Markdown y el sanitizador ya están incluidos localmente.

## Apariencia base y temas de estudio

El inicio y el selector usan el tema oscuro general de Lesson.me: fondo azul-negro profundo, azul como color principal y oro para detalles y acentos. Ese marco visual se conserva al navegar.

Cada materia puede elegir un tema propio que se aplica al área de la materia y al lector. Latín ya está disponible con superficies cálidas de intensidad media a oscura, texto pergamino y acentos de latón y borgoña; `hacker` usa negro con acentos neón. El marco general conserva su apariencia azul-negra.

## Agregar una materia con el agente de código

No tienes que crear carpetas ni editar JSON a mano. Solicítale al agente de VS Code el módulo y descríbele la materia para que prepare un tema UI acorde.

Ejemplo para una materia futura:

> Agrega la materia de Historia a Lesson.me. Crea un tema inspirado en su contexto, sin cambiar el tema azul-negro global. No inventes clases: las voy a cargar con el asistente de la app.

El agente debe registrar el módulo, crear su configuración y tema visual y verificar que aparece en el selector. El tema propio se aplica a la zona de estudio, no a la cabecera ni al marco general.

## Cargar clases con el asistente de la app

El flujo definido es abrir la materia, elegir **Agregar clase**, seleccionar un archivo `.md`, revisar el título y la vista previa y confirmar. La clase se guarda en ese navegador para volver a abrirla después y se puede exportar como Markdown.

Las clases importadas se guardan en IndexedDB de ese navegador: no aparecen en otros dispositivos ni se publican automáticamente en GitHub Pages. Desde la clase abierta se puede exportar el Markdown original; para publicarlo, incorpora el archivo al repositorio y regístralo en la configuración de la materia.

Para publicar una clase en el repositorio, descarga/exporta el `.md` y solicita al agente:

> Incorpora esta clase de Latín al repositorio: coloca el Markdown en la carpeta de lecciones y regístralo en la configuración existente sin cambiar el tema ni el shell.

La app estática no puede escribir directamente al repositorio; el agente realiza ese paso versionado. Los flujos y criterios están en [Spec/04-Modulos-y-asistente-de-clases.md](./Spec/04-Modulos-y-asistente-de-clases.md) y el formato de datos en [Spec/02-Tecnica-y-datos.md](./Spec/02-Tecnica-y-datos.md).

## Dependencias locales

El lector usa [Marked](https://github.com/markedjs/marked) y [DOMPurify](https://github.com/cure53/DOMPurify), almacenados localmente para permitir lectura offline. Las versiones y licencias están en `package.json`, `package-lock.json` y `assets/js/vendor/`. `node_modules/` solo se necesita para actualizar esas copias locales, no para ejecutar la app.
