const loginForm = document.getElementById("loginForm");
const loginButton = loginForm.querySelector("button[type='submit']");

function setLoginLoading(isLoading) {
  if (!loginButton) return;
  loginButton.disabled = isLoading;
  loginButton.innerHTML = isLoading
    ? `<span class="button-spinner"></span>Logging in...`
    : "Login";
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("registered") === "1") {
  showToast("Registration successful. You can now login.", 'success');
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  setLoginLoading(true);

  const matricule = document.getElementById("matricule").value;
  const password = document.getElementById("password").value;

  console.log("Attempting login for:", matricule); // DEBUG

  try {
    const response = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricule, password }),
    });

    const data = await response.json();
    console.log("Response data:", data); // DEBUG - Check if role is here

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const userRole = data.role || (data.user && data.user.role);

      if (userRole === "admin" || userRole === "superadmin") {
        showToast('Login successful', 'success');
        window.location.href = "admin.html";
      } else {
        showToast('Login successful', 'success');
        window.location.href = "dashboard.html";
      }
    } else {
      showToast("Error: " + (data.message || "Invalid credentials"), 'error');
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showToast("Cannot connect to server. Is your backend running on port 5000?", 'error');
  }
  finally {
    setLoginLoading(false);
  }
});