let snackbarContainer = null;
let modalOverlay = null;
let currentModalResolve = null;

const SNACKBAR_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

function ensureSnackbarContainer() {
  if (!snackbarContainer) {
    snackbarContainer = document.createElement("div");
    snackbarContainer.className = "snackbar-container";
    document.body.appendChild(snackbarContainer);
  }
  return snackbarContainer;
}

function dismissSnackbar(el) {
  el.classList.remove("show");
  el.addEventListener("transitionend", () => el.remove(), { once: true });
}

function showSnackbar(message, type = "info", duration = 4000) {
  const container = ensureSnackbarContainer();
  const el = document.createElement("div");
  el.className = "snackbar snackbar-" + type;
  el.innerHTML =
    '<span class="snackbar-icon">' +
    (SNACKBAR_ICONS[type] || SNACKBAR_ICONS.info) +
    '</span><span class="snackbar-message"></span><button class="snackbar-close" aria-label="Cerrar">&times;</button>';
  el.querySelector(".snackbar-message").textContent = message;
  el.querySelector(".snackbar-close").addEventListener("click", () => {
    dismissSnackbar(el);
  });
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  if (duration > 0) {
    setTimeout(() => dismissSnackbar(el), duration);
  }
  return el;
}

function ensureModal() {
  if (!modalOverlay) {
    modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><h3 class="modal-title"></h3><button class="modal-close" aria-label="Cerrar">&times;</button></div><div class="modal-body"></div><div class="modal-footer"></div></div>';

    modalOverlay.querySelector(".modal-close").addEventListener("click", () => {
      closeModal(null);
    });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal(null);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
        closeModal(null);
      }
    });

    document.body.appendChild(modalOverlay);
  }
  return modalOverlay;
}

function showModal(options = {}) {
  const {
    title = "Confirmar",
    message = "",
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    onConfirm = null,
    onCancel = null,
    type = "confirm",
  } = options;

  const overlay = ensureModal();
  const modal = overlay.querySelector(".modal");

  modal.querySelector(".modal-title").textContent = title;
  const bodyEl = modal.querySelector(".modal-body");
  bodyEl.innerHTML = '<p class="modal-message"></p>';
  bodyEl.querySelector(".modal-message").textContent = message;

  const footer = modal.querySelector(".modal-footer");
  footer.innerHTML = "";

  if (type === "confirm") {
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-secondary";
    cancelBtn.textContent = cancelText;
    cancelBtn.addEventListener("click", () => {
      closeModal(false);
      if (onCancel) onCancel();
    });
    footer.appendChild(cancelBtn);
  }

  const confirmBtn = document.createElement("button");
  confirmBtn.className = "btn btn-primary";
  confirmBtn.textContent = confirmText;
  confirmBtn.addEventListener("click", () => {
    closeModal(true);
    if (onConfirm) onConfirm();
  });
  footer.appendChild(confirmBtn);

  overlay.classList.add("show");

  return new Promise((resolve) => {
    currentModalResolve = resolve;
  });
}

function closeModal(result) {
  if (modalOverlay) {
    modalOverlay.classList.remove("show");
  }
  if (currentModalResolve) {
    currentModalResolve(result);
    currentModalResolve = null;
  }
}

window.EcytvUI = { showSnackbar, showModal, closeModal };
