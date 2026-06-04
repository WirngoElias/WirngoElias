const token =
localStorage.getItem("token");
if(!token){

  window.location.href =
  "login.html";
}
const toast =
document.getElementById("toast");

function showToast(message){

  toast.innerText = message;

  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  },3000);
}

document.getElementById("themeToggle")
.addEventListener("click", () => {

  document.body.classList.toggle("light");
});

document.getElementById("adminLogout")
.addEventListener("click", () => {

  localStorage.clear();

  window.location.href = "login.html";
});
 let candidates = [];

const candidateList =
document.getElementById("candidateList");

const addCandidateBtn =
document.getElementById("addCandidateBtn");

addCandidateBtn.addEventListener("click", () => {

  const candidateName =
  document.getElementById("candidateName").value;

  const candidateSpeech =
  document.getElementById("candidateSpeech").value;

 const candidatePhotoInput =
document.getElementById("candidatePhoto");

const candidateVideoInput =
document.getElementById("candidateVideo");

const photoFile =
candidatePhotoInput.files[0];

const videoFile =
candidateVideoInput.files[0];

  if(!candidateName){

    showToast("Candidate name required");

    return;
  }

 const candidate = {

  name:candidateName,

  speech:candidateSpeech,

  // PREVIEW URLS
  photo:photoFile
    ? URL.createObjectURL(photoFile)
    : null,

  video:videoFile
    ? URL.createObjectURL(videoFile)
    : null,

  // REAL FILES FOR SERVER UPLOAD
  photoFile,

  videoFile,
};
  candidates.push(candidate);

  renderCandidates();

  document.getElementById("candidateName").value = "";

  document.getElementById("candidateSpeech").value = "";

  document.getElementById("candidatePhoto").value = "";

  document.getElementById("candidateVideo").value = "";

  showToast("Candidate added");
});
function renderCandidates(){

  candidateList.innerHTML = "";

  candidates.forEach((candidate,index) => {

    const div = document.createElement("div");

    div.classList.add("candidate-item");

    div.innerHTML = `

      <div class="candidate-header">

        <div class="candidate-profile">

          <img
            src="${
              candidate.photo ||
              './images/plug.jpg'
            }"
            class="candidate-photo"
          />

          <h4>
            ${candidate.name}
          </h4>

        </div>

        <button
          class="remove-candidate"
          onclick="removeCandidate(${index})"
        >
          Remove
        </button>

      </div>

      ${
        candidate.video
        ? `
          <video
            controls
            class="candidate-video"
          >
            <source
              src="${candidate.video}"
              type="video/mp4"
            />
          </video>
        `
        : ""
      }

      <div class="candidate-speech">

        ${
          candidate.speech ||
          "No speech added"
        }

      </div>

    `;

    candidateList.appendChild(div);

  });
}
function removeCandidate(index){

  candidates.splice(index,1);

  renderCandidates();

  showToast("Candidate removed");
}


// CREATE ELECTION
document.getElementById(
  "electionForm"
).addEventListener(
  "submit",

async (e) => {

  e.preventDefault();

  const title =
  document.getElementById(
    "title"
  ).value;

  const group =
  document.getElementById(
    "group"
  ).value;

  const duration =
  document.getElementById(
    "duration"
  ).value;

  const formData =
  new FormData();

  formData.append(
    "title",
    title
  );

  formData.append(
    "group",
    group
  );

  formData.append(
    "duration",
    duration
  );

  const cleanCandidates =
candidates.map(candidate => ({

  name:candidate.name,

  speech:candidate.speech,

}));

formData.append(
  "candidates",
  JSON.stringify(cleanCandidates)
);

  candidates.forEach(
    (candidate) => {

      if(candidate.photoFile){

        formData.append(
          "candidatePhotos",
          candidate.photoFile
        );
      }

      if(candidate.videoFile){

        formData.append(
          "candidateVideos",
          candidate.videoFile
        );
      }
    }
  );

  try {

    const response =
    await fetch(

      buildApiUrl("/api/admin/create-election"),

      {
        method:"POST",

        headers:{
          Authorization:token,
        },

        body:formData,
      }
    );

    const data =
    await response.json();

    showToast(
      data.message
    );

  } catch(error){

    console.log(error);

    showToast(
      "Server error"
    );
  }
});


