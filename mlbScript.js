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

export let teamInfo; // Declare and export teamInfo globally

export let circleImg = "https://wesleyhat.github.io/circle.png";

export async function loadLocalJSON() {
    const response = await fetch('info.json');
    const data = await response.json();
    
    teamInfo = data;
}

export function toHttps(url) {
    return url.replace(/^http:/, 'https:');
}

export function getPeriodString(period) {
    switch (period) {
        case 0: return "0";
        case 1: return "1st";
        case 2: return "2nd";
        case 3: return "3rd";
        case 4: return "4th";
        default: return "Invalid period";
    }
}

export function isSameDateAsToday(date) {
const today = new Date();

return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
);
}

export function formatGameDate(gameDate) {
    const date = new Date(gameDate);
    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const month = date.getMonth() + 1; // Months are zero-indexed
    const dayOfMonth = date.getDate();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    if(isSameDateAsToday(gameDate)){
    return `Today   ${hours}:${minutes}${ampm}`;
    } else {
    return `${day} ${month}/${dayOfMonth} ${hours}:${minutes}${ampm}`;    
    }
}
