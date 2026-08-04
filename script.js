const state = {
  episodes: [],
  searchTerm: "",
  selectedEpisode: null,
};

function setup() {
  state.episodes = getAllEpisodes();
  const searchInput = document.getElementById("search-input");
  const episodeSelect = document.getElementById("episode-select");
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All Episodes";
  episodeSelect.appendChild(allOption);

  state.episodes.forEach((episode, index) => {
    const code = formatEpisodeCode(episode.season, episode.number);
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${code} - ${episode.name}`;
    episodeSelect.appendChild(option);
  });

  searchInput.addEventListener("input", searchEpisodes);
  episodeSelect.addEventListener("change", jumpToEpisode);
  makePageForEpisodes();
}

function makePageForEpisodes() {
  const rootElem = document.getElementById("root");

  const filteredEpisodes =
    state.selectedEpisode !== null
      ? [state.episodes[state.selectedEpisode]]
      : state.episodes.filter(
          (episode) =>
            episode.name.toLowerCase().includes(state.searchTerm) ||
            episode.summary?.toLowerCase().includes(state.searchTerm),
        );

  const episodeCount = document.getElementById("episode-count");
  episodeCount.textContent = `Displaying ${filteredEpisodes.length} / ${state.episodes.length} episodes`;
  const cards = filteredEpisodes.map(createEpisodeCard);
  rootElem.replaceChildren(...cards);
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
  document.getElementById("episode-select").value = "";
  makePageForEpisodes();
}

function jumpToEpisode(event) {
  state.selectedEpisode =
    event.target.value === "" ? null : Number(event.target.value);

  state.searchTerm = "";
  document.getElementById("search-input").value = "";
  makePageForEpisodes();
}

function formatEpisodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

window.onload = setup;
