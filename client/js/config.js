const API_BASE_URL = document.querySelector('meta[name="api-base-url"]')?.content?.trim() || "";

function buildApiUrl(path) {
  if (!path.startsWith("/")) {
    return path;
  }

  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}
