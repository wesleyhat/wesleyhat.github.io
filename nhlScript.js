import { teamInfo, loadLocalJSON, toHttps, getPeriodString, formatGameDate } from './sportsScript.js';

let refreshInterval = 10000; // Default to 30 seconds
let intervalId;

function isNHLActive() {
    let today = new Date();
    let year = today.getFullYear();

    // Get the inactive period
    let { startDate, endDate } = getNHLInactivePeriod(year);

    // Hockey is active if the current date is **before** startDate or **after** endDate
    return today < startDate || today > endDate;
}

// Helper function to get the NHL inactive period
function getNHLInactivePeriod(year) {
    // Stanley Cup Finals usually end around the 2nd Monday of June
    let stanleyCupEnd = new Date(year, 5, 1); // June 1st
    while (stanleyCupEnd.getDay() !== 1) { // Find first Monday of June
        stanleyCupEnd.setDate(stanleyCupEnd.getDate() + 1);
    }
    stanleyCupEnd.setDate(stanleyCupEnd.getDate() + 7); // Move to 2nd Monday

    // Start date: 2 weeks after Stanley Cup Finals
    let startDate = new Date(stanleyCupEnd);
    startDate.setDate(startDate.getDate() + 14);

    // NHL Training Camp begins: Third Friday of September
    let trainingCampStart = new Date(year, 8, 15); // September 15th
    while (trainingCampStart.getDay() !== 5) { // Find first Friday after Sep 15
        trainingCampStart.setDate(trainingCampStart.getDate() + 1);
    }

    // End date: 2 weeks before Training Camp
    let endDate = new Date(trainingCampStart);
    endDate.setDate(endDate.getDate() - 14);

    return { startDate, endDate };
}

