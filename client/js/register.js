// Matricule format validator
// Format: UBa[YY][XX][NNN]
// UBa = prefix, YY = year (21+), XX = school code, NNN = 3 digits
const validateMatricule = (matricule, group) => {
  const schoolCodes = {
    "NAHPI": "NA",
    "COLTECH": "CO",
    "HITL": "HI",
    "HICM": "HI",
    "HTTC": "HT",
    "HTTTC": "HT",
    "FED": "FE",
    "FS": "FS",
    "FHS": "FH",
    "FLPS": "FL",
    "FA": "FA",
    "FEMS": "FE",
  };

  // Check prefix
  if (!matricule.startsWith("UBa")) {
    return { valid: false, message: "Matricule must start with 'UBa'" };
  }

  const remaining = matricule.slice(3); // Remove 'UBa'

  // Check total length (should be 10: UBa + 2 digits + 2 letters + 3 digits)
  if (matricule.length !== 10) {
    return { valid: false, message: "Matricule must be exactly 10 characters (UBa + 2-digit year + 2-letter school code + 3 digits)" };
  }

  // Extract year
  const yearStr = remaining.slice(0, 2);
  const year = parseInt(yearStr);

  if (isNaN(year)) {
    return { valid: false, message: "Year must be numeric (e.g., 21 for 2021)" };
  }

  if (year < 21) {
    return { valid: false, message: "Year of entry must be 21 or later (2021+)" };
  }

  // Extract school code
  const schoolCode = remaining.slice(2, 4);

  // Validate school code matches group
  const expectedCode = schoolCodes[group];
  if (!expectedCode) {
    return { valid: false, message: "Invalid school/faculty selected" };
  }

  if (schoolCode !== expectedCode) {
    return { valid: false, message: `School code must be '${expectedCode}' for ${group}` };
  }

  // Extract and validate numbers
  const numbersStr = remaining.slice(4, 7);
  const numbers = parseInt(numbersStr);

  if (isNaN(numbers) || numbersStr.length !== 3) {
    return { valid: false, message: "Last 3 characters must be digits (000-999)" };
  }

  return { valid: true, message: "" };
};

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const matricule = document.getElementById("matricule").value;
  const email = document.getElementById("email").value;
  const dob = document.getElementById("dob").value;
  const group = document.getElementById("group").value;
  const password = document.getElementById("password").value;

  // Client-side matricule validation
  const validation = validateMatricule(matricule, group);
  if (!validation.valid) {
    showToast(`Invalid Matricule: ${validation.message}`, 'error');
    return;
  }

  const data = {
    fullName,
    matricule,
    email,
    dob,
    group,
    password,
  };

  try {

    const response = await fetch(
      buildApiUrl("/api/auth/register"),
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

      window.location.href = "login.html?registered=1";

    }else{
      showToast(result.message || 'Registration failed', 'error');
    }

  } catch (error) {

    showToast("Server error", 'error');

  }
});