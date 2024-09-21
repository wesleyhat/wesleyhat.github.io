function toHttps(url) {
    return url.replace(/^http:/, 'https:');
}

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

const teamInfo = {
    "ARI": {
        "color": "#a40227",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/ari.png"
    },
    "DET": {
        "color": "#0076b6",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/det.png"
    },
    "ATL": {
        "color": "#a71930",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/atl.png"
    },
    "KC": {
        "color": "#e31837",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/kc.png"
    },
    "DAL": {
        "color": "#002a5c",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/dal.png"
    },
    "BAL": {
        "color": "#29126f",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/bal.png"
    },
    "BUF": {
        "color": "#00338d",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/buf.png"
    },
    "JAX": {
        "color": "#007487",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/jax.png"
    },
    "LV": {
        "color": "#a5acaf",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/lv.png"
    },
    "CAR": {
        "color": "#0085ca",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/car.png"
    },
    "CHI": {
        "color": "#0b1c3a",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/chi.png"
    },
    "CIN": {
        "color": "#fb4f14",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/cin.png"
    },
    "WSH": {
        "color": "#5a1414",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/wsh.png"
    },
    "CLE": {
        "color": "#472a08",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/cle.png"
    },
    "NYG": {
        "color": "#003c7f",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/nyg.png"
    },
    "TB": {
        "color": "#bd1c36",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/tb.png"
    },
    "DEN": {
        "color": "#0a2343",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/den.png"
    },
    "TEN": {
        "color": "#4b92db",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/ten.png"
    },
    "GB": {
        "color": "#204e32",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/gb.png"
    },
    "IND": {
        "color": "#003b75",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/ind.png"
    },
    "PIT": {
        "color": "#ffb612",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/pit.png"
    },
    "LAC": {
        "color": "#0080c6",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/lac.png"
    },
    "LAR": {
        "color": "#003594",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/lar.png"
    },
    "SF": {
        "color": "#aa0000",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/sf.png"
    },
    "SEA": {
        "color": "#002a5c",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/sea.png"
    },
    "MIA": {
        "color": "#008e97",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/mia.png"
    },
    "MIN": {
        "color": "#4f2683",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/min.png"
    },
    "HOU": {
        "color": "#00143f",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/hou.png"
    },
    "NYJ": {
        "color": "#115740",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/nyj.png"
    },
    "NE": {
        "color": "#002a5c",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/ne.png"
    },
    "NO": {
        "color": "#d3bc8d",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/no.png"
    },
    "PHI": {
        "color": "#06424d",
        "logo": "https://a.espncdn.com/i/teamlogos/nfl/500-dark/phi.png"
    }
};

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
    const page = toHttps(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`);
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
            } else {
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
            gameStatus: gameStatus
        });
    }

    // Now inject the gamesInfo into the page
    displayGames(gamesInfo);

    console.log("Total number of APIs called: " + tally)

    // Hide the loading screen and show the games container
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('games-container').style.display = 'grid';

    // Adjust refresh interval based on live game status
    if (liveGameFound) {
        if (!intervalId) {
            refreshInterval = 30000; // Set to 30 seconds for live games
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

        gameDiv.appendChild(awayTeamDiv);
        gameDiv.appendChild(homeTeamDiv);
        gameDiv.appendChild(gameDateDiv);

        if (game.gameStatus === "post") {
            containerPast.appendChild(gameDiv);
            gameDateDiv.textContent = "Final";
        } else {
            if (game.gameStatus === "live") {
                gameDateDiv.innerHTML = `<span style="color: #e13534;">Live</span>&nbsp;&nbsp;${game.quarter}&nbsp;&nbsp;${game.clock}`;
            }
            container.appendChild(gameDiv);
        }
    });
}

getGamesForAllTeams();
