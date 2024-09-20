function toHttps(url) {
    return url.replace(/^http:/, 'https:');
}

function formatGameDate(gameDate) {
    const date = new Date(gameDate);
    
    // Get day, month, and year
    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const month = date.getMonth() + 1; // Months are zero-indexed
    const dayOfMonth = date.getDate();
    
    // Get hours and minutes
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes

    // Determine AM/PM and convert to 12-hour format
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Construct the formatted date string
    return `${day} ${month}/${dayOfMonth} ${hours}:${minutes}${ampm}`;
}

async function getGamesForAllTeams() {
    // Show the loading screen
    document.getElementById('loading-screen').style.display = 'flex';
    document.getElementById('games-container').style.display = 'none';

    let tally = 0;  // Initialize tally variable

    const teamsPage = toHttps("http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams");
    const teamsReq = await fetch(teamsPage);
    tally++;  // Increment tally for the teams API call
    const teamsData = await teamsReq.json();
    let sports = teamsData["sports"];
    let sport = sports[0];
    let leagues = sport["leagues"];
    let league = leagues[0];
    let teams = league["teams"];

    let ids = [];

    teams.forEach(item => {
        ids.push(item.team.id);  // Store all team IDs
    });

    const today = new Date();
    const currentYear = today.getFullYear();

    // Arrays to store unique game data
    let gameIds = [];  // To track unique games by ID
    let gamesInfo = [];  // To store the actual game data

    let firstTeam = ids[0];


    const page = toHttps(`http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${currentYear}/teams/${firstTeam}/events?lang=en&region=us`);
    const req = await fetch(page);
    tally++;  // Increment tally for each team API call
    const data = await req.json();
    const firstTeamSites = data.items.map(item => toHttps(item.$ref)); // Convert to HTTPS for each site

    const firstTeamDates = [];

    // Now fetch each site using the updated URLs
    for (const site of firstTeamSites) {
        const siteReq = await fetch(site);
        tally++;  // Increment tally for each team API call
        const siteRes = await siteReq.json();
        if (siteRes.date) {
            firstTeamDates.push(siteRes.date);
        } else {
            console.warn(`No date found for site: ${httpsUrl}`);
        }
    }

    const firstTeamFDates = firstTeamDates.map(date => new Date(date));
    let firstTeamDateIndex = findNextDateIndex(firstTeamFDates);

    for (const teamId of ids) {
        const page = toHttps(`http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${currentYear}/teams/${teamId}/events?lang=en&region=us`);
        const req = await fetch(page);
        tally++;  // Increment tally for each team API call
        const data = await req.json();
        let sites = data.items.map(item => toHttps(item.$ref)); // Convert to HTTPS for each site

        // Check if the index is valid for the current team's sites
        if (firstTeamDateIndex >= sites.length) {
            console.warn(`Index ${firstTeamDateIndex} is out of bounds for team ${teamId}`);
            continue; // Skip if the index is invalid
        }

        const currentSite = sites[firstTeamDateIndex]; // Get the specific site using the index
        const currentReq = await fetch(currentSite);
        tally++;  // Increment tally for the site API call
        const currentGame = await currentReq.json();
        
        const competitors = currentGame.competitions[0].competitors;
        const gameId = currentGame.id || currentGame.$ref;

        if (gameIds.includes(gameId)) {
            continue; // Skip if the game ID has already been processed
        }

        gameIds.push(gameId);

        const homeUrl = competitors[0].team.$ref;
        const awayUrl = competitors[1].team.$ref;

        const homeRequest = await fetch(toHttps(homeUrl)); // Convert to HTTPS
        const homeInfo = await homeRequest.json();

        const awayRequest = await fetch(toHttps(awayUrl)); // Convert to HTTPS
        const awayInfo = await awayRequest.json();

        let homeColor = homeInfo.color;
        let awayColor = awayInfo.color;


        let homeLogoUrl = homeInfo.logos[1].href;
        let awayLogoUrl = awayInfo.logos[1].href;

        let home = homeInfo.abbreviation;
        let away = awayInfo.abbreviation;

        if(home === "PIT" || home === "LV"){
            homeColor = homeInfo.alternateColor;
        }
        if(away === "PIT" || away === "LV"){
            awayColor = awayInfo.alternateColor;
        }

        const gameDate = new Date(currentGame.date);
        const currentDate = new Date();

        console.log(gameDate);

        const homeTeamScoreUrl = competitors[0].score.$ref;
        const awayTeamScoreUrl = competitors[1].score.$ref;

        const homeResponse = await fetch(toHttps(homeTeamScoreUrl)); // Convert to HTTPS
        const homeData = await homeResponse.json();

        const awayResponse = await fetch(toHttps(awayTeamScoreUrl)); // Convert to HTTPS
        const awayData = await awayResponse.json();

        let homeScore = homeData.value;
        let awayScore = awayData.value;

        let homeText = "ffffff";
        let awayText = "ffffff";

        let gameOpacity = "1";


        if (currentDate < gameDate) {
            homeScore = "--";
            awayScore = "--";
        }

        if(gameDate < currentDate) {

            if(homeScore > awayScore){
                awayColor = "0d0b15";
                awayText = "8c899c"
            } else {
                homeColor = "0d0b15";
                homeText = "8c899c"
            }

        }

        // Calculate the Start and End of the Week
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() + 5) % 7); // Tuesday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(currentDate);
        endOfWeek.setDate(currentDate.getDate() + (1 - currentDate.getDay() + 7) % 7); // Next Monday
        endOfWeek.setHours(23, 59, 59, 999);

        // Check if the game is within the current week
        if (gameDate >= startOfWeek && gameDate <= endOfWeek) {
            gamesInfo.push({
                gameId: gameId,
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
                gameOpacity: gameOpacity
            });
        }

        gamesInfo = gamesInfo
        .filter(game => game.date >= startOfWeek && game.date <= endOfWeek) // Filter within the current week
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date in ascending order

    }
    

    // Now inject the gamesInfo into the page
    displayGames(gamesInfo);

    // Hide the loading screen and show the games container
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('games-container').style.display = 'grid';  // Or flex/grid, depending on your layout

    // Log the total number of API calls made
    console.log(`Total API calls made: ${tally}`);

}

