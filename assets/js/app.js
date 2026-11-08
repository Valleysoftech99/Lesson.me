(() => {
  "use strict";

  const app = document.querySelector("#app");
  const baseUrl = new URL("./", window.location.href);
  const studyConfigs = new Map();
  const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const mobileMenu = window.matchMedia("(max-width: 760px)");
  let catalog;
  let routeVersion = 0;
  let activeStudyTheme = "";

  function setStudyMode(theme = "", isReading = false) {
    document.body.classList.remove("study-mode", "reading-mode", "drawer-open");
    if (activeStudyTheme) document.body.classList.remove(`theme-${activeStudyTheme}`);
    activeStudyTheme = theme;
    if (theme) {
      document.body.classList.add("study-mode", `theme-${theme}`);
      if (isReading) document.body.classList.add("reading-mode");
    }
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = theme
        ? getComputedStyle(document.body).getPropertyValue("--page").trim()
        : "#050a16";
    }
  }

  function openLessonStore() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("lesson-me", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("lessons")) {
          db.createObjectStore("lessons", { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error("No se pudo abrir el almacenamiento local."));
    });
  }

  async function readLocalLessons(studyId) {
    const db = await openLessonStore();
    return new Promise((resolve, reject) => {
      const request = db.transaction("lessons").objectStore("lessons").getAll();
      request.onsuccess = () => {
        db.close();
        resolve(request.result.filter((lesson) => lesson.studyId === studyId));
      };
      request.onerror = () => { db.close(); reject(new Error("No se pudieron leer las clases locales.")); };
    });
  }

  async function saveLocalLesson(lesson) {
    const db = await openLessonStore();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("lessons", "readwrite");
      transaction.objectStore("lessons").put(lesson);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(new Error("No se pudo guardar la clase en este navegador.")); };
    });
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function makeLink(text, href, className) {
    const link = element("a", className, text);
    link.href = href;
    return link;
  }

  function showLoading(message) {
    const section = element("section", "loading-state");
    section.setAttribute("aria-label", message);
    const indicator = element("span", "loading-indicator");
    indicator.setAttribute("aria-hidden", "true");
    section.append(indicator, element("p", "", message));
    app.replaceChildren(section);
  }

  function showError(title, message, retry) {
    setStudyMode();
    const section = element("section", "error-state");
    section.setAttribute("role", "alert");
    section.append(
      element("p", "eyebrow", "No se pudo completar"),
      element("h2", "", title),
      element("p", "", message),
      makeLink("Volver al inicio", "#/", "action-button")
    );
    if (retry) {
      const button = element("button", "action-button", "Reintentar");
      button.type = "button";
      button.addEventListener("click", retry);
      section.append(button);
    }
    app.replaceChildren(section);
  }

  function resolveAppPath(path, expectedPrefix) {
    if (typeof path !== "string" || !path || path.startsWith("/") || path.includes("\\") || /[?#]/.test(path)) {
      throw new Error("La ruta debe ser relativa a la aplicación.");
    }
    const url = new URL(path, baseUrl);
    if (url.origin !== baseUrl.origin || !url.pathname.startsWith(baseUrl.pathname)) {
      throw new Error("La ruta intenta salir de la carpeta de la aplicación.");
    }
    if (expectedPrefix && !url.pathname.startsWith(new URL(expectedPrefix, baseUrl).pathname)) {
      throw new Error("La ruta no pertenece a la carpeta esperada.");
    }
    return url;
  }

  async function fetchJson(path, prefix) {
    const response = await fetch(resolveAppPath(path, prefix));
    if (!response.ok) {
      throw new Error(`El servidor respondió ${response.status} al cargar ${path}.`);
    }
    try {
      return await response.json();
    } catch {
      throw new Error(`El archivo ${path} no contiene JSON válido.`);
    }
  }

  function validateCatalog(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.studies)) {
      throw new Error("El catálogo debe tener schemaVersion 1 y una lista studies.");
    }

    const ids = new Set();
    return data.studies.map((study) => {
      if (!study || typeof study.id !== "string" || !idPattern.test(study.id) ||
          ids.has(study.id) || typeof study.title !== "string" || !study.title.trim()) {
        throw new Error("Cada materia debe tener un id único válido y un título.");
      }
      ids.add(study.id);
      if (typeof study.config !== "string" || !study.config.startsWith(`estudios/${study.id}/`)) {
        throw new Error(`La configuración de "${study.title}" debe estar dentro de su carpeta de estudio.`);
      }
      resolveAppPath(study.config, `estudios/${study.id}/`);
      return {
        id: study.id,
        title: study.title.trim(),
        description: typeof study.description === "string" ? study.description.trim() : "",
        icon: typeof study.icon === "string" ? study.icon.trim() : "",
        config: study.config
      };
    });
  }

  function renderHome() {
    setStudyMode();
    const heading = element("header", "page-heading");
    heading.append(
      element("p", "eyebrow", "Tu espacio de estudio"),
      element("h1", "", "Aprende a tu manera."),
      element("p", "", "Un lugar sencillo para organizar tus materias y volver a tus lecciones cuando las necesites.")
    );

    if (catalog.length === 0) {
      const empty = element("section", "empty-state");
      empty.append(
        element("h2", "", "Tu biblioteca empieza aquí"),
        element("p", "", "Todavía no hay materias. Cuando quieras comenzar, agrega un estudio al catálogo y sus lecciones en formato Markdown.")
      );
      app.replaceChildren(heading, empty);
      return;
    }

    const cards = element("section", "study-cards");
    cards.setAttribute("aria-label", "Materias disponibles");
    for (const study of catalog) {
      const card = makeLink("", `#/study/${study.id}`, "study-card");
      const icon = element("span", "study-card-icon", study.icon || study.title.slice(0, 2));
      icon.setAttribute("aria-hidden", "true");
      card.append(icon, element("h2", "", study.title));
      if (study.description) card.append(element("p", "", study.description));
      cards.append(card);
    }
    app.replaceChildren(heading, cards);
  }

  function validateStudyConfig(data, study) {
    if (!data || data.schemaVersion !== 1 || data.id !== study.id ||
        typeof data.title !== "string" || !data.title.trim() ||
        typeof data.theme !== "string" || !Array.isArray(data.lessons)) {
      throw new Error(`La configuración de "${study.title}" no cumple el esquema esperado.`);
    }
    const lessonIds = new Set();
    const lessons = data.lessons.map((lesson) => {
      if (!lesson || typeof lesson.id !== "string" || !idPattern.test(lesson.id) || lessonIds.has(lesson.id) ||
          typeof lesson.title !== "string" || !lesson.title.trim() ||
          typeof lesson.path !== "string" ||
          !lesson.path.startsWith(`estudios/${study.id}/lecciones/`) ||
          !lesson.path.endsWith(".md")) {
        throw new Error(`La lista de lecciones de "${study.title}" contiene datos inválidos.`);
      }
      lessonIds.add(lesson.id);
      resolveAppPath(lesson.path, `estudios/${study.id}/lecciones/`);
      return { id: lesson.id, title: lesson.title.trim(), path: lesson.path };
    });
    const theme = idPattern.test(data.theme) ? data.theme : "default";
    return {
      id: study.id,
      title: data.title.trim(),
      description: typeof data.description === "string" ? data.description.trim() : study.description,
      theme,
      lessons
    };
  }

  async function getStudyConfig(study) {
    if (!studyConfigs.has(study.id)) {
      const data = await fetchJson(study.config, `estudios/${study.id}/`);
      studyConfigs.set(study.id, validateStudyConfig(data, study));
    }
    return studyConfigs.get(study.id);
  }

  function renderStudyLayout(study, config, selectedLessonId, lessons) {
    const isReading = Boolean(selectedLessonId);
    setStudyMode(config.theme, isReading);
    const layout = element("div", `study-grid theme-${config.theme}${isReading ? " reader-mode" : ""}`);
    const sidebar = element("aside", "study-sidebar");
    sidebar.id = `class-navigation-${study.id}`;
    sidebar.setAttribute("aria-label", `Navegación de ${config.title}`);
    const heading = element("header", "study-heading");
    heading.append(
      makeLink("← Todas las materias", "#/", "back-link"),
      element("h1", "", config.title)
    );
    if (config.description) heading.append(element("p", "study-description", config.description));

    const nav = element("nav", "");
    nav.setAttribute("aria-label", `Clases de ${config.title}`);
    const toggle = element("button", "lesson-menu-toggle", "Clases");
    toggle.type = "button";
    toggle.setAttribute("aria-controls", "lesson-list");
    toggle.setAttribute("aria-expanded", "false");
    toggle.hidden = isReading;
    const list = element("ul", "lesson-menu");
    list.id = "lesson-list";
    list.hidden = !isReading && mobileMenu.matches;
    for (const lesson of lessons) {
      const item = element("li");
      const link = makeLink(lesson.title, `#/study/${study.id}/lesson/${lesson.id}`, "lesson-link");
      if (lesson.id === selectedLessonId) link.setAttribute("aria-current", "page");
      item.append(link);
      list.append(item);
    }
    toggle.addEventListener("click", () => {
      list.hidden = !list.hidden;
      toggle.setAttribute("aria-expanded", String(!list.hidden));
    });
    nav.append(toggle, list);
    sidebar.append(heading, nav);

    const addButton = element("button", "action-button add-lesson-button", "Agregar clase");
    addButton.type = "button";
    addButton.addEventListener("click", () => renderImportAssistant(study, sidebar));
    sidebar.append(addButton);

    const main = element("section", "study-content");
    main.setAttribute("aria-label", "Contenido de estudio");
    let drawerToggle;
    let drawerClose;
    let scrim;
    if (isReading) {
      const toolbar = element("nav", "reading-toolbar");
      toolbar.setAttribute("aria-label", "Navegación de lectura");
      toolbar.append(makeLink(`← ${config.title}`, `#/study/${study.id}`, "reading-back"));
      drawerToggle = element("button", "drawer-toggle", "☰ Clases");
      drawerToggle.type = "button";
      drawerToggle.setAttribute("aria-controls", sidebar.id);
      drawerToggle.setAttribute("aria-expanded", "false");
      toolbar.append(drawerToggle);
      drawerClose = element("button", "drawer-close", "Cerrar navegación");
      drawerClose.type = "button";
      heading.append(drawerClose);
      sidebar.inert = true;
      sidebar.setAttribute("aria-hidden", "true");
      scrim = element("button", "sidebar-scrim");
      scrim.type = "button";
      scrim.setAttribute("aria-label", "Cerrar navegación de clases");
      main.append(toolbar);
    }
    const setDrawerOpen = (open) => {
      layout.classList.toggle("sidebar-open", open);
      document.body.classList.toggle("drawer-open", open);
      sidebar.inert = !open;
      sidebar.setAttribute("aria-hidden", String(!open));
      drawerToggle.setAttribute("aria-expanded", String(open));
      if (open) drawerClose.focus();
      else drawerToggle.focus();
    };
    if (isReading) {
      drawerToggle.addEventListener("click", () => setDrawerOpen(true));
      drawerClose.addEventListener("click", () => setDrawerOpen(false));
      scrim.addEventListener("click", () => setDrawerOpen(false));
      layout.addEventListener("keydown", (event) => {
        if (!layout.classList.contains("sidebar-open")) return;
        if (event.key === "Escape") {
          setDrawerOpen(false);
          return;
        }
        if (event.key === "Tab") {
          const focusable = [...sidebar.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])")];
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });
    }
    layout.append(sidebar, main);
    if (scrim) layout.append(scrim);
    app.replaceChildren(layout);
    return main;
  }

  function renderImportAssistant(study, sidebar) {
    const old = sidebar.querySelector(".import-assistant");
    if (old) old.remove();
    const panel = element("section", "import-assistant");
    panel.setAttribute("aria-labelledby", "import-title");
    const title = element("h2", "", "Agregar una clase");
    title.id = "import-title";
    const note = element("p", "", "La clase se guardará solo en este navegador. No se publica ni se sincroniza con GitHub.");
    const form = element("form", "import-form");
    const fileLabel = element("label", "", "Archivo Markdown (.md)");
    const fileInput = element("input");
    fileInput.type = "file";
    fileInput.accept = ".md,text/markdown,text/plain";
    fileInput.required = true;
    fileLabel.append(fileInput);
    const titleLabel = element("label", "", "Título de la clase");
    const titleInput = element("input");
    titleInput.type = "text";
    titleInput.required = true;
    titleInput.maxLength = 160;
    titleInput.disabled = true;
    titleLabel.append(titleInput);
    const previewHeading = element("h3", "", "Vista previa");
    const preview = element("div", "import-preview markdown-content");
    preview.setAttribute("aria-live", "polite");
    const status = element("p", "import-status");
    status.setAttribute("role", "status");
    const actions = element("div", "import-actions");
    const add = element("button", "action-button", "Guardar clase");
    add.type = "submit";
    add.disabled = true;
    const cancel = element("button", "secondary-button", "Cancelar");
    cancel.type = "button";
    cancel.addEventListener("click", () => panel.remove());
    actions.append(add, cancel);
    form.append(fileLabel, titleLabel, previewHeading, preview, status, actions);
    panel.append(title, note, form);
    sidebar.append(panel);

    let markdown = "";
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      add.disabled = true;
      titleInput.disabled = true;
      preview.replaceChildren();
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".md")) {
        status.textContent = "Selecciona un archivo con extensión .md.";
        return;
      }
      try {
        markdown = await file.text();
        if (!window.marked || !window.DOMPurify) throw new Error("No se pudo cargar el visor Markdown.");
        const firstHeading = markdown.match(/^#\s+(.+)$/m);
        titleInput.value = (firstHeading ? firstHeading[1] : file.name.replace(/\.md$/i, "")).trim();
        titleInput.disabled = false;
        const rendered = window.DOMPurify.sanitize(window.marked.parse(prepareLessonMarkdown(markdown), { gfm: true }), {
          USE_PROFILES: { html: true }, FORBID_TAGS: ["style", "iframe", "object", "embed"], FORBID_ATTR: ["style"]
        });
        preview.innerHTML = rendered;
        status.textContent = "Revisa el título y la vista previa antes de guardar.";
        add.disabled = false;
      } catch (error) {
        status.textContent = `No se pudo leer el archivo. ${error.message}`;
      }
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const lessonTitle = titleInput.value.trim();
      if (!markdown || !lessonTitle) { status.textContent = "Elige un archivo y escribe un título."; return; }
      add.disabled = true;
      try {
        const importedAt = new Date().toISOString();
        const id = `local-${crypto.randomUUID()}`;
        const lesson = { id, studyId: study.id, title: lessonTitle, fileName: fileInput.files[0].name, importedAt, markdown };
        await saveLocalLesson(lesson);
        panel.remove();
        status.textContent = "Clase guardada localmente.";
        window.location.hash = `#/study/${study.id}/lesson/${id}`;
      } catch (error) {
        status.textContent = `${error.message} Puedes volver a intentarlo.`;
        add.disabled = false;
      }
    });
  }

  function makeReader(title) {
    const article = element("article", "reader");
    article.append(element("h1", "", title));
    return article;
  }

  function renderLessonContent(article, markdown) {
    if (!window.marked || !window.DOMPurify) {
      throw new Error("No se pudieron cargar las herramientas locales para leer Markdown.");
    }
    const rawHtml = window.marked.parse(prepareLessonMarkdown(markdown), { gfm: true });
    const safeHtml = window.DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["style", "iframe", "object", "embed"],
      FORBID_ATTR: ["style"]
    });
    const content = element("div", "markdown-content");
    content.innerHTML = safeHtml;
    for (const link of content.querySelectorAll("a[href]")) {
      const url = new URL(link.href, window.location.href);
      if ((url.protocol === "https:" || url.protocol === "http:") && url.origin !== window.location.origin) {
        link.classList.add("external-link");
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `${link.textContent.trim()} (enlace externo)`);
      }
    }
    for (const table of content.querySelectorAll("table")) {
      const wrapper = element("div", "table-scroll");
      table.before(wrapper);
      wrapper.append(table);
    }
    article.append(content);
  }

  function prepareLessonMarkdown(markdown) {
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    const output = [];
    let inCodeBlock = false;
    for (let index = 0; index < lines.length;) {
      const line = lines[index];
      if (/^\s*(```|~~~)/.test(line)) inCodeBlock = !inCodeBlock;
      if (!inCodeBlock && /^\d+\.\s+\S/.test(line) &&
          (index === 0 || !lines[index - 1].trim()) &&
          (index === lines.length - 1 || !/^\d+\.\s+\S/.test(lines[index + 1]))) {
        output.push(`## ${line.replace(/^\d+\.\s+/, "")}`);
        index += 1;
        continue;
      }
      if (!inCodeBlock && /^Ejemplos:\s*$/i.test(line)) {
        output.push("### Ejemplos");
        index += 1;
        continue;
      }
      if (!inCodeBlock && /^Pista:\s*/i.test(line)) {
        output.push(line.replace(/^Pista:/i, "**Pista:**"));
        index += 1;
        continue;
      }
      if (!inCodeBlock && line.includes("\t")) {
        const rows = [];
        while (index < lines.length && lines[index].includes("\t")) {
          rows.push(lines[index].split("\t").map((cell) => cell.trim()));
          index += 1;
        }
        const width = Math.max(...rows.map((row) => row.length));
        if (rows.length >= 2 && width >= 2 && rows.every((row) => row.length >= 2)) {
          const asTableRow = (row) => `| ${Array.from({ length: width }, (_, cell) =>
            (row[cell] || "").replace(/\|/g, "\\|")).join(" | ")} |`;
          output.push(asTableRow(rows[0]));
          output.push(`| ${Array(width).fill("---").join(" | ")} |`);
          output.push(...rows.slice(1).map(asTableRow));
        } else {
          output.push(...rows.map((row) => row.join(" — ")));
        }
        continue;
      }
      output.push(line);
      index += 1;
    }
    return output.join("\n");
  }

  async function renderRoute() {
    const currentVersion = ++routeVersion;
    if (!catalog) return;
    const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    setStudyMode();
    if (parts.length === 0) {
      renderHome();
      return;
    }
    if ((parts.length !== 2 && parts.length !== 4) || parts[0] !== "study" ||
        (parts.length === 4 && parts[2] !== "lesson")) {
      showError("Enlace no reconocido", "La dirección no corresponde a una vista de estudio válida.");
      return;
    }

    const study = catalog.find((item) => item.id === parts[1]);
    if (!study) {
      setStudyMode();
      showError("Materia no encontrada", "Esta materia no está registrada en el catálogo.");
      return;
    }

    showLoading("Cargando materia…");
    let config;
    try {
      config = await getStudyConfig(study);
    } catch (error) {
      if (currentVersion === routeVersion) {
        showError("No se pudo cargar la materia", error.message, () => {
          studyConfigs.delete(study.id);
          renderRoute();
        });
      }
      return;
    }
    if (currentVersion !== routeVersion) return;

    let imported = [];
    let localStorageError = "";
    try { imported = await readLocalLessons(study.id); } catch (error) {
      localStorageError = error.message;
    }
    if (currentVersion !== routeVersion) return;
    const lessons = [...config.lessons, ...imported.map(({ id, title }) => ({ id, title, local: true }))];
    const lessonId = parts.length === 4 ? parts[3] : null;
    const content = renderStudyLayout(study, config, lessonId, lessons);
    if (localStorageError) {
      const warning = element("p", "local-only-note", `No se pudieron leer las clases importadas. ${localStorageError}`);
      warning.setAttribute("role", "status");
      content.prepend(warning);
    }
    if (!lessonId) {
      const article = makeReader(lessons.length ? "Elige una clase" : "Todavía no hay clases");
      const message = lessons.length
        ? "Selecciona una lección de la lista para comenzar a leer."
        : "Esta materia aún no tiene lecciones. Puedes agregarlas como archivos Markdown y registrarlas en su configuración.";
      article.append(element("p", "", message));
      content.append(article);
      return;
    }

    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) {
      const article = makeReader("Lección no encontrada");
      article.append(element("p", "", "Esta lección no está declarada en la configuración de la materia."));
      content.append(article);
      return;
    }

    const article = makeReader(lesson.title);
    const loading = element("p", "", "Cargando lección…");
    loading.setAttribute("role", "status");
    article.append(loading);
    content.append(article);
    try {
      let markdown;
      if (lesson.local) {
        const stored = imported.find((item) => item.id === lesson.id);
        if (!stored) throw new Error("La clase local ya no está disponible.");
        markdown = stored.markdown;
      } else {
        const response = await fetch(resolveAppPath(lesson.path, `estudios/${study.id}/lecciones/`));
        if (!response.ok) throw new Error(`El servidor respondió ${response.status}.`);
        markdown = await response.text();
      }
      if (currentVersion !== routeVersion) return;
      loading.remove();
      renderLessonContent(article, markdown);
      if (lesson.local) {
        const stored = imported.find((item) => item.id === lesson.id);
        const exportButton = element("button", "secondary-button", "Exportar Markdown original");
        exportButton.type = "button";
        exportButton.addEventListener("click", () => {
          const blob = new Blob([stored.markdown], { type: "text/markdown;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const anchor = makeLink("", url);
          const safeName = (stored.title || stored.fileName.replace(/\.md$/i, ""))
            .normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "clase";
          anchor.download = `${safeName}.md`;
          anchor.click();
          URL.revokeObjectURL(url);
        });
        article.append(element("p", "local-only-note", "Esta clase está guardada solo en este navegador. Para publicarla, exporta el Markdown y pide al agente que lo incorpore al repositorio y a la configuración de esta materia."), exportButton);
      }
    } catch (error) {
      if (currentVersion !== routeVersion) return;
      loading.remove();
      const message = navigator.onLine
        ? `No se pudo cargar esta lección. ${error.message}`
        : "Esta lección todavía no está guardada para leer sin conexión.";
      article.append(element("p", "error-copy", message));
      const retry = element("button", "action-button", "Reintentar");
      retry.type = "button";
      retry.addEventListener("click", renderRoute);
      article.append(retry);
    }
  }

  async function loadCatalog() {
    showLoading("Cargando tu espacio de estudio…");
    try {
      const data = await fetchJson("estudios/index.json", "estudios/");
      catalog = validateCatalog(data);
      await renderRoute();
    } catch (error) {
      catalog = null;
      showError("No se pudo abrir el catálogo", error.message, loadCatalog);
    }
  }

  window.addEventListener("hashchange", renderRoute);
  mobileMenu.addEventListener("change", (event) => {
    const list = document.querySelector("#lesson-list");
    const toggle = document.querySelector(".lesson-menu-toggle");
    if (!list || !toggle) return;
    if (document.querySelector(".reader-mode")) {
      list.hidden = false;
      return;
    }
    list.hidden = event.matches;
    toggle.setAttribute("aria-expanded", "false");
  });
  loadCatalog();

  if ("serviceWorker" in navigator && window.isSecureContext) {
    navigator.serviceWorker.register(new URL("sw.js", baseUrl), { scope: baseUrl.pathname })
      .catch((error) => console.error("No se pudo registrar el modo offline:", error));
  }
})();
