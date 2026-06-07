# Roadmap - ECYTV Tools

## Descripción del Proyecto

Plataforma para los estudiantes de la Escuela de Cine y TV de la Universidad Nacional (ECYTV). Centraliza herramientas, formatos y documentación necesaria durante la carrera. Consta de 5 secciones principales: Información, Formatos, Documentación, Herramientas y FAQ.

## Estado Actual

### Implementado

- [x] Definición del concepto y objetivos
- [x] SPA con routing basado en hash (5 rutas: #info, #tools, #formats, #docs, #qa)
- [x] Catálogo de herramientas (50+ herramientas en 9 categorías: Edición, Diseño, Audio, 3D, VFX, Producción, Screenplay, Videojuegos, Encoders)
- [x] Búsqueda y filtros por categoría, nivel, plataforma y precio
- [x] Contador de resultados en herramientas y documentación
- [x] Sistema de favoritos para herramientas (localStorage)
- [x] Sección de información con formulario de solicitud de espacios
- [x] Horarios de estudios (TV, Animación, Cinematografía) vía Google Calendar
- [x] Programación de recursos del Laboratorio de Postproducción e Instrumentos
- [x] Base de datos de casting general de la Escuela
- [x] Generador F1 - Solicitud de Reserva y Préstamo de Equipos (PDF, ODS, XLSX)
- [x] Generador F2 - Acta de Compromiso (PDF)
- [x] Generador F3 - Solicitud de Reserva y Préstamo de Elementos Bodega de Arte (PDF)
- [x] Generador F4 - Solicitud de Reserva y Préstamo Salas de Edición (PDF)
- [x] Historial de formatos generados guardado en localStorage (guardar, restaurar, eliminar)
- [x] Import/Export de formularios en JSON
- [x] Sistema de validación de formularios
- [x] Refactorización de formularios con form-factory (DRY)
- [x] Parser ODS para plantillas de formularios
- [x] Nombres de archivo dinámicos para descargas
- [x] Sección de documentación con manuales de equipos y guías (38 recursos)
- [x] Sección de preguntas frecuentes (FAQ) con acordeón interactivo (8 items)
- [x] Datos de inventario de equipos en JSON (74 tipos de equipos)
- [x] Tema oscuro / claro con persistencia en localStorage
- [x] Diseño responsive con menú hamburguesa
- [x] Accesibilidad WCAG 2.2 AA (ARIA labels, navegación por teclado, skip links, contraste)
- [x] Infraestructura de pruebas: Vitest + jsdom con cobertura (umbrales: statements 75%, branches 80%, functions 75%, lines 70%)
- [x] 39 archivos de tests (515+ pruebas pasando)
- [x] ESLint (flat config) + Prettier configurados
- [x] Documentación de arquitectura (docs/architecture.md)
- [x] Archivos de configuración para agentes AI (AGENTS.md)

### Métricas de Cobertura (Actual)

| Métrica    | Cobertura | Umbral | Estado               |
| ---------- | --------- | ------ | -------------------- |
| Statements | 88.5%     | 75%    | ✅ PASS              |
| Branches   | 79.2%     | 80%    | ⚠️ FAIL (0.8% short) |
| Functions  | 95.66%    | 75%    | ✅ PASS              |
| Lines      | 89.94%    | 70%    | ✅ PASS              |

### Pendiente / En Progreso

- [ ] Corregir test fallido en f4-pdf.test.js (timeout por dynamic import)
- [ ] Mejorar cobertura de branches al 80% (actual: 79.2%)
- [ ] Mejorar cobertura de F3 PDF (actual: 68.86%)
- [ ] Mejorar cobertura de F4 (actual: 17.59%)
- [ ] Vista de equipos con datos del inventario (esqueleto creado, no funcional)
- [ ] Eliminar duplicado de Adobe Premiere Rush en catálogo (Edición + VFX)
- [ ] Mejorar categoría VFX (solo 2 herramientas, una miscategorizada)

## Propuestas y Mejoras Futuras

### Corto Plazo

- [ ] Corregir tests de F4 PDF (dynamic import timeout)
- [ ] Alcanzar 80% de cobertura en branches
- [ ] Mejorar cobertura de F3 y F4 PDF
- [ ] Vista funcional del inventario de equipos con búsqueda y filtros
- [ ] Optimización de iconos SVG (actualmente varios usan default.svg)
- [ ] Eliminar duplicado de Adobe Premiere Rush y agregar Storyboarder
- [ ] Mejorar categoría VFX (reclasificar herramientas)
- [ ] Mejoras en la búsqueda rápida de herramientas (actualmente filtrado básico por nombre, descripción, tags y categoría)

### Mediano Plazo

- [ ] Integración de datos de inventario con el formulario F1 (auto-completado de equipos)
- [ ] Exportación ODS/XLSX para F2, F3, F4 (actualmente solo F1 soporta)
- [ ] Sistema de autenticación con cuentas institucionales
- [ ] Sistema de reserva de equipos en línea
- [ ] Notificaciones de fechas importantes y entregas
- [ ] Panel de administración para gestionar herramientas y contenido

### Largo Plazo

- [ ] App móvil nativa (iOS/Android)
- [ ] Foro de ayuda entre estudiantes
- [ ] Integración con sistemas académicos de la Universidad Nacional
- [ ] Sistema de tickets para soporte técnico
- [ ] Modo offline (Service Worker) para consulta de documentos críticos

## Análisis de Stack Tecnológico

### Stack Actual

| Capa             | Tecnología                                                  |
| ---------------- | ----------------------------------------------------------- |
| Frontend         | HTML5 + CSS3 (custom properties) + Vanilla JS (ES6 modules) |
| Testing          | Vitest + jsdom (39 test files, 515+ tests)                  |
| Calidad          | ESLint (flat config), Prettier                              |
| Dev server       | Python http.server                                          |
| PDF              | jsPDF (CDN)                                                 |
| Hojas de cálculo | SheetJS / JSZip (CDN)                                       |
| Build            | Ninguno                                                     |

### Módulos Compartidos (forms/common/)

10 módulos: dom.js, dropdown.js, esc-html.js, filename.js, form-factory.js, history.js, io-config.js, ods_pdf_renderer.js, parse-ods.js, validation.js

### Fortalezas

- Sin build step, cero configuración
- Sin overhead de framework — carga instantánea
- CSS variables funcionales para tema oscuro/claro
- ES6 modules brindan separación de responsabilidades
- Tests ya configurados con cobertura (statements 75%, branches 80%, functions 75%, lines 70%)

### Debilidades

- Sin tipado — cambios en estructuras de datos rompen en runtime
- DOM imperativo y verbose (innerHTML + event listeners manuales)
- Estado disperso en localStorage sin capa de abstracción
- Dependencias CDN — sin internet no se generan PDF/ODS/XLSX
- Sin optimización de build (minificación, tree-shaking, cache busting)
- Hot reload inexistente

### Recomendación

| Plazo       | Acción                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Corto**   | Mantener stack actual. Opcional: agregar TypeScript via JSDoc para tipado sin build step                                                                |
| **Mediano** | Migrar a Vite + Svelte o Vue antes de implementar autenticación, panel admin o sistema de reservas. Vite se integra nativamente con Vitest ya existente |

La migración no es urgente. El stack actual cumple bien el propósito actual del proyecto. Se recomienda migrar solo cuando se aborden las features de mediano/largo plazo que involucran estado compartido, rutas protegidas y lógica de formularios compleja.

## Notas

Este roadmap es una guía viva que se actualizará conforme evolucione el proyecto y se reciban comentarios de los estudiantes y la escuela.

## Historial de Actualizaciones

| Fecha    | Cambio                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| May 2026 | Actualización completa: F3/F4 completados, accesibilidad WCAG 2.2 AA, métricas de cobertura, 39 test files |
