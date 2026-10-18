const GAME_MODE = "CLASSIC";
const STARTING_SIDE = 100;
const PLAYER_ROLE = "BOTTOM";

const errorText = document.getElementById("errorMessage");

const getPuuid = async (summonerName, tagLine) => {
  try {
    errorText.textContent = "";
    const cache = localStorage.getItem(`${summonerName}#${tagLine}`);
    if (cache) {
      let data = JSON.parse(cache);
      let puuid = data.puuid;
      return puuid;
    } else {
      const response = await fetch("http://localhost:3000/summoners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ summonerName, tagLine }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Request failed: ${response.status}`);
      }
      let puuid = data.puuid;
      if (!puuid) {
        errorText.textContent = "Summoner not found";
        throw new Error("Summoner not found");
      }

      localStorage.setItem(`${summonerName}#${tagLine}`, JSON.stringify(data));
      return puuid;
    }
  } catch (error) {
    console.error(error.message);
    const loader = document.getElementById("loader");
  }
};

//gets the 10 most recent matches not filtered by game mode
const getMatches = async (summonerName, tagLine) => {
  try {
    const cache = localStorage.getItem(`${summonerName}#${tagLine} matches`);
    const PUUID = await getPuuid(summonerName, tagLine);

    if (cache) {
      let data = JSON.parse(cache);
      let matches = data;
      return matches;
    } else {
      const response = await fetch(`http://localhost:3000/matches/${PUUID}`);
      const data = await response.json();
      let matches = data;

      localStorage.setItem(
        `${summonerName}#${tagLine} matches`,
        JSON.stringify(data),
      );

      return matches;
    }
  } catch (error) {
    console.error(error);
  }
};

const matchTimelineData = async (summonerName, tagLine, match) => {
  try {
    const cache = localStorage.getItem(`${summonerName}#${tagLine} ${match}`);

    if (cache) {
      let timelineData = JSON.parse(cache);
      return timelineData;
    } else {
      const response = await fetch(
        `http://localhost:3000/match/timeline/${match}`,
      );
      let data = await response.json();
      let players = data.info.participants;
      const puuid = await getPuuid(summonerName, tagLine);
      let playerId = null;
      for (let p = 0; p < players.length; p++) {
        if (players[p].puuid === puuid) {
          playerId = players[p].participantId.toString();
        }
      }
      let posList = [];
      for (let f = 0; f < data.info.frames.length; f++) {
        let pos = data.info.frames[f].participantFrames[playerId].position;
        posList.push(pos);
      }
      let timelineData = { player_id: playerId, player_position: posList };

      localStorage.setItem(
        `${summonerName}#${tagLine} ${match}`,
        JSON.stringify(timelineData),
      );
      return timelineData;
    }
  } catch (error) {
    console.error(error);
  }
};

//return the corresponding role and nexus starting point, and game mode

const getMatchDetails = async (summonerName, tagLine, playerIdIndex, match) => {
  try {
    const cache = localStorage.getItem(
      `${summonerName}#${tagLine} ${match} details`,
    );
    if (cache) {
      let matchData = JSON.parse(cache);
      return matchData;
    } else {
      const response = await fetch(
        `http://localhost:3000/match/details/${match}`,
      );
      const data = await response.json();
      //i have to get the player role and starting based on puuid, so figure out participant number? through puuid
      let position = data.info.participants[playerIdIndex].teamPosition;
      let startingSide = data.info.participants[playerIdIndex].teamId;
      let gameMode = data.info.gameMode;
      let matchData = {
        position: position,
        starting: startingSide,
        game_mode: gameMode,
      };
      //note: 100 is blue side, 200 is red side
      localStorage.setItem(
        `${summonerName}#${tagLine} ${match} details`,
        JSON.stringify(matchData),
      );
      console.log(matchData);
      return matchData;
    }
  } catch (error) {
    console.error(error);
  }
};

const filterBy = async (
  summonerName,
  tagLine,
  match,
  gameMode,
  playerRole,
  startingSide,
) => {
  try {
    let valid = false;
    let timelineData = await matchTimelineData(summonerName, tagLine, match);
    let playerId = timelineData.player_id;
    let playerIdIndex = parseInt(playerId, 10) - 1;
    let match_info = await getMatchDetails(
      summonerName,
      tagLine,
      playerIdIndex,
      match,
    );
    //now we got all the match details we need! if everything is true, return true
    if (
      match_info.game_mode === gameMode &&
      match_info.position === playerRole &&
      match_info.starting === startingSide
    ) {
      valid = true;
    }
    console.log(valid);
    return valid;
  } catch (error) {
    console.error(error);
  }
};

//add cache
export const getPlayerPos = async (summonerName, tagLine) => {
  try {
    let matchPos = [];
    let matchIds = await getMatches(summonerName, tagLine);
    let posList = null;

    for (let match = 0; match < matchIds.length; match++) {
      let isValid = await filterBy(
        summonerName,
        tagLine,
        matchIds[match],
        GAME_MODE,
        PLAYER_ROLE,
        STARTING_SIDE,
      );
      if (isValid) {
        let timelineData = await matchTimelineData(
          summonerName,
          tagLine,
          matchIds[match],
        );
        posList = timelineData.player_position;
        matchPos.push(posList);
      }
    }
    console.log(matchPos);
    return matchPos;
  } catch (error) {
    console.error("Error fetching player positions:", error);
  }
};

//function - creating a key player name, role, starting side

export const heatmapId = (summonerName, tagLine) => {
  let id = `${summonerName}#${tagLine} ${PLAYER_ROLE} ${STARTING_SIDE}`;
  console.log(id);
  return id;
};

heatmapId();
