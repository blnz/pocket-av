export interface LoginFormFields {
  usernameField: HTMLInputElement;
  passwordField: HTMLInputElement;
}

const LOGIN_KEYWORDS = [
  "signin",
  "sign_in",
  "login",
  "log_in",
  "username",
];

function getInputsByType(
  node: HTMLElement,
  type: string,
): HTMLInputElement[] {
  const inputs = node.getElementsByTagName("input");
  const result: HTMLInputElement[] = [];
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type === type) {
      result.push(inputs[i]);
    }
  }
  return result;
}

function isVisible(el: HTMLElement): boolean {
  if (!el.isConnected) return false;

  const style = getComputedStyle(el);
  if (
    style.opacity === "0" ||
    style.display === "none" ||
    style.visibility === "hidden"
  ) {
    return false;
  }

  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function hasLoginKeyword(form: HTMLFormElement): boolean {
  for (const keyword of LOGIN_KEYWORDS) {
    const re = new RegExp(keyword, "i");
    if (
      re.test(form.className) ||
      re.test(form.name) ||
      re.test(form.id) ||
      re.test(form.action)
    ) {
      return true;
    }
  }
  return false;
}

interface FormCandidate {
  usernameField: HTMLInputElement;
  passwordField: HTMLInputElement;
  hasKeyword: boolean;
}

export function detectLoginForm(): LoginFormFields | undefined {
  const forms = document.getElementsByTagName("form");
  let candidates: FormCandidate[] = [];

  for (let i = 0; i < forms.length; i++) {
    const form = forms[i];
    const passwordFields = getInputsByType(form, "password");
    const emailFields = getInputsByType(form, "email");
    const textFields = getInputsByType(form, "text");

    if (passwordFields.length !== 1) continue;
    if (emailFields.length === 0 && textFields.length === 0) continue;

    const usernameField =
      emailFields.length > 0 ? emailFields[0] : textFields[0];

    candidates.push({
      usernameField,
      passwordField: passwordFields[0],
      hasKeyword: hasLoginKeyword(form),
    });
  }

  // Filter to only visible forms
  if (candidates.length > 1) {
    const visible = candidates.filter(
      (c) => isVisible(c.usernameField) && isVisible(c.passwordField),
    );
    if (visible.length > 0) {
      candidates = visible;
    }
  }

  // Prefer forms with login keywords
  if (candidates.length > 1) {
    const withKeyword = candidates.filter((c) => c.hasKeyword);
    if (withKeyword.length > 0) {
      candidates = withKeyword;
    }
  }

  if (candidates.length === 1) {
    return {
      usernameField: candidates[0].usernameField,
      passwordField: candidates[0].passwordField,
    };
  }

  return undefined;
}
