const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const matricule = document.getElementById("matricule").value;
  const password = document.getElementById("password").value;

  console.log("Attempting login for:", matricule); // DEBUG

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricule, password }),
    });

    const data = await response.json();
    console.log("Response data:", data); // DEBUG - Check if role is here

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Improved Redirect Logic
      // Check if role is in data or data.user
      const userRole = data.role || (data.user && data.user.role);

      if (userRole === "admin") {
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
});