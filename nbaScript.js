document.addEventListener("DOMContentLoaded", function() {
  // Select all the nav buttons
  const navButtons = document.querySelectorAll('.nav-button');
  let originalActive = document.querySelector('.nav-button.active');

  // Add hover and mouseout event listeners to each button
  navButtons.forEach(function(button) {
      button.addEventListener('mouseenter', function() {
          // If the hovered button is not the active one, deactivate the original active
          if (!button.classList.contains('active')) {
              originalActive.classList.remove('active');
              button.classList.add('active');
          }
      });

      button.addEventListener('mouseleave', function() {
          // Reset the original active when no longer hovering over a different button
          if (originalActive && button !== originalActive) {
              button.classList.remove('active');
              originalActive.classList.add('active');
          }
      });
  });
});

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
    "ATL": {
      "color": "#c8102e",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/atl.png"
    },
    "BOS": {
      "color": "#008348",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/bos.png"
    },
    "BKN": {
      "color": "#ffffff",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/bkn.png"
    },
    "CHA": {
      "color": "#008ca8",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/cha.png"
    },
    "CHI": {
      "color": "#ce1141",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/chi.png"
    },
    "CLE": {
      "color": "#860038",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/cle.png"
    },
    "DAL": {
      "color": "#0064b1",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/dal.png"
    },
    "DEN": {
      "color": "#0e2240",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/den.png"
    },
    "DET": {
      "color": "#1d428a",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/det.png"
    },
    "GS": {
      "color": "#fdb927",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/gs.png"
    },
    "HOU": {
      "color": "#ce1141",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/hou.png"
    },
    "IND": {
      "color": "#002d62",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/ind.png"
    },
    "LAC": {
      "color": "#12173f",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/lac.png"
    },
    "LAL": {
      "color": "#552583",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/lal.png"
    },
    "MEM": {
      "color": "#5d76a9",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/mem.png"
    },
    "MIA": {
      "color": "#98002e",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/mia.png"
    },
    "MIL": {
      "color": "#00471b",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/mil.png"
    },
    "MIN": {
      "color": "#266092",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/min.png"
    },
    "NO": {
      "color": "#0a2240",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/no.png"
    },
    "NY": {
      "color": "#1d428a",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/ny.png"
    },
    "OKC": {
      "color": "#007ac1",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/okc.png"
    },
    "ORL": {
      "color": "#0077c0",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/orl.png"
    },
    "PHI": {
      "color": "#1d428a",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/phi.png"
    },
    "PHX": {
      "color": "#29127a",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/phx.png"
    },
    "POR": {
      "color": "#e03a3e",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/por.png"
    },
    "SAC": {
      "color": "#5a2d81",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/sac.png"
    },
    "SA": {
      "color": "#c4ced4",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/sa.png"
    },
    "TOR": {
      "color": "#d91244",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/tor.png"
    },
    "UTAH": {
      "color": "#fff21f",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500/utah.png"
    },
    "WSH": {
      "color": "#e31837",
      "logo": "https://a.espncdn.com/i/teamlogos/nba/500-dark/wsh.png"
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
    const page = toHttps(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`);
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

        let homeLogoUrl = "";
        let homeColor = "";
        let awayLogoUrl = "";
        let awayColor = "";

        let hasHomeLogo = true;
        let hasAwayLogo = true;

        homeLogoUrl = teamInfo[home]?.logo ?? "";
        homeColor = teamInfo[home]?.color ?? "#121212";
        awayLogoUrl = teamInfo[away]?.logo ?? "";
        awayColor = teamInfo[away]?.color ?? "#121212";

        // Determine if logos exist (check if logo URL is empty or "none")
        hasHomeLogo = homeLogoUrl && homeLogoUrl !== "none";
        hasAwayLogo = awayLogoUrl && awayLogoUrl !== "none";


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
                <img src="${game.awayLogo}" alt="${game.awayTeam} Logo">
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
            <img src="${game.homeLogo}" alt="${game.homeTeam} Logo">
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
                gameDateDiv.innerHTML = `<span style="color: #e13534;">Live</span>&nbsp;&nbsp;&nbsp;${game.quarter}&nbsp;&nbsp;${game.clock}`;
            }
            container.appendChild(gameDiv);
        }
    });
}

getGamesForAllTeams();
