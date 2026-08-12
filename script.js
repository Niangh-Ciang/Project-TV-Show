function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response;
}
function loadEpisodes(showId) {
  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then(checkStatus)
    .then((response) => response.json());
}

function loadShows() {
  return fetch("https://api.tvmaze.com/shows")
    .then(checkStatus)
    .then((response) => response.json());
}

const state = {
  episodes: [],
  shows: [],
  episodesByShow: {},
  searchTerm: "",
  selectedEpisode: null,
  selectedShow: null,
};

const elements = {};

function setup() {
  elements.searchInput = document.getElementById("search-input");
  elements.episodeSelect = document.getElementById("episode-select");
  elements.showSelect = document.getElementById("show-select");
  elements.episodeCount = document.getElementById("episode-count");
  elements.episodesList = document.getElementById("episodes-list");

  // the two control sections
  elements.showControls = document.getElementById("show-controls");
  elements.episodeControls = document.getElementById("episode-controls");

  // front page should show show-controls and hide episode-controls
  elements.showControls.style.display = "block";
  elements.episodeControls.style.display = "none";

  //show font page
  elements.showsList = document.getElementById("shows-list");
  elements.backToShows = document.getElementById("back-to-shows");
  elements.showsList.style.display = "block";
  elements.episodesList.style.display = "none";
  elements.backToShows.style.display = "none";

  elements.backToShows.addEventListener("click", () => {
    // show front page controls
    elements.showControls.style.display = "block";

    // hide episode controls
    elements.episodeControls.style.display = "none";

    // show shows list
    elements.showsList.style.display = "block";

    // hide episodes list
    elements.episodesList.style.display = "none";

    // hide back button
    elements.backToShows.style.display = "none";

    // reset episode search
    elements.searchInput.value = "";
    state.searchTerm = "";
    state.selectedEpisode = null;
    elements.episodeSelect.value = "";

    // reset genre search
    elements.genreSearch.value = "";
    elements.genreCount.textContent = `Found ${state.shows.length} shows`;

    // reset dropdown to first show
    updateGenreShowOptions(state.shows);

    // show all shows again
    renderShowsList(state.shows);
  });

  elements.genreSearch = document.getElementById("genre-search");
  elements.genreCount = document.getElementById("genre-count");
  elements.genreShowSelect = document.getElementById("genre-show-select");

  elements.genreSearch.addEventListener("input", filterShows);
  elements.genreShowSelect.addEventListener("change", selectFilteredShow);

  elements.showsList.textContent = "Loading shows...";

  loadShows()
    .then((shows) => {
      state.shows = shows;

      createShowOptions();
      createEpisodeOptions();

      elements.genreCount.textContent = `Found ${state.shows.length} shows`;

      updateGenreShowOptions(state.shows);

      renderShowsList(state.shows);

      elements.searchInput.addEventListener("input", searchEpisodes);
      elements.episodeSelect.addEventListener("change", jumpToEpisode);
      elements.showSelect.addEventListener("change", jumpToShow);
      render();
    })
    .catch(() => {
      elements.episodesList.textContent =
        "Error loading episodes. Please try again.";
    });
}

function filterShows(event) {
  const term = event.target.value.toLowerCase().trim();

  const filteredShows = state.shows.filter((show) => {
    return (
      show.name.toLowerCase().includes(term) ||
      show.genres.join(" ").toLowerCase().includes(term) ||
      show.summary?.toLowerCase().includes(term)
    );
  });

  elements.genreCount.textContent = `Found ${filteredShows.length} shows`;

  updateGenreShowOptions(filteredShows);

  renderShowsList(filteredShows);
}

// Open the selected show from the genre dropdown
function selectFilteredShow(event) {
  const showId = event.target.value;

  if (!showId) return;

  openShow(showId);
}

