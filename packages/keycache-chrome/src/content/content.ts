import { detectLoginForm } from "./form-detector";
import { fillForm } from "./form-filler";

const loginForm = detectLoginForm();

if (loginForm) {
  chrome.runtime.sendMessage({
    from: "content",
    subject: "foundForm",
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.subject === "fillForm") {
      fillForm(msg.username, msg.password);
    }
  });
}
