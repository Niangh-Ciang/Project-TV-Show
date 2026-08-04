const state = {
  episodes: getAllEpisodes(),
  searchTerm: "",
  //selectedFilm: null
};

function setup() {
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", searchEpisodes);
  makePageForEpisodes();
}

function makePageForEpisodes() {
  const rootElem = document.getElementById("root");
  const filteredEpisodes = state.episodes.filter(
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
  const seasonCode = season.toString().padStart(2, "0");
  const episodeCode = number.toString().padStart(2, "0");
  const code = `S${seasonCode}E${episodeCode}`;

  const title = document.createElement("h3");
  title.textContent = `${name} - ${code}`;
  card.appendChild(title);

  // Image
  const img = document.createElement("img");
  img.src = medium;
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
  makePageForEpisodes();
}

window.onload = setup;