function createEpisodeOptions() {
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "--Select Episode--";
  elements.episodeSelect.replaceChildren(allOption);
  state.episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(
      episode.season,
      episode.number,
    )} - ${episode.name}`;

    elements.episodeSelect.appendChild(option);
  });
}

function createShowOptions() {
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "--Select Show--";
  elements.showSelect.appendChild(allOption);
  state.shows.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  state.shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    elements.showSelect.appendChild(option);
  });
}

function filteredEpisodesFun() {
  if (state.selectedEpisode !== null) {
    return [
      state.episodes.find((episode) => episode.id === state.selectedEpisode),
    ];
  }
  if (state.selectedShow === null) {
    return [];
  }
  if (state.searchTerm !== "") {
    return state.episodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(state.searchTerm) ||
        episode.summary?.toLowerCase().includes(state.searchTerm),
    );
  }
  return state.episodes;
}

// render function for shows list
function renderShowsList(shows = state.shows) {
  elements.showsList.innerHTML = shows
    .map(
      (show) => `
      <article class="show-card" data-id="${show.id}">
        
        <h2 class="show-title" data-id="${show.id}">
          ${show.name}
        </h2>

        <img 
          src="${show.image?.medium || ""}" 
          alt="${show.name}" 
          class="show-img"
        >

        <div class="show-card-content">
          <p class="show-summary">
            ${show.summary || ""}
          </p>
        </div>

        <div class="show-info-box">
          <p><strong>Rating:</strong> ${show.rating?.average ?? "N/A"}</p>
          <p><strong>Genres:</strong> ${show.genres.join(" | ")}</p>
          <p><strong>Status:</strong> ${show.status}</p>
          <p><strong>Runtime:</strong> ${show.runtime ?? "N/A"} min</p>
        </div>

      </article>
    `,
    )
    .join("");

  document.querySelectorAll(".show-title").forEach((title) => {
    title.addEventListener("click", () => {
      const showId = title.dataset.id;
      openShow(showId);
    });
  });
}

function updateGenreShowOptions(shows) {
  elements.genreShowSelect.replaceChildren();

  if (shows.length === 0) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "No shows found";
    elements.genreShowSelect.appendChild(emptyOption);
    return;
  }

  // FIRST SHOW automatically selected
  const firstOption = document.createElement("option");
  firstOption.value = shows[0].id;
  firstOption.textContent = shows[0].name;
  elements.genreShowSelect.appendChild(firstOption);

  // Add the rest of the shows
  for (let i = 1; i < shows.length; i++) {
    const option = document.createElement("option");
    option.value = shows[i].id;
    option.textContent = shows[i].name;
    elements.genreShowSelect.appendChild(option);
  }

  // Auto-select the first show
  elements.genreShowSelect.value = shows[0].id;
}

function openShow(showId) {
  state.selectedShow = showId;

  // hide front page controls
  elements.showControls.style.display = "none";

  // show episode controls
  elements.episodeControls.style.display = "flex";

  // hide shows list
  elements.showsList.style.display = "none";

  // show episodes list
  elements.episodesList.style.display = "grid";

  // show back button
  elements.backToShows.style.display = "block";

  if (state.episodesByShow[showId]) {
    state.episodes = state.episodesByShow[showId];
    createEpisodeOptions();
    render();
    return;
  }

  loadEpisodes(showId).then((episodes) => {
    state.episodes = episodes;
    state.episodesByShow[showId] = episodes;
    createEpisodeOptions();
    render();
  });
}

function render() {
  const filteredEpisodes = filteredEpisodesFun();
  elements.episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  const cards = filteredEpisodes.map(createEpisodeCard);
  elements.episodesList.replaceChildren(...cards);
}

function createEpisodeCard({ url, name, season, number, image, summary }) {
  const card = document.createElement("div");
  card.className = "episode-card";

  const code = formatEpisodeCode(season, number);

  const title = document.createElement("h3");
  title.textContent = `${name} - ${code}`;
  card.appendChild(title);

  const img = document.createElement("img");
  img.src = image?.medium || "";
  img.alt = name;
  img.loading = "lazy";
  card.appendChild(img);

  // FIX: add episode-body wrapper
  const body = document.createElement("div");
  body.className = "episode-body";

  const summaryP = document.createElement("p");
  summaryP.innerHTML = summary;
  body.appendChild(summaryP);

  card.appendChild(body);

  const credit = document.createElement("a");
  credit.className = "credit";
  credit.href = url;
  credit.target = "_blank";
  credit.textContent = "Click To Watch";
  card.appendChild(credit);

  return card;
}

function searchEpisodes(event) {
  state.searchTerm = event.target.value.toLowerCase();
  state.selectedEpisode = null;
  elements.episodeSelect.value = "";
  render();
}

function jumpToEpisode(event) {
  state.selectedEpisode =
    event.target.value === "" ? null : Number(event.target.value);
  state.searchTerm = "";
  elements.searchInput.value = "";
  render();
}

function jumpToShow(event) {
  state.searchTerm = "";
  elements.searchInput.value = "";
  state.selectedEpisode = null;
  state.episodes = [];
  state.selectedShow = event.target.value === "" ? null : event.target.value;

  if (state.selectedShow === null) {
    createEpisodeOptions();
    render();
    return;
  }

  if (state.episodesByShow[state.selectedShow]) {
    state.episodes = state.episodesByShow[state.selectedShow];
    createEpisodeOptions();
    render();
    return;
  }

  loadEpisodes(state.selectedShow)
    .then((episodes) => {
      state.episodes = episodes;
      state.episodesByShow[state.selectedShow] = episodes;
      createEpisodeOptions();
      render();
    })
    .catch(() => {
      elements.episodesList.textContent =
        "Error loading episodes. Please try again.";
    });
}

function formatEpisodeCode(season, number) {
  const seasonCode = String(season).padStart(2, "0");
  const episodeCode = String(number).padStart(2, "0");

  return `S${seasonCode}E${episodeCode}`;
}

window.onload = setup;
