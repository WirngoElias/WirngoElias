document.getElementById(
  "resetPasswordForm"
).addEventListener(
  "submit",

async (e) => {

  e.preventDefault();

  const otp =
  document.getElementById(
    "otp"
  ).value;

  const newPassword =
  document.getElementById(
    "newPassword"
  ).value;

  const email =
  localStorage.getItem(
    "resetEmail"
  );

  try {

    const response =
    await fetch(

      buildApiUrl("/api/auth/reset-password"),

      {
        method:"POST",

        headers:{
          "Content-Type":
          "application/json",
        },

        body:JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    showToast(data.message || 'Operation complete', response.ok ? 'success' : 'error');

    if(response.ok){
      window.location.href = "login.html";
    }

  } catch(error){

    console.log(error);

  }
});