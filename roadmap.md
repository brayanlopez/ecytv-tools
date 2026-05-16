# Roadmap - ECYTV Tools

## Descripción del Proyecto

Plataforma para los estudiantes de la Escuela de Cine y TV de la Universidad Nacional (ECYTV). Centraliza herramientas, formatos y documentación necesaria durante la carrera. Consta de 5 secciones principales: Información, Formatos, Documentación, Herramientas y FAQ.

## Estado Actual

### Implementado

- [x] Definición del concepto y objetivos
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
- [x] Historial de formatos generados guardado en localStorage (guardar, restaurar, eliminar)
- [x] Sección de documentación con manuales de equipos y guías (30+ recursos)
- [x] Sección de preguntas frecuentes (FAQ) con acordeón interactivo
- [x] Datos de inventario de equipos en JSON (74 tipos de equipos)
- [x] Tema oscuro / claro con persistencia en localStorage
- [x] Diseño responsive con menú hamburguesa
- [x] Infraestructura de pruebas: Vitest + jsdom con cobertura (umbrales: statements 75%, branches 80%, functions 75%, lines 70%)
- [x] 10 archivos de tests (tools, formats, docs, router, info, qa, f1, f2)

### Pendiente / En Progreso

- [x] F3 - Solicitud de Reserva y Préstamo de Elementos Bodega de Arte
- [x] F4 - Solicitud de Reserva y Préstamo Salas de Edición
- [ ] Vista de equipos con datos del inventario (esqueleto creado, no funcional)
- [x] Mejorar accesibilidad (ARIA labels, navegación por teclado)

## Propuestas y Mejoras Futuras

### Corto Plazo

- [ ] Mejoras en la búsqueda rápida de herramientas (actualmente filtrado básico por nombre, descripción, tags y categoría)
- [x] Finalizar generadores F3 y F4 con descarga en PDF
- [ ] Vista funcional del inventario de equipos con búsqueda y filtros
- [ ] Mejorar accesibilidad (ARIA labels, navegación por teclado, contraste)
- [ ] Optimización de iconos SVG (actualmente varios usan default.svg)

### Mediano Plazo

- [ ] Sistema de autenticación con cuentas institucionales
- [ ] Calendario académico integrado
- [ ] Sistema de reserva de equipos en línea
- [ ] Notificaciones de fechas importantes y entregas
- [ ] Panel de administración para gestionar herramientas y contenido
- [ ] Integración de datos de inventario con el formulario F1 (auto-completado de equipos)

### Largo Plazo

- [ ] App móvil nativa (iOS/Android)
- [ ] Galería de proyectos estudiantiles
- [ ] Foro de ayuda entre estudiantes
- [ ] Integración con sistemas académicos de la Universidad Nacional
- [ ] Dashboard personalizado según el programa académico (Cine, TV, Animación, etc.)
- [ ] Sistema de tickets para soporte técnico
- [ ] Modo offline (Service Worker) para consulta de documentos críticos

## Análisis de Stack Tecnológico

### Stack Actual

| Capa             | Tecnología                                                  |
| ---------------- | ----------------------------------------------------------- |
| Frontend         | HTML5 + CSS3 (custom properties) + Vanilla JS (ES6 modules) |
| Testing          | Vitest + jsdom                                              |
| Calidad          | ESLint, Prettier                                            |
| Dev server       | Python http.server                                          |
| PDF              | jsPDF (CDN)                                                 |
| Hojas de cálculo | SheetJS / JSZip (CDN)                                       |
| Build            | Ninguno                                                     |

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
