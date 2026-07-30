//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  episodeList.forEach((ep) => {
    // Create a container for each episode
    const card = document.createElement("div");
    card.className = "episode-card";

    // Create episode code like S02E07
    const seasonCode = ep.season.toString().padStart(2, "0");
    const episodeCode = ep.number.toString().padStart(2, "0");
    const code = `S${seasonCode}E${episodeCode}`;

    // Build the card content
    card.innerHTML = `
      <h3>${ep.name} - ${code}</h3>
      <img src="${ep.image.medium}" alt="${ep.name}">
     
  <div class="episode-body">
    <div class="summary">
      ${ep.summary}
    </div>

    <p class="credit">
      Data from <a href="https://www.tvmaze.com/">TVMaze.com</a>
    </p>
  </div>
`;
    rootElem.appendChild(card);
  });
}

window.onload = setup;
