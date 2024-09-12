const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
console.log(currentDate)
let sYear;
sYear = currentDate.getFullYear();
let laborDay;
if (currentDate.getMonth() < 8) {
 laborDay = new Date(currentYear - 1, 8, 1);
} else {
 laborDay = new Date(currentYear, 8, 1);
}
// Get the day of the week for Labor Day (0 for Sunday, 1 for Monday, etc.)
const laborDayDayOfWeek = laborDay.getDay();
// Calculate the number of days to subtract to get the Tuesday before Labor Day
let daysToSubtract;
if (laborDayDayOfWeek === 0) {
 daysToSubtract = 5;
} else if (laborDayDayOfWeek === 1) {
 daysToSubtract = 6;
} else if (laborDayDayOfWeek === 2) {
 daysToSubtract = 0;
} else if (laborDayDayOfWeek === 3) {
 daysToSubtract = 1;
} else if (laborDayDayOfWeek === 4) {
 daysToSubtract = 2;
} else if (laborDayDayOfWeek === 5) {
 daysToSubtract = 3;
} else if (laborDayDayOfWeek === 6) {
 daysToSubtract = 4;
}
// Subtract the number of days to get the Tuesday before Labor Day
const tuesdayBeforeLaborDay = new Date(laborDay.getTime() - (daysToSubtract * 86400000));
// Create the "inputDate" variable
const inputDate = tuesdayBeforeLaborDay;
const inputTime = inputDate.getTime();
const currentTime = currentDate.getTime();
const weekDifference = (currentTime - inputTime) / (7 * 24 * 60 * 60 * 1000);
const weekNumber = Math.floor(weekDifference);
console.log(weekNumber)

var json;

const options = {method: 'GET', headers: {accept: 'application/json'}};

fetch('http://api.sportradar.us/nfl/official/trial/v7/en/games/' + sYear + '/REG/'+ weekNumber +'/schedule.json?api_key=mqOP3WFz3vXXAVoasREi6EyNqyL1KXh7no8lyYV6', options)
  .then(response => response.json())
  .then(response => {
    json = response;
  })
  .catch(err => console.error(err));


var page = 'http://api.sportradar.us/nfl/official/trial/v7/en/games/' + sYear + '/REG/'+ weekNumber +'/schedule.json?api_key='



console.log(json)
var week= json["week"];
var games = week['games'];
let homeTeam = "";
let awayTeam = "";
let homeScore = 0;
let awayScore = 0;
let foundGame = false;
let teamName = "Atlanta Falcons"
for (const game of games) {
  const gameDate = new Date(game.scheduled);
  if(game.home.name === teamName || game.away.name === teamName) {
   const gameDay = gameDate.getDate();
   const gameMonth = gameDate.getMonth();
   homeTeam = game.home.name;
   awayTeam = game.away.name;
   foundGame = true;  

   if(gameDate.getTime() >=    currentDate.getTime()){
     let dateText = monthArray[gameMonth] + " " + gameDay;
     

     let awayTeamText = awayTeam;
    
     let atText = "at";

     let homeTeamText = homeTeam;
     
   }
   else{
     homeTeam = game.home.alias;
     homeScore= game.scoring.home_points;
     awayTeam = game.away.alias;
     awayScore = game.scoring.away_points;

     let teamText = homeTeam + '  |  ' + awayTeam;
     
     let scoreText = homeScore + '  -  ' + awayScore;
     
   }
 }
}
if(!foundGame){
 let noGameText = "No Game";
 
}
