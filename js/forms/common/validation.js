export function validateForm(form, errorMessage) {
  const required = form.querySelectorAll("[required]");
  let valid = true;
  let firstInvalid = null;
  required.forEach((el) => {
    if (!el.value.trim()) {
      el.style.borderColor = "#e63946";
      el.setAttribute("aria-invalid", "true");
      if (!firstInvalid) firstInvalid = el;
      valid = false;
    } else {
      el.style.borderColor = "";
      el.removeAttribute("aria-invalid");
    }
  });
  if (!valid) {
    window.EcytvUI.showSnackbar(errorMessage, "warning");
    if (firstInvalid) firstInvalid.focus();
  }
  return valid;
}
