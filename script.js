//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const cards = episodeList.map(createEpisodeCard);
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

window.onload = setup;