async function getGamesForAllTeams() {

    await loadLocalJSON();

    let tally = 0; // Initialize tally variable
    const page = toHttps(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard`);
    const req = await fetch(page);
    tally++; // Increment tally for the teams API call
    const data = await req.json();
    const events = data.events;
    let gamesInfo = []; // To store the actual game data
    let liveGameFound = false; // To track if there's a live game

    for (const event of events) {
      const matchup = event.shortName;
      let teams;
      if (matchup.includes(" VS ")) {
          teams = matchup.split(" VS ");
      } else if (matchup.includes("@")) {
          teams = matchup.split("@");
      }

      // Use trim() to remove any unwanted spaces
      const away = teams[0].trim();
      const home = teams[1].trim();

      const homeId = event.competitions[0].competitors[0].id;
      const awayId = event.competitions[0].competitors[1].id;

        let homeLogoUrl = "";
        let homeColor = "";
        let awayLogoUrl = "";
        let awayColor = "";
    
        let hasHomeLogo = true;
        let hasAwayLogo = true;
    
        homeLogoUrl = teamInfo.sports.nhl[homeId]?.logo ?? "";
        homeColor = teamInfo.sports.nhl[homeId]?.color ?? "#121212";
        awayLogoUrl = teamInfo.sports.nhl[awayId]?.logo ?? "";
        awayColor = teamInfo.sports.nhl[awayId]?.color ?? "#121212";
    
        // Determine if logos exist (check if logo URL is empty or "none")
        hasHomeLogo = homeLogoUrl && homeLogoUrl !== "none";
        hasAwayLogo = awayLogoUrl && awayLogoUrl !== "none";

        let awayScoreString = event.competitions[0].competitors[1].score;
        let homeScoreString = event.competitions[0].competitors[0].score;
        let awayScore = Number(awayScoreString);
        let homeScore = Number(homeScoreString);
        let gameDate = new Date(event.date);
        let homeText = "#ffffff";
        let awayText = "#ffffff";
        let period = event.status.period;
        let clock = event.status.displayClock;
        let quarter = getPeriodString(period);
        let gameState = event.status.type.state;
        let gameStatus = "";

        if (gameState === "pre") {
            gameStatus = "pre";
        } else if (gameState === "post") {
            gameStatus = "post";
            if (homeScore > awayScore) {
                awayColor = "#0d0b15";
                awayText = "#8c899c";
            } else if(homeScore < awayScore){
                homeColor = "#0d0b15";
                homeText = "#8c899c";
            } 
        } else {
            gameStatus = "live";
            liveGameFound = true; // A live game is found
        }

        if (gameStatus === "pre") {
            homeScore = "--";
            awayScore = "--";
        }

        gamesInfo.push({
            date: gameDate,
            homeTeam: home,
            awayTeam: away,
            homeId: homeId,
            awayId: awayId,
            homeScore: homeScore,
            awayScore: awayScore,
            homeLogo: homeLogoUrl,
            awayLogo: awayLogoUrl,
            homeColor: homeColor,
            awayColor: awayColor,
            homeText: homeText,
            awayText: awayText,
            quarter: quarter,
            clock: clock,
            gameStatus: gameStatus,
            hasHomeLogo: hasHomeLogo,
            hasAwayLogo: hasAwayLogo
        });
    }

    // Now inject the gamesInfo into the page
    displayGames(gamesInfo);

    // Hide the loading screen and show the games container
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('games-container').style.display = 'grid';

    // Adjust refresh interval based on live game status
    if (liveGameFound) {
        if (!intervalId) {
            refreshInterval = 10000; // Set to 30 seconds for live games
            intervalId = setInterval(getGamesForAllTeams, refreshInterval); // Start refreshing
        }
    } else {
        // If no live games, clear the interval
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null; // Reset intervalId
        }
    }
}

// Function to display games on the webpage
function displayGames(games) {
    const container = document.getElementById('games-container');
    container.innerHTML = ''; // Clear any previous content
    const containerPast = document.getElementById('games-container-past');
    containerPast.innerHTML = ''; // Clear any previous content

    games.forEach(game => {
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game');

        const awayTeamDiv = document.createElement('div');
        awayTeamDiv.classList.add('team');

        if(!game.hasAwayLogo){
            awayTeamDiv.innerHTML = `
                <h2 style="font-size: 20px; font-weight: 400;">${game.awayTeam}</h2>
                <span class="score">${game.awayScore}</span>
            `;
        } else {
            awayTeamDiv.innerHTML = `
                <img src="${game.awayLogo}" alt="${game.awayTeam} Logo"style="width:50px;height:50px;">
                <span class="score">${game.awayScore}</span>
            `;
        }

        const homeTeamDiv = document.createElement('div');
        homeTeamDiv.classList.add('team');

        if(!game.hasHomeLogo){
            homeTeamDiv.innerHTML = `
            <h2 style="font-size: 20px; font-weight: 400;">${game.homeTeam}</h2>
            <span class="score">${game.homeScore}</span>
        `;
        } else {
            homeTeamDiv.innerHTML = `
            <img src="${game.homeLogo}" alt="${game.homeTeam} Logo"style="width:50px;height:50px;">
            <span class="score">${game.homeScore}</span>
        `;
        }

        homeTeamDiv.style.backgroundColor = game.homeColor;
        awayTeamDiv.style.backgroundColor = game.awayColor;
        homeTeamDiv.style.color = game.homeText;
        awayTeamDiv.style.color = game.awayText;

        let formattedDate = formatGameDate(game.date);

        const gameDateDiv = document.createElement('div');
        gameDateDiv.classList.add('game-date');
        gameDateDiv.textContent = `${formattedDate}`;

        if (game.gameStatus === "post") {
            gameDiv.appendChild(awayTeamDiv);
            gameDiv.appendChild(homeTeamDiv);
            gameDiv.appendChild(gameDateDiv);
            containerPast.appendChild(gameDiv);
            gameDateDiv.textContent = "Final";
        } else {

            gameDiv.appendChild(awayTeamDiv);
            gameDiv.appendChild(homeTeamDiv);
            gameDiv.appendChild(gameDateDiv);
            if (game.gameStatus === "live") {
                gameDateDiv.innerHTML = `<span style="color: #e13534;">Live</span>&nbsp;&nbsp;&nbsp;${game.quarter}&nbsp;&nbsp;${game.clock}`;
            }
            container.appendChild(gameDiv);
        }
    });
}

if(isNHLActive()){
    document.getElementById('offseason-screen').style.display = 'none';
    getGamesForAllTeams();
} else {
    document.getElementById('loading-screen').style.display = 'none';
}
