function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response;
}
function loadEpisodes() {
  return fetch("https://api.tvmaze.com/shows/82/episodes")
    .then(checkStatus)
    .then((response) => response.json());
}
const state = {
  episodes: [],
  searchTerm: "",
  selectedEpisode: null,
};

const elements = {};

function setup() {
  elements.searchInput = document.getElementById("search-input");
  elements.episodeSelect = document.getElementById("episode-select");
  elements.episodeCount = document.getElementById("episode-count");
  elements.root = document.getElementById("root");

  elements.root.textContent = "Loading episodes...";

  loadEpisodes()
    .then((episodes) => {
      state.episodes = episodes;
      createEpisodeOptions();
      elements.searchInput.addEventListener("input", searchEpisodes);
      elements.episodeSelect.addEventListener("change", jumpToEpisode);
      render();
    })
    .catch(() => {
      elements.root.textContent = "Error loading episodes. Please try again.";
    });
}

function createEpisodeOptions() {
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All Episodes";
  elements.episodeSelect.appendChild(allOption);

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

function filteredEpisodesFun() {
  const filteredEpisodes =
    state.selectedEpisode !== null
      ? [state.episodes.find((e) => e.id === state.selectedEpisode)]
      : state.episodes.filter(
          (episode) =>
            episode.name.toLowerCase().includes(state.searchTerm) ||
            episode.summary?.toLowerCase().includes(state.searchTerm),
        );
  return filteredEpisodes;
}
function render() {
  const filteredEpisodes = filteredEpisodesFun();

  elements.episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  const cards = filteredEpisodes.map(createEpisodeCard);
  elements.root.replaceChildren(...cards);
}

function createEpisodeCard({
  url,
  name,
  season,
  number,
  image: { medium },
  summary,
}) {
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
  img.src = medium || "";
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

function formatEpisodeCode(season, number) {
  const seasonCode = String(season).padStart(2, "0");
  const episodeCode = String(number).padStart(2, "0");

  return `S${seasonCode}E${episodeCode}`;
}

window.onload = setup;
