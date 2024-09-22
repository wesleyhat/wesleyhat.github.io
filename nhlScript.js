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
  "ANA": {
    "color": "#fc4c02",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/ana.png"
  },
  "BOS": {
    "color": "#fdbb30",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/bos.png"
  },
  "BUF": {
    "color": "#00468b",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/buf.png"
  },
  "CGY": {
    "color": "#dd1a32",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/cgy.png"
  },
  "CAR": {
    "color": "#e30426",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/car.png"
  },
  "CHI": {
    "color": "#e31937",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/chi.png"
  },
  "COL": {
    "color": "#860038",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/col.png"
  },
  "CBJ": {
    "color": "#002d62",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/cbj.png"
  },
  "DAL": {
    "color": "#20864c",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/dal.png"
  },
  "DET": {
    "color": "#e30526",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/det.png"
  },
  "EDM": {
    "color": "#00205b",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/edm.png"
  },
  "FLA": {
    "color": "#e51937",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/fla.png"
  },
  "LA": {
    "color": "#a2aaad",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/la.png"
  },
  "MIN": {
    "color": "#124734",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/min.png"
  },
  "MTL": {
    "color": "#c41230",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/mtl.png"
  },
  "NSH": {
    "color": "#fdba31",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/nsh.png"
  },
  "NJ": {
    "color": "#e30b2b",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/nj.png"
  },
  "NYI": {
    "color": "#00529b",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/nyi.png"
  },
  "NYR": {
    "color": "#0056ae",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/nyr.png"
  },
  "OTT": {
    "color": "#dd1a32",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/ott.png"
  },
  "PHI": {
    "color": "#fe5823",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/phi.png"
  },
  "PIT": {
    "color": "#fdb71a",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/pit.png"
  },
  "SJ": {
    "color": "#00788a",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/sj.png"
  },
  "SEA": {
    "color": "#000d33",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/sea.png"
  },
  "STL": {
    "color": "#00468b",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/stl.png"
  },
  "TB": {
    "color": "#003e7e",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/tb.png"
  },
  "TOR": {
    "color": "#003e7e",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/tor.png"
  },
  "UTAH": {
    "color": "#231F20",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/utah.png"
  },
  "VAN": {
    "color": "#003e7e",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/van.png"
  },
  "VGK": {
    "color": "#344043",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/vgk.png"
  },
  "WSH": {
    "color": "#d71830",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/wsh.png"
  },
  "WPG": {
    "color": "#002d62",
    "logo": "https://a.espncdn.com/i/teamlogos/nhl/500-dark/wpg.png"
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
    const page = toHttps(`https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard`);
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
                gameDateDiv.innerHTML = `<span style="color: #e13534;">Live</span>&nbsp;&nbsp;&nbsp;${game.quarter}&nbsp;&nbsp;${game.clock}`;
            }
            container.appendChild(gameDiv);
        }
    });
}

getGamesForAllTeams();
