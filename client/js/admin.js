const token =
localStorage.getItem("token");
if(!token){

  window.location.href =
  "login.html";
}
const toast =
document.getElementById("toast");

let currentUser = null;
const subadminSection = document.getElementById("subadminSection");
const createSubAdminForm = document.getElementById("createSubAdminForm");
const createSubAdminButton = document.getElementById("createSubAdminBtn");

async function fetchProfile() {
  try {
    const response = await fetch(buildApiUrl("/api/auth/profile"), {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    currentUser = await response.json();
    applyAdminView();
  } catch (error) {
    console.error(error);
    showToast("Unable to load admin profile");
  }
}

function showSection(id){
  const sections = [
    document.getElementById('createElectionSection'),
    document.getElementById('subadminSection'),
    document.getElementById('auditSection') || document.querySelector('.audit-section')
  ];

  sections.forEach(s => {
    if(!s) return;
    if(s.id === id) s.style.display = 'block';
    else s.style.display = 'none';
  });
}

function validateMatriculeForGroup(matricule, group){
  if(!matricule || !group) return false;
  if(!matricule.startsWith('UBa')) return false;
  if(matricule.length !== 10) return false;

  const remaining = matricule.slice(3);
  const schoolCode = remaining.slice(2,4);

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

  const expected = schoolCodes[group];
  if(!expected) return false;

  return schoolCode === expected;
}

function applyAdminView() {
  const groupSelect = document.getElementById("group");

  if (!currentUser) {
    return;
  }

  if (currentUser.role !== "superadmin") {
    if (groupSelect) {
      groupSelect.value = currentUser.group || "";
      groupSelect.disabled = true;
    }
  }

  // Do not show subadmin form on initial load; show when nav clicked
  const createElectionSection = document.getElementById('createElectionSection');
  if (createElectionSection) createElectionSection.style.display = 'block';
  if (subadminSection) subadminSection.style.display = 'none';
}

function setButtonLoading(button, isLoading, text) {
  if (!button) return;
  button.disabled = isLoading;
  if (isLoading) {
    button.innerHTML = `<span class="button-spinner"></span> ${text}`;
    button.style.opacity = "0.75";
  } else {
    button.innerHTML = text;
    button.style.opacity = "1";
  }
}

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

const navToggle = document.getElementById("navToggle");
const adminSidebar = document.querySelector(".admin-sidebar");

if (navToggle && adminSidebar) {
  navToggle.addEventListener("click", () => {
    adminSidebar.classList.toggle("open");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      adminSidebar.classList.remove("open");
    }
  });

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 900 &&
      adminSidebar.classList.contains("open") &&
      !adminSidebar.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      adminSidebar.classList.remove("open");
    }
  });
}

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

  const createElectionButton = document.querySelector(
    "#electionForm button[type='submit']"
  );

  try {
    setButtonLoading(createElectionButton, true, "Creating...");

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
  } finally {
    setButtonLoading(createElectionButton, false, "Create Election");
  }
});

if (createSubAdminForm) {
  createSubAdminForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("subadminFullName").value;
    const matricule = document.getElementById("subadminMatricule").value;
    const email = document.getElementById("subadminEmail").value;
    const password = document.getElementById("subadminPassword").value;
    const group = document.getElementById("subadminGroup").value;

    if (!fullName || !matricule || !email || !password || !group) {
      showToast("All fields are required");
      return;
    }

    // validate matricule <-> group mapping
    if(!validateMatriculeForGroup(matricule, group)){
      showToast("Matricule does not match selected school/faculty");
      return;
    }

    setButtonLoading(createSubAdminButton, true, "Creating...");

    try {
      const response = await fetch(buildApiUrl("/api/admin/create-sub-admin"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ fullName, matricule, email, password, group }),
      });

      const data = await response.json();
      showToast(data.message || "Sub-admin created");

      if (response.ok) {
        createSubAdminForm.reset();
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to create sub-admin");
    } finally {
      setButtonLoading(createSubAdminButton, false, "Create Sub-admin");
    }
  });
}


// FETCH STATS
// FETCH STATS
async function fetchStats(){

  try {

    renderStatsLoading();

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

function renderStatsLoading() {
  const container = document.getElementById("statsContainer");
  if (!container) return;
  container.innerHTML = `
    <div class="stat-card admin-loading">
      <div class="spinner"></div>
      <h3>Loading stats...</h3>
    </div>
  `;
}

function renderAuditLoading() {
  const tbody = document.getElementById("auditTableBody");
  if (!tbody) return;
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="loading-row">
        <div class="spinner"></div>
        Loading audit logs...
      </td>
    </tr>
  `;
}

async function fetchSubadmins() {
  const select = document.getElementById("filterUserSelect");
  if (!select) return;

  try {
    const resp = await fetch(buildApiUrl("/api/admin/subadmins"), {
      headers: { Authorization: token },
    });

    if (!resp.ok) return;

    const list = await resp.json();

    // populate
    select.innerHTML = '<option value="">All Subadmins</option>';
    list.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u._id;
      opt.text = `${u.matricule} - ${u.fullName} (${u.group})`;
      select.appendChild(opt);
    });

    select.style.display = "inline-block";
    select.addEventListener("change", () => fetchAuditLogs(1));
  } catch (error) {
    console.error("Failed to load subadmins", error);
  }
}

// =========================
// AUDIT LOGS
// =========================

let currentPage = 1;

async function fetchAuditLogs(page = 1){

  try {

    currentPage = page;

    renderAuditLoading();

    const search =
    document.getElementById(
      "searchUser"
    ).value;

    const action =
    document.getElementById(
      "filterAction"
    ).value;

    const userId = document.getElementById("filterUserSelect")
      ? document.getElementById("filterUserSelect").value
      : "";

    let url = `/api/admin/audit-logs?page=${page}&limit=10&search=${encodeURIComponent(
      search
    )}&action=${encodeURIComponent(action)}`;

    if (userId) {
      url += `&userId=${encodeURIComponent(userId)}`;
    }

    const response = await fetch(buildApiUrl(url), {
      headers: {
        Authorization: token,
      },
    });

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

fetchProfile().then(() => {
  fetchStats();
  // load subadmins only for superadmin
  if (currentUser && currentUser.role === "superadmin") {
    fetchSubadmins();
  }
  fetchAuditLogs();
});

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

// Sidebar nav handlers
const createElectionNav = document.getElementById('createElectionNav');
const createSubAdminNav = document.getElementById('createSubAdminNav');

if(createElectionNav){
  createElectionNav.addEventListener('click', () => {
    showSection('createElectionSection');
  });
}

if(createSubAdminNav){
  createSubAdminNav.addEventListener('click', () => {
    showSection('subadminSection');
  });
}