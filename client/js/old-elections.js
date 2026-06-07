const token = localStorage.getItem("token");
const container = document.getElementById("electionsContainer");

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
const resultsBtn = document.getElementById("resultsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const electionsBtn = document.getElementById("electionsBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const welcomeFullname = document.getElementById("welcomeFullname");
const welcomeGroup = document.getElementById("welcomeGroup");

async function fetchProfile() {
  try {
    const response = await fetch(buildApiUrl("/api/auth/profile"), {
      headers: { Authorization: token },
    });
    const user = await response.json();

    welcomeFullname.innerText = `Welcome, ${user.fullName}`;
    welcomeGroup.innerText = user.group;
  } catch (error) {
    console.log(error);
  }
}

async function fetchElections() {
  try {
    const response = await fetch(buildApiUrl("/api/elections/my-elections"), {
      headers: { Authorization: token },
    });
    const elections = await response.json();
    if (!Array.isArray(elections)) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Unable to load old elections.</p>
        </div>
      `;
      return;
    }

    const oldElections = elections
      .filter((election) => {
        const now = new Date();
        const endTime = new Date(election.endTime);
        return !election.active || now > endTime;
      })
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    renderElections(oldElections);
  } catch (error) {
    console.log(error);
  }
}

function renderElections(elections) {
  if (elections.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No old elections found for your school or faculty.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  elections.forEach((election) => {
    const card = document.createElement("div");
    card.classList.add("election-card");

    const endTime = new Date(election.endTime);

    card.innerHTML = `
      <div class="election-top">
        <h2>${election.title}</h2>
        <span class="election-status closed">Closed</span>
      </div>
      <p class="group-text">Group: ${election.group}</p>
      <p class="timer">Started: ${new Date(election.startTime).toLocaleString()}</p>
      <p class="timer">Ended: ${endTime.toLocaleString()}</p>
      <div class="candidate-list">
        ${election.candidates
          .map(
            (candidate) => `
          <div class="candidate-card">
            <div class="candidate-top">
              <img src="${candidate.photo ? getPublicUrl(candidate.photo) : buildApiUrl("/uploads/default.png")}" class="candidate-photo" />
              <div class="candidate-info">
                <h3>${candidate.name}</h3>
                <p>${candidate.speech || "No speech available"}</p>
              </div>
            </div>
            ${candidate.video ? `
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
            ` : ``}
          </div>
        `
          )
          .join("")}
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

if (resultsBtn) {
  resultsBtn.addEventListener("click", () => {
    window.location.href = "result.html";
  });
}

if (electionsBtn) {
  electionsBtn.addEventListener("click", () => {
    window.location.href = "elections.html";
  });
}

if (dashboardBtn) {
  dashboardBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

fetchProfile();
fetchElections();
