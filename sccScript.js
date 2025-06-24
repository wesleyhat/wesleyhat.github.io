let numbs = [];
let first = true;
let turn = 0;
let total = 0;

let btn = document.getElementById("roll");
btn.textContent = "Roll " + (turn + 1);

btn.onclick = function () {
    
    const diceContainer = document.getElementById("diceContainer");
    const six = document.getElementById("six");
    const five = document.getElementById("five");
    const four = document.getElementById("four");

    const numbLength = first ? 6 : numbs.length;
    first = false;

    // Generate or re-roll unsaved dice
    if (numbs.length === 0) {
        for (let i = 0; i < numbLength; i++) {
            numbs.push({ value: Math.floor(Math.random() * 6) + 1, saved: false });
        }
    } else {
        numbs = numbs.map(die =>
            die.saved ? die : { value: Math.floor(Math.random() * 6) + 1, saved: false }
        );
    }

    diceContainer.innerHTML = "";

    // Render all dice and animate
    numbs.forEach((die, i) => {
        const dice = document.createElement("div");
        dice.classList.add("dice");
        if (die.saved) dice.classList.add("saved");

        const img = document.createElement("img");
        img.alt = `Rolling...`;
        img.classList.add("dice-image");

        // Set a random face to avoid showing a blank image initially
        if (!die.saved) {
            const tempValue = Math.floor(Math.random() * 6) + 1;
            img.src = `dice${tempValue}.png`;
            rollDieAnimation(img, die.value);
        } else {
            img.src = `dice${die.value}.png`;
        }

        dice.appendChild(img);


        diceContainer.appendChild(dice);
    });

    // Delay placement until after animation
    setTimeout(() => {
        const placed = { six: false, five: false, four: false };
        const used = new Set();

        const hasSix = numbs.some(die => die.value === 6);
        const hasFive = numbs.some(die => die.value === 5);
        const hasFour = numbs.some(die => die.value === 4);

        if (hasSix && !six.hasChildNodes()) {
            const index = numbs.findIndex(die => die.value === 6);
            if (index !== -1) {
                const sixImg = document.createElement("img");
                sixImg.src = `dice6.png`;
                sixImg.alt = `Dice 6`;
                sixImg.classList.add("dice-image");
                six.appendChild(sixImg);
                used.add(index);
                placed.six = true;
            }
        }

        if (hasFive && six.hasChildNodes() && !five.hasChildNodes()) {
            const index = numbs.findIndex((die, i) => die.value === 5 && !used.has(i));
            if (index !== -1) {
                const fiveImg = document.createElement("img");
                fiveImg.src = `dice5.png`;
                fiveImg.alt = `Dice 5`;
                fiveImg.classList.add("dice-image");
                five.appendChild(fiveImg);
                used.add(index);
                placed.five = true;
            }
        }

        if (hasFour && five.hasChildNodes() && !four.hasChildNodes()) {
            const index = numbs.findIndex((die, i) => die.value === 4 && !used.has(i));
            if (index !== -1) {
                const fourImg = document.createElement("img");
                fourImg.src = `dice4.png`;
                fourImg.alt = `Dice 4`;
                fourImg.classList.add("dice-image");
                four.appendChild(fourImg);
                used.add(index);
                placed.four = true;
            }
        }

        // Remove used dice and re-render remaining
        numbs = numbs.filter((_, i) => !used.has(i));
        diceContainer.innerHTML = "";

        // Check if dice can now be saved
        const canSave =
            six.hasChildNodes() &&
            five.hasChildNodes() &&
            four.hasChildNodes();

        // Re-render remaining dice
        numbs.forEach((die, i) => {
            const dice = document.createElement("div");
            dice.classList.add("dice");
            if (die.saved) dice.classList.add("saved");

            const img = document.createElement("img");
            img.src = `dice${die.value}.png`;
            img.alt = `Dice ${die.value}`;
            img.classList.add("dice-image");
            dice.appendChild(img);

            if (canSave) {
                dice.addEventListener("click", () => {
                    die.saved = !die.saved;
                    dice.classList.toggle("saved");
                });
            }

            diceContainer.appendChild(dice);
        });

        if (canSave) {
            total = numbs.reduce((sum, die) => sum + die.value, 0);
        }

        if (turn === 2) {
            let end = document.getElementById("end");
            

            setTimeout(() => {
                end.style.display = "block"  
            }, 100);

            let totalText = document.getElementById("total-text");
            totalText.textContent = "Total: " + total;
            totalText.style.display = "flex";
            btn.textContent = "Play again";
            btn.onclick = () => location.reload();
            // Remove the current onclick logic so the page just reloads on next click
            return;  // Exit here so turn++ and btn.textContent update below don't run
        }

        turn += 1;
        if (turn < 3) {
            btn.textContent = "Roll " + (turn + 1);
        }
    }, 1800); // Wait for animation to finish
};

function rollDieAnimation(imgElement, finalValue) {
    const sound = document.getElementById("dice-sound");

    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => {
            console.log("Sound playback blocked or failed", err);
        });
    }

    let counter = 0;
    const interval = setInterval(() => {
        const randomValue = Math.floor(Math.random() * 6) + 1;
        imgElement.src = `dice${randomValue}.png`;
        counter++;
    }, 60);

    setTimeout(() => {
        clearInterval(interval);
        imgElement.src = `dice${finalValue}.png`;
    }, 1600);
}
