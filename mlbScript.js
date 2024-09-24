import { teamInfo, loadLocalJSON, toHttps, getPeriodString, formatGameDate } from './sportsScript.js';

let refreshInterval = 10000; // Default to 30 seconds
let intervalId;

async function getGamesForAllTeams() {

    await loadLocalJSON();

    let tally = 0; // Initialize tally variable
    const page = toHttps(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard`);
    const req = await fetch(page);
    tally++; // Increment tally for the teams API call
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

        homeLogoUrl = teamInfo.sports.mlb[homeId]?.logo ?? "";
        homeColor = teamInfo.sports.mlb[homeId]?.color ?? "#121212";
        awayLogoUrl = teamInfo.sports.mlb[awayId]?.logo ?? "";
        awayColor = teamInfo.sports.mlb[awayId]?.color ?? "#121212";

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
        let inning = event.status.type.detail;
        let gameState = event.status.type.state;
        let gameStatus = "";
        let homeAtBat = false;
        let awayAtBat = false;
        let balls = "0";
        let strikes = "0";
        let outs = "0";
        let first = false;
        let second = false;
        let third = false;

        let test = event.competitions[0]

        //console.log(test);

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

            balls = event.competitions[0].situation.balls;
            strikes = event.competitions[0].situation.strikes;
            outs = event.competitions[0].situation.outs;
            first = event.competitions[0].situation.onFirst;
            second = event.competitions[0].situation.onSecond;
            third = event.competitions[0].situation.onThird;

            let teamOnField = "";

            try{
                teamOnField = event.competitions[0].situation.pitcher.athlete.team.id;
            } catch{
                teamOnField = "";
            }

            if(Number(teamOnField) === Number(homeId)){
                awayAtBat = true;
            } else if(Number(teamOnField) === Number(awayId)){
                homeAtBat = true
            } else{
                awayAtBat = false;
                homeAtBat = false;
            }
        }

        if (gameStatus === "pre") {
            homeScore = "-";
            awayScore = "-";
        }

        //gameStatus = "live";

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
            inning: inning,
            gameStatus: gameStatus,
            hasHomeLogo: hasHomeLogo,
            hasAwayLogo: hasAwayLogo,
            homeAtBat : homeAtBat,
            awayAtBat : awayAtBat,
            balls: balls,
            strikes: strikes,
            outs: outs,
            first: first,
            second: second,
            third: third,
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
                <img src="${game.awayLogo}" alt="${game.awayTeam} Logo" style="width:${teamInfo.sports.nfl[game.awayId].width};height:${teamInfo.sports.nfl[game.awayId].height};margin-left:${teamInfo.sports.nfl[game.homeId].margin};">
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
            <img src="${game.homeLogo}" alt="${game.homeTeam} Logo" style="width:${teamInfo.sports.nfl[game.homeId].width};height:${teamInfo.sports.nfl[game.homeId].height};margin-left:${teamInfo.sports.nfl[game.homeId].margin};">
            <span class="score">${game.homeScore}</span>
        `;
        }

        homeTeamDiv.style.backgroundColor = game.homeColor;
        awayTeamDiv.style.backgroundColor = game.awayColor;
        homeTeamDiv.style.color = game.homeText;
        awayTeamDiv.style.color = game.awayText;

        const gameDateDiv = document.createElement('div');
        gameDateDiv.classList.add('game-date');
        gameDateDiv.textContent = `${formatGameDate(game.date)}`;

        if (game.gameStatus === "post") {
            gameDiv.appendChild(awayTeamDiv);
            gameDiv.appendChild(homeTeamDiv);
            containerPast.appendChild(gameDiv);
            gameDateDiv.textContent = "Final";
        } else {

            gameDiv.appendChild(awayTeamDiv);
            gameDiv.appendChild(homeTeamDiv);
            gameDiv.appendChild(gameDateDiv);
            if (game.gameStatus === "live") {
                gameDateDiv.innerHTML = `<span style="color: #e13534;">Live</span>&nbsp;&nbsp;&nbsp;${game.inning}`;

                gameDiv.style.height = "225px";
                homeTeamDiv.style.height = "70px";
                awayTeamDiv.style.height = "70px";

                let firstBase = "baseOn.png";
                let secondBase = "baseOff.png";
                let thirdBase= "baseOn.png";

                let baseStatus = `${game.first}-${game.second}-${game.third}`;  // Create a unique string key for each combination

                switch (baseStatus) {
                    case "true-false-false":
                        firstBase = "baseOn.png";
                        secondBase = "baseOff.png";
                        thirdBase= "baseOff.png";
                        break;
                    case "false-true-false":
                        firstBase = "baseOff.png";
                        secondBase = "baseOn.png";
                        thirdBase= "baseOff.png";
                        break;
                    case "false-false-true":
                        firstBase = "baseOff.png";
                        secondBase = "baseOff.png";
                        thirdBase= "baseOn.png";
                        break;
                    case "true-true-false":
                        firstBase = "baseOn.png";
                        secondBase = "baseOn.png";
                        thirdBase= "baseOff.png";
                        break;
                    case "true-false-true":
                        firstBase = "baseOn.png";
                        secondBase = "baseOff.png";
                        thirdBase= "baseOn.png";
                        break;
                    case "false-true-true":
                        firstBase = "baseOff.png";
                        secondBase = "baseOn.png";
                        thirdBase= "baseOn.png";
                        break;
                    case "true-true-true":
                        firstBase = "baseOn.png";
                        secondBase = "baseOn.png";
                        thirdBase= "baseOn.png";
                        break;
                    default:
                        firstBase = "baseOff.png";
                        secondBase = "baseOff.png";
                        thirdBase= "baseOff.png";
                }

                if(game.homeAtBat){

                    if(!game.hasHomeLogo){
                        homeTeamDiv.innerHTML = `
                            <h2 style="font-size: 20px; font-weight: 400;">${game.homeTeam}</h2>
                            <img src="${firstBase}" alt="first" class="baseOne">
                            <img src="${secondBase}" alt="first" class="baseTwo">
                            <img src="${thirdBase}" alt="first" class="baseThree">
                            <span class="score">${game.homeScore}</span>
                        `;
                    } else {
                        homeTeamDiv.innerHTML = `
                            <img src="${game.homeLogo}" alt="${game.homeTeam} Logo" style="width:${teamInfo.sports.nfl[game.awayId].width};height:${teamInfo.sports.nfl[game.awayId].height};margin-left:${teamInfo.sports.nfl[game.homeId].margin};">
                            <img src="${firstBase}" alt="first" class="baseOne">
                            <img src="${secondBase}" alt="first" class="baseTwo">
                            <img src="${thirdBase}" alt="first" class="baseThree">
                            <span class="score">${game.homeScore}</span>
                        `;
                    }

                } else if(game.awayAtBat) {
                    if(!game.hasAwayLogo){
                        awayTeamDiv.innerHTML = `
                            <h2 style="font-size: 20px; font-weight: 400;">${game.awayTeam}</h2>
                            <img src="${firstBase}" alt="first" class="baseOne">
                            <img src="${secondBase}" alt="first">
                            <img src="${thirdBase}" alt="first">
                            <span class="score">${game.awayScore}</span>
                        `;
                    } else {
                        awayTeamDiv.innerHTML = `
                            <img src="${game.awayLogo}" alt="${game.awayTeam} Logo" style="width:${teamInfo.sports.nfl[game.awayId].width};height:${teamInfo.sports.nfl[game.awayId].height};margin-left:${teamInfo.sports.nfl[game.homeId].margin};">
                            <img src="${firstBase}" alt="first" class="baseOne">
                            <img src="${secondBase}" alt="first" class="baseTwo">
                            <img src="${thirdBase}" alt="first" class="baseThree">
                            <span class="score">${game.awayScore}</span>
                        `;
                    }
                }

                if(!game.homeAtBat && !game.awayAtBat){
                    gameDateDiv.innerHTML = gameDateDiv.innerHTML + `<br><br><span class="atBat">-</span>`;
                } else{
                    if(Number(game.outs) === 1){
                        gameDateDiv.innerHTML = gameDateDiv.innerHTML + `<br><br><span class="atBat">${game.balls}/${game.strikes} Count&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${game.outs} Out</span>`;
                    } else{
                        gameDateDiv.innerHTML = gameDateDiv.innerHTML + `<br><br><span class="atBat">${game.balls}/${game.strikes} Count&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${game.outs} Outs</span>`;
                    }
                }

                


            }
            container.appendChild(gameDiv);
        }
    });
}

getGamesForAllTeams();

