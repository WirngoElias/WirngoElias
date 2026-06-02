const token =
localStorage.getItem("token");

const container =
document.getElementById(
  "electionsContainer"
);

// =========================
// FETCH USER PROFILE
// =========================

async function fetchProfile(){

  try {

    const response = await fetch(
      "http://localhost:5000/api/auth/profile",
      {
        headers:{
          Authorization:token,
        },
      }
    );

    const user =
    await response.json();

    // =========================
    // SIDEBAR WELCOME
    // =========================

    document.getElementById(
      "welcomeFullname"
    ).innerText =
    `Welcome, ${user.fullName}`;

    document.getElementById(
      "welcomeGroup"
    ).innerText =
    user.group;

    // =========================
    // TOPBAR WELCOME
    // =========================

    document.getElementById(
      "welcomeText"
    ).innerText =
    `Welcome Back, ${user.fullName}`;

    document.getElementById(
      "groupText"
    ).innerText =
    `School / Faculty: ${user.group}`;

  } catch(error){

    console.log(error);

  }
}

// =========================
// FETCH ELECTIONS
// =========================

async function fetchElections(){

  try {

    const response = await fetch(
      "http://localhost:5000/api/elections/my-elections",
      {
        headers:{
          Authorization:token,
        },
      }
    );

    const elections =
    await response.json();

    renderElections(elections);

  } catch (error) {

    console.log(error);

  }
}

// =========================
// RENDER ELECTIONS
// =========================

function renderElections(elections){

  container.innerHTML = "";

  elections.forEach((election) => {

    const card =
    document.createElement("div");

    card.classList.add(
      "election-card"
    );

    const ended =
    new Date() >
    new Date(election.endTime);

    card.innerHTML = `

      <div class="election-top">

        <h2>
          ${election.title}
        </h2>

        <span class="
          election-status
          ${
            ended
            ? "closed"
            : "active"
          }
        ">

          ${
            ended
            ? "Closed"
            : "Active"
          }

        </span>

      </div>

      <p class="group-text">

        Group:
        ${election.group}

      </p>

      <p class="timer">

        Ends:
        ${new Date(
          election.endTime
        ).toLocaleString()}

      </p>

      <div class="candidate-list">

        ${election.candidates.map(
          candidate => `

          <div class="candidate-card">

            <div class="candidate-top">

              <img
                src="${
                  candidate.photo ||
                  "http://localhost:5000/uploads/default.png"
                }"
                class="candidate-photo"
              />

              <div class="candidate-info">

                <h3>
                  ${candidate.name}
                </h3>

                <p>
                  ${
                    candidate.speech ||
                    "No speech available"
                  }
                </p>

              </div>

            </div>

            ${
              ended
              ? `

                <button
                  class="vote-btn closed-btn"
                  disabled
                >
                  Election Closed
                </button>

              `

              : election.hasVoted

              ? `

                <button
                  class="vote-btn closed-btn"
                  disabled
                >
                  Already Voted
                </button>

              `

              : `

                <button
                  class="vote-btn"
                  onclick="
                    vote(
                      '${election._id}',
                      '${candidate.name}'
                    )
                  "
                >
                  Vote ${candidate.name}
                </button>

              `
            }

          </div>

        `).join("")}

      </div>

    `;

    container.appendChild(card);

  });
}
// =========================
// CAST VOTE
// =========================

async function vote(
  electionId,
  candidateName
){

  try {

    const response = await fetch(
      "http://localhost:5000/api/vote/cast",
      {
        method:"POST",

        headers:{
          "Content-Type":
          "application/json",

          Authorization:token,
        },

        body:JSON.stringify({
          electionId,
          candidateName,
        }),
      }
    );

    const data = await response.json();

    showToast(data.message || 'Vote processed', response.ok ? 'success' : 'error');

    fetchElections();

  } catch (error) {

    console.log(error);

  }
}

// =========================
// INITIAL LOAD
// =========================

fetchProfile();
fetchElections();

// =========================
// RESULTS PAGE REDIRECT
// =========================

const resultsBtn =
document.getElementById(
  "resultsBtn"
);

if(resultsBtn){

  resultsBtn.addEventListener(
    "click",
    () => {

      window.location.href =
      "result.html";

    }
  );
}

// =========================
// LOGOUT
// =========================

const logoutBtn =
document.getElementById(
  "logoutBtn"
);

if(logoutBtn){

  logoutBtn.addEventListener(
    "click",
    () => {

      localStorage.clear();

      window.location.href =
      "login.html";

    }
  );
}
document.getElementById(
  "resultsBtn"
).addEventListener(
  "click",
  () => {

    window.location.href =
    "result.html";
  }
);