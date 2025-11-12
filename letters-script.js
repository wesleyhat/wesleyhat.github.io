const letterDiv = document.getElementById('letter');
const currentRowDiv = document.getElementById('currentRow');

let currentLetters = 'asdfghjkl'; // Default to A-L row
let spacePressed = false; // Flag to check if SPACE is pressed
let muted = true;

// Function to get a random letter from selected row
function getRandomLetter() {
  return currentLetters[Math.floor(Math.random() * currentLetters.length)];
}

// Show a new letter
function showNewLetter() {
  const newLetter = getRandomLetter();
  letterDiv.textContent = newLetter;
  letterDiv.className = ''; // reset classes
// --- Speak the new letter ---
  const utterance = new SpeechSynthesisUtterance(newLetter);
  utterance.rate = 1;   // normal speed
  utterance.pitch = 1;  // normal pitch
  utterance.volume = 1; // full volume

  // Try to find "Mark" voice
  const voices = speechSynthesis.getVoices();
  const markVoice = voices.find(v => v.name.toLowerCase().includes("mark"));
  if (markVoice) {
    utterance.voice = markVoice;
  }

  // Speak the letter
  speechSynthesis.cancel(); // stop any currently playing speech
  if(!muted){
    speechSynthesis.speak(utterance);
  }
}

// Ensure voices are loaded before first use
speechSynthesis.onvoiceschanged = () => {
  // Optional: preload Mark voice so it's ready immediately
  speechSynthesis.getVoices();
};

// Handle key presses for typing and row selection
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  // Detect SPACE press
  if (key === ' ') {
    spacePressed = true;
    e.preventDefault(); // prevent scrolling
    return;
  }

  // Row selection using SPACE + letter
  if (spacePressed) {
    switch (key) {
      case 'q':
        currentLetters = 'qwertyuiop';
        currentRowDiv.textContent = 'Top Row';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case 'a':
        currentLetters = 'asdfghjkl';
        currentRowDiv.textContent = 'Middle Row';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case 'g':
        currentLetters = 'asdfg';
        currentRowDiv.textContent = 'Middle Row';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case 'h':
        currentLetters = 'jkl';
        currentRowDiv.textContent = 'Middle Row';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case 'z':
        currentLetters = 'zxcvbnm';
        currentRowDiv.textContent = 'Bottom Row';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case '1': // SPACE+! for all letters
        currentLetters = 'abcdefghijklmnopqrstuvwxyz';
        currentRowDiv.textContent = 'All Rows';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case ';': // SPACE+! for all letters
        currentLetters = 'qwertyuiopasdfghjkl';
        currentRowDiv.textContent = 'Middle + Top Rows';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case '/': // SPACE+! for all letters
        currentLetters = 'asdfghjklzxcvbnm';
        currentRowDiv.textContent = 'Middle + Bottom Rows';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case 'P': // SPACE+! for all letters
        currentLetters = 'qwertyuiopzxcvbnm';
        currentRowDiv.textContent = 'Top + Bottom Rows';
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
        break;
      case 'm': // SPACE+! for all letters
        if(!muted){
            muted = true;
        }
        else {
            muted = false;
        }
    }
    spacePressed = false; // reset flag after selection
    e.preventDefault();
    return;
  }

  // Only process regular letter keys for typing
  if (key.length === 1 && key >= 'a' && key <= 'z') {
    if (key === letterDiv.textContent) {
      letterDiv.classList.add('correct');
      setTimeout(() => {
        letterDiv.classList.add('fade');
        setTimeout(showNewLetter, 300);
      }, 100);
    } else {
      letterDiv.classList.add('wrong');
    }
  }
});

// Reset SPACE flag if released
document.addEventListener('keyup', (e) => {
  if (e.key === ' ') spacePressed = false;
});

// Start the trainer
showNewLetter();



