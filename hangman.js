    const words = dictionary;

    var word = prompt("Enter Word:")

    if( word == "null" || word == null || word == "") {
        selectedWord = words[Math.floor(Math.random() * words.length)];
    } else {
        selectedWord = word;
    }
    
    let guessedWord = Array(selectedWord.length).fill('_');
    let incorrectGuesses = 0;


    updateWordDisplay();
    updateHangmanImage();

    const lettersContainer = document.getElementById('letters');
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i).toLowerCase();
      const letterButton = document.createElement('div');
      letterButton.className = 'letter';
      letterButton.textContent = letter;
      letterButton.addEventListener('click', () => handleLetterClick(letter, letterButton));
      lettersContainer.appendChild(letterButton);
    }

    function handleLetterClick(letter, btn) {

       

      if (selectedWord.includes(letter)) {
        for (let i = 0; i < selectedWord.length; i++) {
          if (selectedWord[i] === letter) {
            guessedWord[i] = letter;
          }
        }
        updateWordDisplay();
      } else {
        incorrectGuesses++;
        updateHangmanImage();
      }

      btn.style.background = "#333";

      checkGameStatus();
    }

    function updateWordDisplay() {
      const wordDisplay = document.getElementById('word-display');
      wordDisplay.textContent = guessedWord.join(' ');
    }

    function updateHangmanImage() {
      const hangmanImage = document.getElementById('hangman-image');
      const imagePath = `hangman${incorrectGuesses}.png`;
      hangmanImage.src = imagePath;
    }

    function checkGameStatus() {
      if (guessedWord.join('') === selectedWord) {
        alert('Congratulations! The word was: ' + selectedWord);
        resetGame();
      } else if (incorrectGuesses >= 6) {
        alert('Game over! The word was: ' + selectedWord);
        resetGame();
      }
    }

    function resetGame() {
        location.reload();
    }



