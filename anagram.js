document.addEventListener('DOMContentLoaded', function () {
    startGame();
});

const easyWords = [
    'cat', 'dog', 'bat', 'sun', 'pen',
    'top', 'cup', 'man', 'map', 'run',
    'fit', 'box', 'hot', 'jar', 'red',
    'sky', 'fun', 'key', 'cow', 'hat',
    'hit', 'zip', 'car', 'bag', 'lip',
    'mix', 'nut', 'oak', 'pig', 'rug',
    'sad', 'tap', 'van', 'wet', 'yak',
    'zoo', 'mob', 'new', 'job', 'joy',
    'kid', 'elm', 'fix', 'gem', 'cry',
    'bus', 'cup', 'cry', 'bud', 'ice'
  ];
  const mediumWords = [
    'blue', 'moon', 'tree', 'jump', 'cake',
    'fish', 'time', 'hair', 'fire', 'bird',
    'bear', 'lake', 'frog', 'book', 'song',
    'desk', 'lamp', 'star', 'ship', 'gold',
    'rose', 'road', 'love', 'sand', 'game',
    'cool', 'warm', 'dark', 'light', 'wind',
    'kite', 'park', 'bees', 'frog', 'nest',
    'leaf', 'pear', 'pine', 'ruby', 'fish',
    'palm', 'rose', 'fern', 'coal', 'puma',
    'bark', 'moon', 'wood', 'king', 'page',
    'club', 'fish', 'iron', 'mars', 'mars',
    'brim', 'pier', 'mint', 'zone', 'tank',
    'rope', 'duck', 'soil', 'mint', 'beak',
    'note', 'yoga', 'land', 'wise', 'salt',
    'rope', 'vent', 'hike', 'belt', 'soda',
    'page', 'club', 'bell', 'ball', 'lime',
    'cola', 'jazz', 'folk', 'duck', 'spin',
    'palm', 'bees', 'wise', 'dirt', 'lime',
    'seed', 'bark', 'wing', 'club', 'hint',
    'play', 'bend', 'case', 'rose', 'fall',
    'skip', 'bolt', 'wage', 'jade', 'path',
    'pave', 'rope', 'deck', 'file', 'flap',
    'give', 'goal', 'fire', 'herb', 'earn',
    'whip', 'hail', 'doze', 'edit', 'jump'
  ];
  const hardWords = [
    'yellow', 'summer', 'purple', 'breeze', 'silent',
    'travel', 'family', 'mystery', 'balance', 'freedom',
    'journey', 'glitter', 'justice', 'promise', 'whisper',
    'kindness', 'harmony', 'inspire', 'passion', 'fantasy',
    'discover', 'champion', 'gravity', 'network', 'sincere',
    'captain', 'prosper', 'loyalty', 'perfect', 'weather',
    'chocolate', 'victory', 'gardens', 'patient', 'harbor',
    'diamond', 'freestyle', 'enchant', 'symphony', 'friendly',
    'bravery', 'paradise', 'splendid', 'refresh', 'favorite',
    'creation', 'eternal', 'wholesome', 'identity', 'charming',
    'celebrate', 'melody', 'tropical', 'elegant', 'delicate',
    'serenity', 'radiant', 'spirited', 'fantastic', 'precious',
    'memories', 'adventure', 'illuminate', 'treasure', 'morning',
    'tranquil', 'tranquility', 'beautiful', 'captivate', 'graceful',
    'wonderful', 'delightful', 'joyful', 'wholesome', 'positive',
    'captivating', 'effortless', 'festive', 'infinite', 'miracle',
    'majestic', 'sincere', 'vibrant', 'sparkle', 'infinity',
    'blossom', 'whispering', 'delight', 'glamorous', 'radiance',
    'serendipity', 'gentle', 'happiness', 'peaceful', 'gratitude',
    'tranquility', 'cheerful', 'breathe', 'laughter', 'genuine',
    'inspiration', 'harmonious', 'blessings', 'wonder', 'serene',
    'extraordinary', 'elegance', 'glorious', 'fabulous', 'brilliant',
    'precious', 'vivid', 'bountiful', 'effervescent', 'enjoyment',
    'heartfelt', 'grateful', 'vitality', 'abundant', 'sunshine',
    'radiant', 'blossoming', 'exquisite', 'illumination', 'laughter',
    'blissful', 'enchanted', 'enrich', 'majestic', 'revel',
    'splendid', 'joyous', 'sunbeam', 'glow', 'resplendent',
    'serendipity', 'lively', 'luminous', 'mesmerize', 'optimistic',
    'paradise', 'purity', 'quaint', 'reflection', 'rhapsody',
    'sumptuous', 'tender', 'thriving', 'vivid', 'wondrous',
    'zenith', 'adorn', 'affection', 'alacrity', 'beauty',
    'blithe', 'buoyant', 'cherish', 'cosmic', 'courage',
    'dazzle', 'effulgent', 'exalt', 'felicitous', 'gleam',
    'halcyon', 'incandescent', 'joie de vivre', 'kaleidoscope',
    'lilt', 'luminescent', 'mirth', 'nirvana', 'opulent',
    'quiescent', 'radiate', 'seraphic', 'sublime', 'tranquil',
    'uplifting', 'vivacious', 'waltz', 'xanadu', 'youthful',
    'zeal', 'amicable', 'bliss', 'comely', 'dazzling',
    'ecstasy', 'felicity', 'glee', 'harmonize', 'idyllic',
    'jubilant', 'kiss', 'luminary', 'magnify', 'noble',
    'oasis', 'panache', 'quell', 'rapture', 'serene',
    'thrive', 'utopia', 'verdant', 'whimsical', 'xenial',
    'yearn', 'zephyr', 'ascend', 'bloom', 'celestial',
    'divine', 'effervesce', 'felicity', 'grace', 'halo',
    'imagine', 'jovial', 'kindred', 'luscious', 'mystical',
    'nectar', 'oceanic', 'paragon', 'quintessence', 'rhapsodic',
    'seraph', 'triumph', 'upbeat', 'vitalize', 'wonder',
    'zenithal', 'amiable', 'blithe', 'communion', 'divinity',
    'elan', 'fountain', 'glisten', 'harbor', 'inspire',
    'jocund', 'kindle', 'lustrous', 'mesmerize', 'nurture',
    'overture', 'placid', 'quiescent', 'resonate', 'serenity',
    'tranquilize', 'uplifting', 'veranda', 'whisper', 'xanadu',
    'yonder', 'zealot'
  ];
  const expertWords = [
    'elephant', 'computer', 'language', 'beautiful', 'education',
  'knowledge', 'challenge', 'celebrate', 'restaurant', 'experience',
  'community', 'impressive', 'technology', 'innovation', 'celebration',
  'friendship', 'creativity', 'architecture', 'university', 'exploration',
  'opportunity', 'enthusiasm', 'leadership', 'discovery', 'participation',
  'communication', 'information', 'motivation', 'organization', 'efficiency',
  'integration', 'performance', 'reliability', 'resilience', 'sustainability',
  'effortless', 'entertainment', 'refreshment', 'fascinating', 'interaction',
  'collaboration', 'cooperation', 'hospitality', 'happiness', 'relationship',
  'achievement', 'entertainment', 'flexibility', 'imagination', 'volunteer',
  'reputation', 'recognition', 'satisfaction', 'accountability', 'contribution',
  'determination', 'environment', 'perspective', 'congratulation', 'creativity',
  'communication', 'compassion', 'relationship', 'understanding', 'acceptance',
  'appreciation', 'opportunity', 'organization', 'integrity', 'intelligence',
  'celebration', 'communication', 'flexibility', 'resilience', 'sustainability',
  'inspiration', 'perseverance', 'motivation', 'enthusiasm', 'interaction',
  'transformation', 'responsibility', 'accountability', 'collaboration', 'leadership',
  'efficiency', 'achievement', 'celebration', 'friendship', 'community', 'environment',
  'organization', 'creativity', 'communication', 'collaboration', 'experience', 'innovation',
  'entertainment', 'perseverance', 'celebration', 'imagination', 'participation', 'education',
  'recognition', 'motivation', 'effortless', 'technology', 'relationship', 'contribution',
  'hospitality', 'exploration', 'communication', 'appreciation', 'opportunity', 'efficiency',
  'experience', 'collaboration', 'communication', 'technology', 'organization', 'flexibility',
  'entertainment', 'hospitality', 'celebration', 'efficiency', 'motivation', 'enthusiasm',
  'community', 'interaction', 'technology', 'celebration', 'organization', 'imagination',
  'experience', 'enthusiasm', 'relationship', 'celebration', 'environment', 'collaboration',
  'communication', 'technology', 'organization', 'collaboration', 'efficiency', 'experience',
  'innovation', 'enthusiasm', 'relationship', 'celebration', 'community', 'exploration',
  'communication', 'appreciation', 'opportunity', 'efficiency', 'experience', 'community',
  'celebration', 'organization', 'technology', 'efficiency', 'enthusiasm', 'collaboration',
  'experience', 'relationship', 'imagination', 'hospitality', 'communication', 'celebration',
  'efficiency', 'technology', 'enthusiasm', 'community', 'exploration', 'experience', 'innovation',
  'celebration', 'relationship', 'organization', 'communication', 'enthusiasm', 'efficiency',
  'experience', 'collaboration', 'imagination', 'technology', 'celebration', 'hospitality',
  'community', 'efficiency', 'organization', 'experience', 'innovation', 'communication',
  'celebration', 'exploration', 'relationship', 'imagination', 'technology', 'enthusiasm',
  'efficiency', 'community', 'experience', 'celebration', 'organization', 'collaboration',
  'relationship', 'technology', 'enthusiasm', 'imagination', 'efficiency', 'hospitality',
  'communication', 'exploration', 'experience', 'celebration', 'organization', 'community',
  'innovation', 'technology', 'efficiency', 'relationship', 'enthusiasm', 'collaboration',
  'imagination', 'celebration', 'hospitality', 'communication', 'experience', 'organization',
  'efficiency', 'technology', 'innovation', 'relationship', 'community', 'enthusiasm', 'celebration',
  'collaboration', 'imagination', 'communication', 'efficiency', 'organization', 'experience',
  'technology', 'enthusiasm', 'celebration', 'relationship', 'hospitality', 'exploration', 'community',
  'efficiency', 'innovation', 'imagination', 'collaboration', 'technology', 'organization', 'relationship',
  'celebration', 'experience', 'enthusiasm', 'communication', 'efficiency', 'collaboration', 'innovation',
  'technology', 'relationship', 'exploration', 'celebration', 'community', 'experience', 'hospitality',
  'efficiency', 'organization', 'imagination', 'enthusiasm', 'collaboration', 'technology', 'relationship',
  'celebration', 'innovation', 'community', 'experience', 'efficiency', 'exploration', 'communication',
  'enthusiasm', 'imagination', 'technology', 'organization', 'relationship', 'celebration', 'collaboration',
  'hospitality', 'experience', 'efficiency', 'innovation', 'enthusiasm', 'technology', 'communication',
  'collaboration', 'organization', 'imagination', 'celebration', 'exploration', 'relationship', 'efficiency',
  'enthusiasm', 'experience', 'community', 'technology', 'innovation', 'efficiency', 'organization', 'communication',
  'relationship', 'experience', 'celebration', 'imagination', 'community', 'enthusiasm', 'collaboration', 'hospitality',
  'technology', 'efficiency', 'organization', 'relationship', 'exploration', 'communication', 'innovation', 'celebration',
  'experience', 'imagination', 'enthusiasm', 'collaboration', 'efficiency', 'technology', 'organization', 'relationship',
  'celebration', 'hospitality', 'exploration', 'community', 'innovation', 'experience', 'communication', 'efficiency',
  'imagination', 'technology', 'relationship', 'enthusiasm', 'celebration', 'collaboration', 'community', 'hospitality',
  'exploration', 'organization', 'relationship', 'efficiency', 'technology', 'imagination', 'celebration', 'experience',
  'enthusiasm', 'collaboration', 'efficiency', 'communication'
  ];

