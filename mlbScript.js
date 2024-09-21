function toHttps(url) {
    return url.replace(/^http:/, 'https:');
}

const teamInfo = {
    "ARI": {
        "color": "#aa182c",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/ari.png"
    },
    "ATL": {
        "color": "#0c2340",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/atl.png"
    },
    "BAL": {
        "color": "#df4601",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/bal.png"
    },
    "BOS": {
        "color": "#0d2b56",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/bos.png"
    },
    "CHC": {
        "color": "#0e3386",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/chc.png"
    },
    "CHW": {
        "color": "#949ca1",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500/chw.png"
    },
    "CIN": {
        "color": "#c6011f",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/cin.png"
    },
    "CLE": {
        "color": "#002b5c",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/cle.png"
    },
    "COL": {
        "color": "#33006f",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/col.png"
    },
    "DET": {
        "color": "#0a2240",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/det.png"
    },
    "HOU": {
        "color": "#002d62",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/hou.png"
    },
    "KC": {
        "color": "#004687",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/kc.png"
    },
    "LAA": {
        "color": "#ba0021",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/laa.png"
    },
    "LAD": {
        "color": "#005a9c",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/lad.png"
    },
    "MIA": {
        "color": "#00a3e0",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/mia.png"
    },
    "MIL": {
        "color": "#13294b",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/mil.png"
    },
    "MIN": {
        "color": "#031f40",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/min.png"
    },
    "NYM": {
        "color": "#002d72",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/nym.png"
    },
    "NYY": {
        "color": "#132448",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/nyy.png"
    },
    "OAK": {
        "color": "#003831",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/oak.png"
    },
    "PHI": {
        "color": "#e81828",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/phi.png"
    },
    "PIT": {
        "color": "#121212",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/pit.png"
    },
    "SD": {
        "color": "#2f241d",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/sd.png"
    },
    "SF": {
        "color": "#e8c999",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500/sf.png"
    },
    "SEA": {
        "color": "#005c5c",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/sea.png"
    },
    "STL": {
        "color": "#be0a14",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/stl.png"
    },
    "TB": {
        "color": "#092c5c",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/tb.png"
    },
    "TEX": {
        "color": "#003278",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/tex.png"
    },
    "TOR": {
        "color": "#134a8e",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/tor.png"
    },
    "WSH": {
        "color": "#ab0003",
        "logo": "https://a.espncdn.com/i/teamlogos/mlb/500-dark/wsh.png"
    }
};

function getPeriodString(period) {
    switch (period) {
        case 0: return "0";
        case 1: return "1st";
        case 2: return "2nd";
        case 3: return "3rd";
        case 4: return "4th";
        default: return "Invalid period";
    }
}

function formatGameDate(gameDate) {
    const date = new Date(gameDate);
    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const month = date.getMonth() + 1; // Months are zero-indexed
    const dayOfMonth = date.getDate();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${day} ${month}/${dayOfMonth} ${hours}:${minutes}${ampm}`;
}

let refreshInterval = 10000; // Default to 30 seconds
let intervalId;

async function getGamesForAllTeams() {
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
        const homeLogoUrl = teamInfo[home].logo;
        let homeColor = teamInfo[home].color;
        const awayLogoUrl = teamInfo[away].logo;
        let awayColor = teamInfo[away].color;
        let awayScore = event.competitions[0].competitors[0].score;
        let homeScore = event.competitions[0].competitors[1].score;
        let gameDate = new Date(event.date);
        let homeText = "#ffffff";
        let awayText = "#ffffff";
        let inning = event.status.type.detail;
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
            homeScore = "-";
            awayScore = "-";
        }

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
            inning: inning,
            gameStatus: gameStatus
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
        awayTeamDiv.innerHTML = `
            <img src="${game.awayLogo}" alt="${game.awayTeam} Logo">
            <span class="score">${game.awayScore}</span>
        `;

        const homeTeamDiv = document.createElement('div');
        homeTeamDiv.classList.add('team');
        homeTeamDiv.innerHTML = `
            <img src="${game.homeLogo}" alt="${game.homeTeam} Logo">
            <span class="score">${game.homeScore}</span>
        `;

        homeTeamDiv.style.backgroundColor = game.homeColor;
        awayTeamDiv.style.backgroundColor = game.awayColor;
        homeTeamDiv.style.color = game.homeText;
        awayTeamDiv.style.color = game.awayText;

        const gameDateDiv = document.createElement('div');
        gameDateDiv.classList.add('game-date');
        gameDateDiv.textContent = `${formatGameDate(game.date)}`;

        if (game.gameStatus === "post") {
            if(game.homeScore < game.awayScore){
                gameDiv.appendChild(awayTeamDiv);
                gameDiv.appendChild(homeTeamDiv);
                gameDiv.appendChild(gameDateDiv);
            } else {
                gameDiv.appendChild(homeTeamDiv);
                gameDiv.appendChild(awayTeamDiv);
                gameDiv.appendChild(gameDateDiv);
            }
            containerPast.appendChild(gameDiv);
            gameDateDiv.textContent = "Final";
        } else {

            gameDiv.appendChild(awayTeamDiv);
            gameDiv.appendChild(homeTeamDiv);
            gameDiv.appendChild(gameDateDiv);
            if (game.gameStatus === "live") {
                gameDateDiv.innerHTML = `<span style="color: #e13534;">Live</span>&nbsp;&nbsp;&nbsp;${game.inning}`;
            }
            container.appendChild(gameDiv);
        }
    });
}



getGamesForAllTeams();