// FETCH STATS
// FETCH STATS
async function fetchStats(){

  try {

    const response = await fetch(
      buildApiUrl("/api/admin/stats"),
      {
        headers:{
          Authorization:token,
        },
      }
    );

    if(!response.ok){

      throw new Error(
        "Failed to fetch stats"
      );
    }

    const data =
    await response.json();

    const container =
    document.getElementById(
      "statsContainer"
    );

    container.innerHTML = "";

    // SAFETY CHECK
    if(
      !data.stats ||
      !Array.isArray(data.stats)
    ){

      container.innerHTML = `

        <div class="stat-card">

          <h3>
            No analytics available
          </h3>

        </div>

      `;

      return;
    }

    data.stats.forEach((stat) => {

      const card =
      document.createElement("div");

      card.classList.add("stat-card");

      card.innerHTML = `

        <h3>
          ${stat.group}
        </h3>

        <p>
          Registered:
          ${stat.registered}
        </p>

        <p>
          Voted:
          ${stat.voted}
        </p>

        <p>
          Not Voted:
          ${stat.notVoted}
        </p>

        <p>
          Turnout:
          ${stat.turnout}%
        </p>

        <div class="progress">

          <div
            class="progress-bar"
            style="
              width:${stat.turnout}%
            "
          ></div>

        </div>

      `;

      container.appendChild(card);

    });

  } catch (error) {

    console.log(error);

    const container =
    document.getElementById(
      "statsContainer"
    );

    container.innerHTML = `

      <div class="stat-card">

        <h3>
          Failed to load analytics
        </h3>

      </div>

    `;
  }
}

// =========================
// AUDIT LOGS
// =========================

let currentPage = 1;

async function fetchAuditLogs(page = 1){

  try {

    currentPage = page;

    const search =
    document.getElementById(
      "searchUser"
    ).value;

    const action =
    document.getElementById(
      "filterAction"
    ).value;

    const response = await fetch(

      buildApiUrl(`/api/admin/audit-logs?page=${page}&limit=10&search=${search}&action=${action}`),

      {
        headers:{
          Authorization:token,
        },
      }
    );

    if(!response.ok){

      throw new Error(
        "Failed to fetch audit logs"
      );
    }

    const data =
    await response.json();

    const tbody =
    document.getElementById(
      "auditTableBody"
    );

    tbody.innerHTML = "";

    if(
      !data.logs ||
      data.logs.length === 0
    ){

      tbody.innerHTML = `

        <tr>

          <td colspan="5">
            No audit logs found
          </td>

        </tr>

      `;

      return;
    }

    data.logs.forEach((log) => {

      const row =
      document.createElement("tr");

      row.innerHTML = `

        <td>
          ${log.action}
        </td>

        <td>
          ${
            log.userId
            ? log.userId.matricule
            : "Unknown"
          }
        </td>

        <td>
          ${
            log.userId
            ? log.userId.group
            : "-"
          }
        </td>

        <td>
          ${log.details}
        </td>

        <td>
          ${new Date(
            log.createdAt
          ).toLocaleString()}
        </td>

      `;

      tbody.appendChild(row);

    });

    renderPagination(
      data.totalPages,
      data.currentPage
    );

  } catch(error){

    console.log(error);

  }
}

function renderPagination(
  totalPages,
  currentPage
){

  const pagination =
  document.getElementById(
    "pagination"
  );

  pagination.innerHTML = "";

  for(
    let i = 1;
    i <= totalPages;
    i++
  ){

    const btn =
    document.createElement("button");

    btn.innerText = i;

    btn.classList.add(
      "page-btn"
    );

    if(i === currentPage){

      btn.classList.add(
        "active"
      );
    }

    btn.addEventListener(
      "click",
      () => {

        fetchAuditLogs(i);
      }
    );

    pagination.appendChild(btn);
  }
}

// FILTER EVENTS

document.getElementById(
  "searchUser"
).addEventListener(
  "input",
  () => fetchAuditLogs(1)
);

document.getElementById(
  "filterAction"
).addEventListener(
  "change",
  () => fetchAuditLogs(1)
);

// INITIAL LOAD

fetchStats();

fetchAuditLogs();
document.getElementById(
  "resultsBtn"
).addEventListener(
  "click",
  () => {

    window.location.href =
    "result.html";
  }
);
document
.getElementById("analyticsBtn")
.addEventListener(
  "click",
  () => {
    window.location.href =
    "./analytics.html";
  }
);