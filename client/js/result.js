let allResults = [];

const token =
localStorage.getItem("token");

const container =
document.getElementById(
  "resultsContainer"
);

const searchContainer =
document.querySelector(
  ".results-search"
);

const schoolSearch =
document.getElementById(
  "schoolSearch"
);

let currentUserRole = "";

// =========================
// GET USER PROFILE
// =========================

async function getProfile(){

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

    console.log(user);

    currentUserRole =
    user.role;

    // SHOW SEARCH ONLY FOR ADMIN
    if(
      currentUserRole &&
      currentUserRole === "admin"
    ){

      if(searchContainer){

        searchContainer.style.display =
        "block";
      }
    }

    else{

      if(searchContainer){

        searchContainer.style.display =
        "none";
      }
    }

    // LOAD RESULTS
    fetchResults();

  } catch(error){

    console.log(error);
  }
}

// =========================
// FETCH RESULTS
// =========================

function renderResultsLoading() {
  if (!container) return;
  container.innerHTML = `
    <div class="result-card result-loading">
      <div class="spinner"></div>
      <h2>Loading results...</h2>
    </div>
  `;
}

function renderResultsError(message) {
  if (!container) return;
  container.innerHTML = `
    <div class="result-card result-loading">
      <h2>${message}</h2>
    </div>
  `;
}

async function fetchResults(){

  renderResultsLoading();

  try {

    const response = await fetch(
      buildApiUrl("/api/elections/results"),
      {
        headers:{
          Authorization:token,
        },
      }
    );

    const results =
    await response.json();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Results API error:", errorData);
      renderResultsError("Failed to load results. Please refresh.");
      return;
    }

    allResults = results.sort((a,b) => {
      const aTime = a.startTime
        ? new Date(a.startTime)
        : new Date(a.endTime || 0);
      const bTime = b.startTime
        ? new Date(b.startTime)
        : new Date(b.endTime || 0);
      return bTime - aTime;
    });

    // ADMIN FILTER
    if(currentUserRole === "admin"){

      applyFilter();
    }

    // NORMAL USER
    else{

      renderResults(allResults);
    }

  } catch (error) {

    console.error(error);
    renderResultsError("Unable to load results. Check your connection.");

  }
}

// =========================
// FILTER RESULTS
// =========================

function applyFilter(){

  const search =
    schoolSearch
    ? schoolSearch.value
        .toLowerCase()
        .trim()
    : "";

  const filteredResults =
  allResults.filter(
    election =>

      election.group
      .toLowerCase()
      .includes(search)
  );

  renderResults(
    filteredResults
  );
}

// =========================
// RENDER RESULTS
// =========================

function renderResults(results){

  container.innerHTML = "";

  if(results.length === 0){

    container.innerHTML = `

      <div class="result-card">

        <h2>
          No Results Found
        </h2>

      </div>

    `;

    return;
  }

  results.forEach((election) => {

    const card =
    document.createElement("div");

    card.classList.add(
      "result-card"
    );

    // HIGHEST VOTES
    const highestVotes =
    Math.max(
      ...election.candidates.map(
        c => c.votes
      )
    );

    // LEADERS
    const leaders =
    election.candidates.filter(
      c => c.votes === highestVotes
    );

    let statusText = "";

    // ACTIVE ELECTION
    if(election.active){

      if(highestVotes === 0){

        statusText = `

          <div class="winner-box tie-box">

            Tie

          </div>

        `;
      }

      else if(leaders.length === 1){

        statusText = `

          <div class="winner-box leading-box">

            <strong>
              ${leaders[0].name}
            </strong>

            is Leading

            (${leaders[0].votes} votes)

          </div>

        `;
      }

      else{

        statusText = `

          <div class="winner-box tie-box">

            Tie

          </div>

        `;
      }
    }

    // CLOSED ELECTION
    else{

      if(
        leaders.length === 1 &&
        highestVotes > 0
      ){

        statusText = `

          <div class="winner-box winner-final">

            Winner:
            <strong>
              ${leaders[0].name}
            </strong>

            (${leaders[0].votes} votes)

          </div>

        `;
      }

      else{

        statusText = `

          <div class="winner-box tie-box">

            Election Ended In A Tie

          </div>

        `;
      }
    }

    // CARD HTML
    card.innerHTML = `

      <div class="result-top">

        <h2>
          ${election.title}
        </h2>

        <span class="
          status
          ${
            election.active
            ? "active"
            : "closed"
          }
        ">

          ${
            election.active
            ? "OPEN"
            : "CLOSED"
          }

        </span>

      </div>

      <p>

        Group:
        ${election.group}

      </p>

      <p>

        Total Votes:
        ${election.totalVotes}

      </p>

      ${statusText}

      <div class="candidate-results">

        ${election.candidates.map(
          candidate => `

          <div class="candidate-result">

            <div class="candidate-row">

              <span>
                ${candidate.name}
              </span>

              <span>
                ${candidate.votes}
                votes
              </span>

            </div>

            <div class="progress">

              <div
                class="progress-bar"
                style="
                  width:
                  ${candidate.percentage}%
                "
              ></div>

            </div>

            <div class="percentage">

              ${candidate.percentage
                .toFixed(1)}%

            </div>

          </div>

        `).join("")}

      </div>

    `;

    container.appendChild(card);

  });
}

// =========================
// SEARCH EVENT
// =========================

if(schoolSearch){

  schoolSearch.addEventListener(
    "input",
    applyFilter
  );
}

// =========================
// INITIAL LOAD
// =========================

getProfile();

// =========================
// AUTO REFRESH
// =========================

setInterval(
  fetchResults,
  5000
);