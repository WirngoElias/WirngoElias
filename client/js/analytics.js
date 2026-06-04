const token =
localStorage.getItem("token");

const container =
document.getElementById(
  "analyticsContainer"
);

// =========================
// FETCH ANALYTICS
// =========================

async function fetchAnalytics(){

  try{

    const response =
    await fetch(
      buildApiUrl("/api/admin/analytics"),
      {
        headers:{
          Authorization:token
        }
      }
    );

    const data =
    await response.json();

    renderAnalytics(data);

  }catch(error){

    console.log(error);

  }
}

// =========================
// RENDER ANALYTICS
// =========================

function renderAnalytics(data){

  container.innerHTML = "";

  data.forEach((group)=>{

    const card =
    document.createElement("div");

    card.classList.add(
      "analytics-card"
    );

    card.innerHTML = `

      <h2>
        ${group.group}
      </h2>

      <div class="stat-row">

        <span class="stat-label">
          Registered
        </span>

        <span class="stat-value">
          ${group.registered}
        </span>

      </div>

      <div class="stat-row">

        <span class="stat-label">
          Voted
        </span>

        <span class="stat-value">
          ${group.voted}
        </span>

      </div>

      <div class="stat-row">

        <span class="stat-label">
          Not Voted
        </span>

        <span class="stat-value">
          ${group.notVoted}
        </span>

      </div>

      <div class="stat-row">

        <span class="stat-label">
          Participation
        </span>

        <span class="stat-value">
          ${group.participation}%
        </span>

      </div>

    `;

    container.appendChild(card);

  });
}

// =========================
// INITIAL LOAD
// =========================

fetchAnalytics();