// Helper function to find the index of the next game date
function findNextDateIndex(dates) {
    const now = new Date();
    const dayOfWeek = now.getDay();  // Get the current day of the week (0 = Sunday, 6 = Saturday)
    
    // Get the most recent Thursday
    const lastThursday = new Date(now);
    const diffToThursday = (dayOfWeek >= 4) ? dayOfWeek - 4 : dayOfWeek + 3;  // How many days since last Thursday
    lastThursday.setDate(now.getDate() - diffToThursday);  // Set date to last Thursday
    
    // Loop through the dates and find the next game
    for (let i = 0; i < dates.length; i++) {
        const gameDate = dates[i];
        
        // If today is Friday through Monday and there's a Thursday game, display the *last* Thursday game
        if (dayOfWeek >= 5 || dayOfWeek <= 1) { // Friday (5) through Monday (1)


            if (gameDate.getDay() === 4 && 
                gameDate.getFullYear() === lastThursday.getFullYear() && 
                gameDate.getMonth() === lastThursday.getMonth() && 
                gameDate.getDate() === lastThursday.getDate()) 
                
            { // Check for *this past* Thursday
                return i;
            }
        }

        // Otherwise, find the next game in the future
        if (gameDate > now) {
            return i;
        }
    }

    return -1;  // No upcoming date found
}



// Function to display games on the webpage
function displayGames(games) {
    const container = document.getElementById('games-container');
    container.innerHTML = '';  // Clear any previous content

    const containerPast = document.getElementById('games-container-past');
    containerPast.innerHTML = '';  // Clear any previous content

    games.forEach(game => {

        // Create game container
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('game');

        gameDiv.style.opacity = game.gameOpacity;

        const awayTeamDiv = document.createElement('div');
        awayTeamDiv.classList.add('team');
        awayTeamDiv.innerHTML = `
            <img src="${game.awayLogo}" alt="${game.awayTeam} Logo">
            <span class="score">${game.awayScore}</span>
        `;

        // Create team elements
        const homeTeamDiv = document.createElement('div');
        homeTeamDiv.classList.add('team');
        homeTeamDiv.innerHTML = `
            <img src="${game.homeLogo}" alt="${game.homeTeam} Logo">
            <span class="score">${game.homeScore}</span>
        `;

        homeTeamDiv.style.backgroundColor = "#" + game.homeColor; // Set home team color
        awayTeamDiv.style.backgroundColor = "#" +  game.awayColor; // Set away team color
        homeTeamDiv.style.color = "#" + game.homeText;
        awayTeamDiv.style.color = "#" + game.awayText;

        // Create game date element
        const gameDateDiv = document.createElement('div');
        gameDateDiv.classList.add('game-date');
        gameDateDiv.textContent = `${formatGameDate(game.date)}`;

        // Append everything to gameDiv
        
        gameDiv.appendChild(awayTeamDiv);
        gameDiv.appendChild(homeTeamDiv);
        gameDiv.appendChild(gameDateDiv);

        const date = new Date();

        if(game.date < date) {
            // Append gameDiv to container
            containerPast.appendChild(gameDiv);

            console.log("game found")
        } else {
            // Append gameDiv to container
            container.appendChild(gameDiv);
        }

    });
}

// Call the function
getGamesForAllTeams();
