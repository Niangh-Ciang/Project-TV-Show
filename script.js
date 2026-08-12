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
  elements.root = document.getElementById("root");

  elements.root.textContent = "Loading episodes...";

  loadShows()
    .then((shows) => {
      state.shows = shows;
      createShowOptions();
      createEpisodeOptions();
      elements.searchInput.addEventListener("input", searchEpisodes);
      elements.episodeSelect.addEventListener("change", jumpToEpisode);
      elements.showSelect.addEventListener("change", jumpToShow);
      render();
    })
    .catch(() => {
      elements.root.textContent = "Error loading episodes. Please try again.";
    });
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

function render() {
  const filteredEpisodes = filteredEpisodesFun();
  elements.episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  const cards = filteredEpisodes.map(createEpisodeCard);
  elements.root.replaceChildren(...cards);
}

function createEpisodeCard({ url, name, season, number, image, summary }) {
  // Create a container for each episode
  const card = document.createElement("div");
  card.className = "episode-card";

  // Create episode code like S02E07
  const code = formatEpisodeCode(season, number);

  const title = document.createElement("h3");
  title.textContent = `${name} - ${code}`;
  card.appendChild(title);

  // Image
  const img = document.createElement("img");
  img.src = image?.medium || "";
  img.alt = name;
  img.loading = "lazy";
  img.width = 210;
  img.height = 118;
  card.appendChild(img);

  const summaryDiv = document.createElement("div");
  summaryDiv.className = "summary";
  summaryDiv.innerHTML = summary;
  card.appendChild(summaryDiv);

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
      elements.root.textContent = "Error loading episodes. Please try again.";
    });
}

function formatEpisodeCode(season, number) {
  const seasonCode = String(season).padStart(2, "0");
  const episodeCode = String(number).padStart(2, "0");

  return `S${seasonCode}E${episodeCode}`;
}

window.onload = setup;