let currentWordIndex = 0;
let wrongGuesses = 0;
let totalRightGuesses = 0;
let currentWord = ''; // New variable to store the current word
let scrambledWord = '';

function startGame() {
    showNextWord();
}

function getRandomWord(wordArray) {
    const randomIndex = Math.floor(Math.random() * wordArray.length);
    return wordArray[randomIndex];
}

function scrambleWord(word) {
    return word.split('').sort(() => Math.random() - 0.5).join('');
}

function showNextWord() {
    let selectedWord;
    let selectedDifficulty;

    if (currentWordIndex < 4) {
        selectedWord = getRandomWord(easyWords);
        selectedDifficulty = 'easy';
    } else if (currentWordIndex < 8) {
        selectedWord = getRandomWord(mediumWords);
        selectedDifficulty = 'medium';
    } else if (currentWordIndex < 13) {
        selectedWord = getRandomWord(hardWords);
        selectedDifficulty = 'hard';
    } else {
        selectedWord = getRandomWord(expertWords);
        selectedDifficulty = 'expert';
    }

    currentWord = selectedWord; // Store the current word
    displayWord(selectedWord, selectedDifficulty);
}

function displayWord(word, difficulty) {
    scrambledWord = scrambleWord(word);
    document.getElementById('letterSquares').innerHTML = scrambledWord.split('').map(letter =>
        `<div class="letterSquare">${letter}</div>`
    ).join('');

    // Other UI updates or styling adjustments based on difficulty (if needed)

    // Reset feedback, input, and lives
    document.getElementById('feedback').innerText = '';
    document.getElementById('guessInput').value = '';
    updateLives();
}

