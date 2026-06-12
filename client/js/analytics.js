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

  renderAnalyticsLoading();

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

    if (!response.ok) {
      console.error("Analytics API error:", data);
      renderAnalyticsError("Failed to load analytics. Please refresh the page.");
      return;
    }

    renderAnalytics(data);

  }catch(error){

    console.error("Analytics fetch failed:", error);
    renderAnalyticsError("Unable to load analytics. Check your connection.");

  }
}

function renderAnalyticsError(message) {
  container.innerHTML = "";

  const errorCard = document.createElement("div");
  errorCard.classList.add("analytics-error");
  errorCard.textContent = message;

  container.appendChild(errorCard);
}

function renderAnalyticsLoading() {
  container.innerHTML = "";

  const loadingCard = document.createElement("div");
  loadingCard.classList.add("analytics-loading");
  loadingCard.innerHTML = `
    <div class="spinner"></div>
    <p>Loading analytics...</p>
  `;

  container.appendChild(loadingCard);
}

// =========================
// RENDER ANALYTICS
// =========================

function renderAnalytics(data){

  container.innerHTML = "";

  if (!Array.isArray(data)) {
    console.error("Unexpected analytics response:", data);
    renderAnalyticsError("Analytics data is unavailable.");
    return;
  }

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