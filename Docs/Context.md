# Contexto Técnico y de Diseño para el Desarrollo

## Contexto del Proyecto
El usuario es un estudiante universitario que gestiona múltiples disciplinas de estudio en paralelo (actualmente Latín y Programación). Necesita un entorno unificado donde documentar y consultar sus clases de forma rápida, tanto desde su computadora de escritorio como desde su teléfono móvil.

## Especificaciones de Diseño por Tema
- **Tema Base de Lesson.me (shell y selector):**
  - Inspiración: interfaz de estudio moderna, académica y sobria.
  - Paleta: fondo azul-negro profundo (`#050a16`), superficies azul marino, azul principal (`#4a83ff`) y oro secundario (`#d4af37`) para detalles y resaltados.
  - Alcance: inicio, selector de materias, cabecera y marco general; permanece visible aunque se abra una materia.

- **Tema Latín (`.theme-latin`):**
  - Inspiración: Contexto histórico clásico, académico antiguo.
  - Paleta: Superficies cálidas de intensidad media a oscura (carbón cálido `#292723` y piedra `#35312b`), texto pergamino (`#f2eadb`) y acentos de latón (`#d3a968`) y borgoña apagado (`#98545a`).
  - Tipografía: Títulos con estilo Serif clásico; cuerpo limpio y legible.
  - Requisito especial: Soporte visual nativo para cuadros comparativos de gramática (ej. diferenciación semántica entre *ES* y *EST*).

- **Tema Programación (`.theme-hacker`):**
  - Inspiración: Entornos de desarrollo de alto rendimiento y terminales.
  - Paleta: Fondo negro absoluto (`#0a0a0c`), acentos en verde neón (`#00ff66`) o cian (`#00f0ff`).
  - Tipografía: Monoespaciada (`Courier New`, `Fira Code`) para simular consola o editor de código.

Al entrar a una materia, su tema cubre la ventana completa en la selección de clases, el asistente y la lectura; la cabecera y el pie globales se ocultan. Al volver al inicio, reaparece el tema azul-negro general de Lesson.me.

## Modelo de Escalabilidad
- **Agregar Lecciones:** Se realiza escribiendo archivos de texto plano (`.md`) directamente en VS Code dentro de la carpeta del estudio correspondiente y haciendo `git push`.
- **Agregar Nuevos Estudios:** Se define por código creando una nueva carpeta en `/estudios/` con su respectivo `config.json` y sus archivos Markdown, registrándolo en el selector principal.
