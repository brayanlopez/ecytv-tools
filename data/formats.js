const formats = [
  {
    id: "f1",
    name: "F1 - Solicitud de Reserva y Préstamo de Equipos",
    description:
      "Formato para solicitar la reserva y préstamo de equipos del Laboratorio de Instrumentos de Producción Audiovisual",
    url: "f1-format.html",
    label: "Abrir F1",
    available: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>`,
  },
  {
    id: "f2",
    name: "F2 - Acta de Compromiso",
    description:
      "Acta de compromiso para el uso de equipos y espacios del laboratorio",
    url: "f2-format.html",
    label: "Abrir F2",
    available: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 12l2 2 4-4"/>
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
    </svg>`,
  },
  {
    id: "f3",
    name: "F3 - Solicitud de Reserva y Préstamo de Elementos Bodega de Arte",
    description:
      "Formato para solicitar la reserva y préstamo de elementos de la bodega de arte",
    url: "#",
    label: "Próximamente",
    available: false,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>`,
  },
  {
    id: "f4",
    name: "F4 - Solicitud de Reserva y Préstamo Salas de Edición",
    description:
      "Formato para solicitar la reserva y préstamo de las salas de edición",
    url: "#",
    label: "Próximamente",
    available: false,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>`,
  },
];

export default formats;
