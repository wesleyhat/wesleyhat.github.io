import { circleImg, teamInfo, loadLocalJSON, toHttps, getPeriodString, formatGameDate } from './sportsScript.js';

let refreshInterval = 10000; // Default to 30 seconds
let intervalId;

async function getGamesForAllTeams() {

    await loadLocalJSON();
    
    const page = toHttps(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`);                    // unique
    const req = await fetch(page);
    const data = await req.json();
    const events = data.events;
    let gamesInfo = []; // To store the actual game data
    let liveGameFound = false; // To track if there's a live game

    for (const event of events) {
        const matchup = event.shortName;
        const teams = matchup.split(" @ ");
        const away = teams[0];
        const home = teams[1];

        const homeId = event.competitions[0].competitors[0].id;
        const awayId = event.competitions[0].competitors[1].id;

        let homeLogoUrl = "";
        let homeColor = "";
        let awayLogoUrl = "";
        let awayColor = "";

        let hasHomeLogo = true;
        let hasAwayLogo = true;

        homeLogoUrl = teamInfo.sports.nfl[homeId]?.logo ?? "";                                                        // unique
        homeColor = teamInfo.sports.nfl[homeId]?.color ?? "#121212";                                                  // unique
        awayLogoUrl = teamInfo.sports.nfl[awayId]?.logo ?? "";                                                        // unique
        awayColor = teamInfo.sports.nfl[awayId]?.color ?? "#121212";                                                  // unique

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
        let down = "1st & 10"
        let field = "PIT 23"
        let homeBall;
        let awayBall;

        // Set gameStatus based on gameState
        let gameStatus = gameState === "pre" ? "pre" : gameState === "post" ? "post" : "live";


        if (gameStatus === "post") {
            // Determine winning team colors
            if (homeScore > awayScore) {
                awayColor = "#0d0b15";
                awayText = "#8c899c";
            } else if (homeScore < awayScore) {
                homeColor = "#0d0b15";
                homeText = "#8c899c";
            }
        } else if (gameStatus === "live") {
            liveGameFound = true; // A live game is found
            homeBall = false;
            awayBall = false;
        }
        
        // Handle pre-game scores
        if (gameStatus === "pre") {
            homeScore = "--";
            awayScore = "--";
        }

        //gameStatus = "live";
        //homeBall = true;

        gamesInfo.push({
            date: gameDate,
            homeTeam: home,
            awayTeam: away,
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
            hasAwayLogo: hasAwayLogo,
            homeBall: homeBall,
            awayBall: awayBall,
            down: down,
            field: field
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

    let gameCount = 1; // To track and assign unique IDs

    games.forEach(game => {
        gameCount++;

        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game');

        gameDiv.setAttribute('data-game-id', gameCount);

        const awayTeamDiv = document.createElement('div');
        awayTeamDiv.classList.add('team');

        if(!game.hasAwayLogo){
            awayTeamDiv.innerHTML = `
                <h2 style="font-size: 20px; font-weight: 400;">${game.awayTeam}</h2>
                <span class="score">${game.awayScore}</span>
            `;
        } else {
            awayTeamDiv.innerHTML = `
                <img src="${game.awayLogo}" alt="${game.awayTeam} Logo">
                <span class="score">${game.awayScore}</span>
            `;
        }

        if(game.awayBall){
            if(!game.hasAwayLogo){
                awayTeamDiv.innerHTML = `
                    <h2 style="font-size: 20px; font-weight: 400;">${game.awayTeam}</h2>
                    <img src="${circleImg}" alt="has ball" style="width: 5px; height: 5px; margin-left: -20px; position: absolute; left: 90px;">
                    <span class="score">${game.awayScore}</span>
                `;
            } else {
                awayTeamDiv.innerHTML = `
                    <img src="${game.awayLogo}" alt="${game.awayTeam} Logo">
                    <img src="${circleImg}" alt="has ball" style="width: 5px; height: 5px; margin-left: -20px; position: absolute; left: 90px;">
                    <span class="score">${game.awayScore}</span>
                `;
            }
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
            <img src="${game.homeLogo}" alt="${game.homeTeam} Logo">
            <span class="score">${game.homeScore}</span>
        `;
        }

        if(game.homeBall){
            if(!game.hasHomeLogo){
                homeTeamDiv.innerHTML = `
                <h2 style="font-size: 20px; font-weight: 400;">${game.homeTeam}</h2>
                <img src="${circleImg}" alt="has ball" style="width: 5px; height: 5px; margin-left: -20px; position: absolute; left: 90px;">
                <span class="score">${game.homeScore}</span>
            `;
            } else {
                homeTeamDiv.innerHTML = `
                <img src="${game.homeLogo}" alt="${game.homeTeam} Logo">
                <img src="${circleImg}" alt="has ball" style="width: 5px; height: 5px; margin-left: -20px; position: absolute; left: 90px;">
                <span class="score">${game.homeScore}</span>
            `;
            }
        }

        homeTeamDiv.style.backgroundColor = game.homeColor;
        awayTeamDiv.style.backgroundColor = game.awayColor;
        homeTeamDiv.style.color = game.homeText;
        awayTeamDiv.style.color = game.awayText;

        const gameDateDiv = document.createElement('div');
        gameDateDiv.classList.add('game-date');
        gameDateDiv.textContent = `${formatGameDate(game.date)}`;

        if (game.gameStatus === "post") {
            if(game.homeScore > game.awayScore){
                gameDiv.appendChild(homeTeamDiv);
                gameDiv.appendChild(awayTeamDiv);
                gameDiv.appendChild(gameDateDiv);
            } else if(game.homeScore < game.awayScore){
                gameDiv.appendChild(awayTeamDiv);
                gameDiv.appendChild(homeTeamDiv);
                gameDiv.appendChild(gameDateDiv);
            } else {
                gameDiv.appendChild(awayTeamDiv);
                gameDiv.appendChild(homeTeamDiv);
                gameDiv.appendChild(gameDateDiv);
            }
            containerPast.appendChild(gameDiv);
            gameDateDiv.textContent = "Final";
        } else {

            gameDiv.appendChild(awayTeamDiv);
            gameDiv.appendChild(homeTeamDiv);
            gameDiv.appendChild(gameDateDiv);
            if (game.gameStatus === "live") {

                gameDiv.style.height = "205px";

                gameDateDiv.innerHTML = `<span style="color: #e13534;">Live</span>&nbsp;&nbsp;&nbsp;${game.quarter}&nbsp;&nbsp;${game.clock}<br><br>
                                         <span>${game.down}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${game.field}`;
            }
            container.appendChild(gameDiv);
        }
    });
}

getGamesForAllTeams();

