import { detectLoginForm } from "./form-detector";

/**
 * Set an input's value in a way that works with React and other
 * frameworks that override the native value setter.
 */
function setNativeValue(el: HTMLInputElement, value: string): void {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

export function fillForm(username: string, password: string): void {
  const form = detectLoginForm();
  if (!form) return;

  setNativeValue(form.usernameField, username);
  form.usernameField.focus();
  form.usernameField.blur();

  setNativeValue(form.passwordField, password);
  form.passwordField.focus();
  form.passwordField.blur();
}
