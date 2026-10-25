import { getPlayerPos, heatmapId } from "./api.js";

const canvas = document.querySelector("canvas");

const width = 600;
const height = 600;

const dpi = window.devicePixelRatio || 1;

canvas.width = width * dpi;
canvas.height = height * dpi;

canvas.style.width = "600px";
canvas.style.height = "600px";

let c = canvas.getContext("2d");

const heatmapKey = heatmapId();

const img = new Image();
img.src = "../Assets/minimap.png";

img.onload = function () {
  c.drawImage(img, 0, 0, width * dpi, height * dpi);
  //hasHeatmap()
};

const displayPos = async (summonerName, tagLine) => {
  try {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.drawImage(img, 0, 0, width * dpi, height * dpi);

    let matchPos = await getPlayerPos(summonerName, tagLine);
    let m = 0.047;

    let newPosList = [];

    for (let i = 0; i < matchPos.length; i++) {
      let newPos = [];
      for (let p = 0; p < matchPos[i].length; p++) {
        let x = matchPos[i][p].x;
        let y = matchPos[i][p].y;

        //m is used to resize the coords to fit canvas, and 16000-y because I have to flip y coords
        let newX = x * m;
        let newY = (16000 - y) * m;
        newPosList.push({ newX, newY });
      }
    }
    for (let p = 0; p < newPosList.length; p++) {
      c.fillStyle = "rgb(38, 0, 255)";
      c.fillRect(newPosList[p].newX, newPosList[p].newY, 15, 15);
    }

    localStorage.setItem(heatmapKey, JSON.stringify(newPosList));
  } catch {
    console.error(error);
  }
};

const form = document.getElementById("player-info");
const loader = document.getElementById("loader");
const playerNameInput = document.getElementById("summonerName");
const errorText = document.getElementById("errorMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const [summonerName, tagLine] = playerNameInput.value.split("#");
    if (!tagLine) {
      errorText.textContent = "Please enter a valid summoner user";
      throw new Error(errorText.textContent);
    }
    loader.textContent = "generating heatmap...";
    await displayPos(summonerName, tagLine);
  } catch (error) {
    console.error(error);
  } finally {
    loader.textContent = "";
  }
});

const hasHeatmap = () => {
  //its not working bc now its a list within a list, soooo its gonna be like newPosList[][]
  const cache = localStorage.getItem(heatmapKey);
  if (cache) {
    const newPosList = JSON.parse(cache);
    for (let p = 0; p < newPosList.length; p++) {
      c.fillStyle = "rgb(38, 0, 255)";
      c.fillRect(newPosList[p].newX, newPosList[p].newY, 10, 10);
    }
  }
};
