# Estructura del repositorio y arquitectura

Lesson.me es una aplicación estática para GitHub Pages. El motor y la interfaz son compartidos; las materias y sus lecciones se registran como datos y archivos Markdown.

```text
/
├── index.html
├── manifest.json
├── sw.js
├── README.md
├── package.json
├── package-lock.json
├── assets/
│   ├── icon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── css/
│   │   ├── core.css
│   │   └── themes.css
│   └── js/
│       ├── app.js
│       └── vendor/
│           ├── marked.js
│           ├── purify.min.js
│           ├── MARKED-LICENSE
│           └── DOMPURIFY-LICENSE
├── estudios/
│   ├── index.json
│   └── <id-de-materia>/
│       ├── config.json
│       └── lecciones/
│           └── <id-de-leccion>.md
├── Docs/
└── Spec/
```

## Responsabilidades

- `index.html`: shell semántico y carga de estilos/scripts locales.
- `assets/css/core.css`: componentes, lector y diseño responsive.
- `assets/css/themes.css`: variables del tema oscuro base y temas oscuros por materia, limitados al contenedor de estudio.
- `assets/js/app.js`: catálogo, rutas, carga de configuraciones/lecciones y estados de interfaz.
- `assets/js/vendor/`: versiones locales de Marked y DOMPurify para renderizado Markdown seguro y lectura offline.
- IndexedDB: clases importadas mediante el asistente, locales al navegador; no se sincronizan con GitHub.
- `estudios/index.json`: índice explícito de materias; no se enumeran carpetas del servidor.
- `estudios/<id>/config.json`: metadatos de la materia y lista explícita de lecciones.
- `estudios/<id>/lecciones/*.md`: contenido de las lecciones.
- `manifest.json` y `sw.js`: instalación PWA y caché del shell/contenido visitado.
- `Spec/`: especificaciones funcional y técnica del MVP.

Consulta [README.md](../README.md) para agregar materias y probar la app localmente, y [Spec/](../Spec/) para el contrato completo de datos y los criterios de aceptación.
