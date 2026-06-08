// Auth Guard: Redirect to login if no token
function requireAuth() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  
  return true;
}

// Check auth on page load
document.addEventListener("DOMContentLoaded", requireAuth);