function updateLives() {
    const remainingLives = 5 - wrongGuesses;
    const livesContainer = document.getElementById('lives');
    
    // Clear existing content
    livesContainer.innerHTML = '';

    // Add the word "Lives: "
    livesContainer.innerHTML += 'Lives: ';

    // Add tally marks based on remaining lives
    for (let i = 0; i < remainingLives; i++) {
        const tallyMark = document.createElement('div');
        tallyMark.classList.add('tally');
        livesContainer.appendChild(tallyMark);
    }
}

function submitGuess() {
    const guessInput = document.getElementById('guessInput');
    const guess = guessInput.value.toLowerCase();
    const correctWord = currentWord.toLowerCase();

    if (guess === correctWord) {
        totalRightGuesses++;
    } else {
        wrongGuesses++;
        guessInput.value = '';
        updateLives();

        if (wrongGuesses >= 5) {
            endGame();
            return;
        }

        // Don't increment currentWordIndex on wrong guess
        return;
    }

    currentWordIndex++;
    showNextWord();
}

document.getElementById('guessInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        submitGuess();
    }
});

function getCurrentWord() {
    return currentWord;
}

function endGame() {
    document.getElementById('feedback').innerText = `Game Over! Total Right Guesses: ${totalRightGuesses}`;
    // You can add additional logic for game end actions, such as displaying a replay button.
}
