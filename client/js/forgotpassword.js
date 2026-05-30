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

      "http://localhost:5000/api/auth/forgot-password",

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

    const data =
    await response.json();

    alert(data.message);

    localStorage.setItem(
      "resetEmail",
      email
    );

    window.location.href =
    "reset-password.html";

  } catch(error){

    console.log(error);

  }
});