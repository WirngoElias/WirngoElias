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

      "http://localhost:5000/api/auth/reset-password",

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

    const data =
    await response.json();

    alert(data.message);

    if(response.ok){

      window.location.href =
      "login.html";
    }

  } catch(error){

    console.log(error);

  }
});