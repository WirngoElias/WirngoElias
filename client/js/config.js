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
