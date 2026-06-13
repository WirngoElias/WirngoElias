const apiMeta = document.querySelector('meta[name="api-base-url"]')?.content?.trim();

const API_BASE_URL = (() => {
  if (!apiMeta) {
    return "";
  }

  const isLocalhostMeta = apiMeta === "http://localhost:5000";
  const isLocalhostHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

  if (isLocalhostMeta && !isLocalhostHost) {
    return `${window.location.protocol}//${window.location.host}`;
  }

  return apiMeta;
})();

function buildApiUrl(path) {
  if (!path.startsWith("/")) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

function setupPasswordToggle() {
  const WRAPPER_CLASS = "password-toggle-field";
  const BUTTON_CLASS = "password-toggle-btn";

  document.querySelectorAll('input[type="password"]').forEach((input) => {
    if (input.closest(`.${WRAPPER_CLASS}`)) return;

    const wrapper = document.createElement("div");
    wrapper.className = WRAPPER_CLASS;
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.setAttribute("aria-label", "Show password");
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;\n    wrapper.appendChild(button);

    let persistentVisible = false;
    let skipToggle = false;
    let pressedAt = 0;

    const showPassword = () => {
      input.type = "text";
      button.classList.add("visible");
      button.setAttribute("aria-label", "Hide password");
    };

    const hidePassword = () => {
      input.type = "password";
      button.classList.remove("visible");
      button.setAttribute("aria-label", "Show password");
    };

    button.addEventListener("pointerdown", () => {
      pressedAt = Date.now();
      if (!persistentVisible) {
        showPassword();
      }
    });

    button.addEventListener("pointerup", () => {
      const holdTime = Date.now() - pressedAt;
      if (!persistentVisible) {
        hidePassword();
      }
      if (holdTime > 200) {
        skipToggle = true;
      }
    });

    button.addEventListener("pointerleave", () => {
      if (!persistentVisible) {
        hidePassword();
      }
    });

    button.addEventListener("click", (event) => {
      if (skipToggle) {
        skipToggle = false;
        event.preventDefault();
        return;
      }
      event.preventDefault();
      persistentVisible = !persistentVisible;
      if (persistentVisible) {
        showPassword();
      } else {
        hidePassword();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", setupPasswordToggle);
