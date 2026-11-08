# Características Adicionales, Notas y Decisiones de Diseño

Este documento recopila especificaciones, funciones y aclaraciones conversacionales que complementan la arquitectura del Portal de Estudio, asegurando que ningún detalle técnico o de usabilidad quede fuera del radar.

## 1. Soporte PWA (Progressive Web App)
- **Instalabilidad:** La aplicación está diseñada para instalarse como una app nativa tanto en dispositivos móviles (Android / iOS) como en PCs de escritorio a través del navegador.
- **Archivos Clave:** Requiere obligatoriamente el archivo `manifest.json` (metadatos, nombre y colores de la app) y un `sw.js` (Service Worker básico) en la raíz para habilitar la caché y el funcionamiento offline.

## 2. Experiencia de Lectura y Cuadros Comparativos
- **Formato Markdown:** Las lecciones se redactan en texto plano (`.md`) para garantizar velocidad y portabilidad.
- **Soporte Gramatical / Técnico:** El motor CSS debe soportar de forma nativa tablas estilizadas y bloques contenedores divididos en dos columnas (lado a lado). Esto es fundamental para materias como Latín (ej. la comparación semántica y gramatical entre **ES** y **EST**) o para bloques de código comparativos en programación.
- **Tablas desde apuntes:** Además de las tablas Markdown con barras verticales, el lector reconoce bloques de filas separadas por tabulaciones y los presenta como tablas. Las líneas de sección aisladas que comienzan con numeración, por ejemplo `2. Sum: ser o estar`, se muestran como encabezados.
- **Lectura inmersiva:** Al abrir una clase, el lector ocupa toda la ventana y aplica el tema de la materia a la superficie completa. Una barra de lectura permite volver a la materia o cambiar de clase.

## 3. Filosofía de Desarrollo y Cero Fricción
- **Simplicidad Absoluta:** No se utilizan frameworks pesados (React, Vue) ni compiladores complejos. Todo corre con HTML5 semántico, CSS nativo basado en variables para los temas, y Vanilla JavaScript moderno.
- **Cero Seguridad Extrema:** Al tratarse de una bitácora personal alojada en GitHub Pages, se prescinde de autenticaciones de backend, bases de datos o encriptaciones complejas. El código es libre para lectura pública pero protegido contra modificaciones ajenas mediante los permisos nativos de GitHub y reglas en la rama `main`.
- **Mantenimiento Humano:** Cualquier persona (o el propio usuario) puede editar las lecciones directamente como texto plano en VS Code sin romper la lógica estructural del sistema.
