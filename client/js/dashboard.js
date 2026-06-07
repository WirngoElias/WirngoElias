const token =
localStorage.getItem("token");

const container =
document.getElementById(
  "electionsContainer"
);

const viewOldBtn =
document.getElementById(
  "viewOldBtn"
);

function getPublicUrl(resourcePath) {
  if (!resourcePath) {
    return "";
  }
  if (
    resourcePath.startsWith("http://") ||
    resourcePath.startsWith("https://")
  ) {
    return resourcePath;
  }
  if (resourcePath.startsWith("/")) {
    return buildApiUrl(resourcePath);
  }
  return resourcePath;
}

const electionsBtn =
document.getElementById(
  "electionsBtn"
);

const dashboardBtn =
document.getElementById(
  "dashboardBtn"
);

const navToggle =
document.getElementById(
  "navToggle"
);

const sidebar =
document.querySelector(
  ".sidebar"
);

if (navToggle && sidebar) {
  navToggle.addEventListener(
    "click",
    () => {
      sidebar.classList.toggle("open");
    }
  );

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 900) {
        sidebar.classList.remove("open");
      }
    }
  );

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 900 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      sidebar.classList.remove("open");
    }
  });
}

// =========================
// FETCH USER PROFILE
// =========================

async function fetchProfile(){

  try {

    const response = await fetch(
      buildApiUrl("/api/auth/profile"),
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
      buildApiUrl("/api/elections/my-elections"),
      {
        headers:{
          Authorization:token,
        },
      }
    );

    const elections =
    await response.json();

    const activeElections =
      elections.filter((election) => {
        const now = new Date();
        const startTime = new Date(election.startTime);
        const endTime = new Date(election.endTime);
        return now >= startTime && now <= endTime;
      });

    renderElections(activeElections);

  } catch (error) {

    console.log(error);

  }
}

// =========================
// RENDER ELECTIONS
// =========================

function renderElections(elections){

  if (elections.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No active election is available right now.</p>
        <p>You can still view old elections for your school or faculty.</p>
      </div>
    `;
    return;
  }

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
                  candidate.photo
                    ? getPublicUrl(candidate.photo)
                    : buildApiUrl("/uploads/default.png")
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
              candidate.video
              ? `
                <div class="candidate-video-wrapper">
                  <video controls class="candidate-video">
                    <source src="${getPublicUrl(candidate.video)}" />
                    Your browser does not support the video tag.
                  </video>
                  <div class="candidate-video-controls">
                    <button class="play-speech-btn" type="button" onclick="playSpeech(this)">
                      <i class="fa-solid fa-circle-play"></i>
                      Play Speech
                    </button>
                    <button class="fullscreen-btn" type="button" onclick="openFullScreen(this)">
                      <i class="fa-solid fa-expand"></i>
                      Fullscreen
                    </button>
                  </div>
                </div>
              `
              : ""
            }

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

window.playSpeech = function(button){
  const card = button.closest(".candidate-card");
  const video = card?.querySelector("video");
  if(video){
    video.scrollIntoView({ behavior:"smooth", block:"center" });
    video.play();
  }
};

window.openFullScreen = function(button){
  const card = button.closest(".candidate-card");
  const video = card?.querySelector("video");
  if(video){
    if(video.requestFullscreen){
      video.requestFullscreen();
    } else if(video.webkitEnterFullscreen){
      video.webkitEnterFullscreen();
    } else if(video.webkitRequestFullscreen){
      video.webkitRequestFullscreen();
    } else if(video.mozRequestFullScreen){
      video.mozRequestFullScreen();
    } else if(video.msRequestFullscreen){
      video.msRequestFullscreen();
    }
  }
};

// =========================
// CAST VOTE
// =========================

async function vote(
  electionId,
  candidateName
){

  try {

    const response = await fetch(
      buildApiUrl("/api/vote/cast"),
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

if(electionsBtn){
  electionsBtn.addEventListener("click", () => {
    window.location.href = "elections.html";
  });
}

if(viewOldBtn){
  viewOldBtn.addEventListener("click", () => {
    window.location.href = "old-elections.html";
  });
}

if(dashboardBtn){
  dashboardBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
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
