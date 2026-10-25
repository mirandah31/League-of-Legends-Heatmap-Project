const MATCH_COUNT = 40;
const BASE_URL = "https://americas.api.riotgames.com";
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("dotenv").config();
const app = express();

//revisit this - i might not need it?
let limiter1 = rateLimit({
  max: 100,
  windowMs: 2 * 60 * 1000,
  message:
    "We have received too many requests from this IP. Please try again after 2 minutes.",
});

let limiter2 = rateLimit({
  max: 20,
  windowMs: 1000,
  message:
    "We have received too many requests from this IP. Please try again after 2 minutes.",
});

app.use("/", limiter1);
app.use("/", limiter2);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server works!");
});

const sleep = async (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

//get player puuid
app.post("/summoners", async (req, res) => {
  const { summonerName, tagLine } = req.body;
  const response = await fetch(
    `${BASE_URL}/riot/account/v1/accounts/by-riot-id/${summonerName}/${tagLine}?api_key=${process.env.RIOT_API_KEY}`,
  );
  const data = await response.json();
  res.json(data);
});

app.get("/matches/:puuid", async (req, res) => {
  const puuid = req.params.puuid;
  const response = await fetch(
    `${BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${MATCH_COUNT}&api_key=${process.env.RIOT_API_KEY}`,
  );
  const data = await response.json();
  res.json(data);
});

app.get("/match/timeline/:matchId", async (req, res) => {
  const match = req.params.matchId;
  await sleep(1);
  const response = await fetch(
    `${BASE_URL}/lol/match/v5/matches/${match}/timeline?api_key=${process.env.RIOT_API_KEY}`,
  );
  const data = await response.json();
  res.json(data);
});

app.get("/match/details/:matchId", async (req, res) => {
  const match = req.params.matchId;
  await sleep(1);
  const response = await fetch(
    `${BASE_URL}/lol/match/v5/matches/${match}?api_key=${process.env.RIOT_API_KEY}`,
  );
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});
