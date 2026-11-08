# Especificación de UI — Tema oscuro base

## Propósito

Definir la identidad visual permanente de Lesson.me antes de seleccionar una materia y durante la navegación por la aplicación. La apariencia general debe sentirse moderna, académica y sobria, con azul como color principal y oro como acento secundario.

## Alcance visual

El tema base se usa en:

- Cabecera y marca Lesson.me.
- Inicio, mensaje de biblioteca vacía y errores.
- Selector/tarjetas de materias.
- Marco general de navegación y pie de página.
- Materias que usan el tema `default`.

El tema específico de una materia se aplica solo al contenedor del estudio, la lista de clases y el lector. No debe cambiar la cabecera, el pie de página ni el tema base al volver al selector.

## Paleta base

| Uso | Color |
| --- | --- |
| Fondo principal azul-negro profundo | `#050a16` |
| Superficie primaria | `#0b1426` |
| Superficie elevada | `#101d35` |
| Texto principal | `#edf3ff` |
| Texto secundario | `#a4b1ca` |
| Azul principal / acciones / selección | `#4a83ff` |
| Azul de superficie/iluminación | `#182b4d` |
| Oro secundario / detalle | `#d4af37` |
| Bordes | `#1d2b46` |

El azul debe tener suficiente contraste para botones, enlaces y foco. El oro es un acento: se usa de forma medida para microdetalles, rótulos, líneas y resaltados, no como color de grandes superficies ni como texto pequeño de bajo contraste.

## Requisitos de estilo

- Implementar con variables CSS nativas; no añadir framework de estilos ni alternador de tema al MVP.
- Mantener el tema base oscuro en todo momento, independientemente de las preferencias del sistema.
- Usar profundidad sutil: superficies separadas del fondo, sombras oscuras suaves, brillo azul discreto en interacciones y detalles dorados contenidos.
- Mantener contenido, bordes y controles legibles y distinguibles sin depender exclusivamente del color.
- Conservar foco de teclado visible y respetar `prefers-reduced-motion`.
- Actualizar `theme-color`, `background_color` del manifest y los iconos de aplicación para que coincidan con el fondo base.

## Separación de temas

- Las variables del tema base viven en `:root` y definen el shell compartido.
- El selector de materias conserva el tema base. Al entrar a una materia, su tema llena la ventana y se ocultan la cabecera y el pie globales.
- En las vistas de selección/agregado y lectura, el tema de materia se aplica al fondo completo. La lectura conserva una sidebar para cambiar de clase.
- Los temas de Latín/Programación también permanecen oscuros, pero cada uno conserva su identidad de colores, tipografía y tratamiento del contenido.
- `theme: "default"` hereda el tema base azul-negro.

## Criterios de aceptación

1. Al abrir el inicio sin materias, el fondo es azul-negro profundo, las superficies son oscuras y los acentos visibles son azules con detalles dorados.
2. Al registrar una materia, las tarjetas mantienen la identidad visual base y son legibles en escritorio y móvil.
3. El selector de materias mantiene la identidad base azul-negra.
4. Al entrar en una materia, tanto la selección/agregado como la lectura adoptan el tema de la materia en toda la ventana.
5. La vista de lectura mantiene una sidebar para cambiar de clase y controles para volver a la materia.
6. Al volver al inicio desde cualquier materia, el selector sigue usando el tema base.
7. El estado de foco de teclado y los controles permanecen visibles sobre las superficies temáticas.
8. La apariencia de la barra de navegador e iconos instalables coincide con el fondo base fuera de un módulo.
