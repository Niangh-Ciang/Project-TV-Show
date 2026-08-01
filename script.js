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

    const title = document.createElement("h3");
    title.textContent = `${ep.name} - ${code}`;
    card.appendChild(title);

    // Image
    const img = document.createElement("img");
    img.src = ep.image.medium;
    img.alt = ep.name;
    card.appendChild(img);

    const body = document.createElement("div");
    body.className = "episode-body";

    const summary = document.createElement("div");
    summary.className = "summary";
    summary.innerHTML = ep.summary;
    card.appendChild(summary);

    const credit = document.createElement("a");
    credit.className = "credit";
    credit.href = ep.url;
    credit.textContent = `${ep.name} - ${code}`;
    card.appendChild(credit);

    rootElem.appendChild(card);
  });
}

window.onload = setup;
