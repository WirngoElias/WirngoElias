const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    fullName: document.getElementById("fullName").value,
    matricule: document.getElementById("matricule").value,
    email: document.getElementById("email").value,
    dob: document.getElementById("dob").value,
    group: document.getElementById("group").value,
    password: document.getElementById("password").value,
  };

  try {

    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(data),
      }
    );

    const result = await response.json();

    if(response.ok){

      alert("Registration successful");

      window.location.href = "login.html";

    }else{
      alert(result.message);
    }

  } catch (error) {

    alert("Server error");

  }
});