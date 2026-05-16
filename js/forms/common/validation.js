export function validateForm(form, errorMessage) {
  const required = form.querySelectorAll("[required]");
  let valid = true;
  required.forEach((el) => {
    if (!el.value.trim()) {
      el.style.borderColor = "#e63946";
      valid = false;
    } else {
      el.style.borderColor = "";
    }
  });
  if (!valid)
    window.EcytvUI.showSnackbar(errorMessage, "warning");
  return valid;
}
