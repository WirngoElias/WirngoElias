document.getElementById(
  "forgotPasswordForm"
).addEventListener(
  "submit",

async (e) => {

  e.preventDefault();

  const matricule =
  document.getElementById(
    "matricule"
  ).value;

  const email =
  document.getElementById(
    "email"
  ).value;

  try {

    const response =
    await fetch(

      buildApiUrl("/api/auth/forgot-password"),

      {
        method:"POST",

        headers:{
          "Content-Type":
          "application/json",
        },

        body:JSON.stringify({
          matricule,
          email,
        }),
      }
    );

    const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'Check your email', 'success');
        localStorage.setItem("resetEmail", email);
        window.location.href = "reset-password.html";
      } else {
        showToast(data.message || 'Failed to send OTP', 'error');
      }

  } catch(error){
    console.error('Forgot password request failed', error);
    showToast('Network error. Please try again.', 'error');
  }
});