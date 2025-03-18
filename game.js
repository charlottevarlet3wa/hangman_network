let wordToGuess = "";
let displayedWord = [];
let wrongGuesses = [];
const maxTries = 10;
let score = 0;
let totalWords = 0;
let wordsList = [];
let damageToEnemy = 10; // initialisation random

async function fetchWords() {
  const response = await fetch("words.json");
  const data = await response.json();
  wordsList = shuffleArray(data.words);
  totalWords = wordsList.length;
  const scoreElem = (document.getElementById("score").innerHTML =
    "0/" + totalWords);
  pickWordAndInitialize();
}

// Utility function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }
  return array;
}

function pickWordAndInitialize() {
  if (wordsList.length === 0) {
    document.getElementById("nextBtn").style.display = "none";
    if (score === totalWords) {
      document.getElementById("status").innerText =
        "Bravo ! Tu as deviné tous les mots !";
    } else {
      document.getElementById("status").innerText = "Tu y es presque !";
    }
    return;
  }
  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("hint-container").style.display = "none";
  const wordObject = wordsList.splice(
    Math.floor(Math.random() * wordsList.length),
    1
  )[0];
  wordToGuess = wordObject.word;

  // Exclure les tirets et espaces du comptage effectif des lettres
  let effectiveLength = wordToGuess.replace(/[-\s]/g, "").length;
  damageToEnemy = Math.ceil(100 / Math.max(effectiveLength - 1, 1));

  console.log("damage to enemy : " + damageToEnemy);

  // Remplace les espaces par un caractère spécial insécable pour la lisibilité
  displayedWord = wordToGuess.split("").map((char) => {
    if (char === "-") return "-";
    if (char === " ") return "\xa0"; // Double espace insécable pour plus de visibilité
    return "_";
  });

  revealLetter(wordToGuess[0]);
  document.getElementById("wordToGuess").innerText = displayedWord.join(" ");
  document.getElementById("status").innerText = "";
  document.getElementById("hint").innerText = wordObject.hint; // Afficher l'indice
  document.getElementById("wrongGuesses").innerText = "";
  wrongGuesses = [];
  initializeKeyboard();
  resetHealth("enemy");
  resetHealth("hero");
}

document
  .getElementById("nextBtn")
  .addEventListener("click", pickWordAndInitialize);

function resetHealth(character) {
  const healthBar = document.getElementById(character + "-bar");
  healthBar.style.width = "100%";
  healthBar.style.backgroundColor = "rgba(79,185,212,1)";
}

function initializeKeyboard() {
  const letterContainer = document.getElementById("keyboard");
  letterContainer.innerHTML = ""; // Clear previous keyboard for new game
  for (let i = 65; i <= 90; i++) {
    const button = document.createElement("button");
    button.textContent = String.fromCharCode(i);
    button.classList.add("keyboard-button");
    button.disabled = false;
    button.addEventListener("click", function () {
      makeGuess(button.textContent);
      button.disabled = true;
    });
    letterContainer.appendChild(button);
  }
}

function revealLetter(guessedLetter) {
  const letterCount = wordToGuess
    .split("")
    .filter((letter) => letter === guessedLetter).length;
  wordToGuess.split("").forEach((letter, index) => {
    if (letter === guessedLetter) {
      displayedWord[index] = guessedLetter;
    }
  });
  reduceHealth(damageToEnemy * letterCount, "enemy");

  // Met à jour l'affichage en maintenant les espaces insécables
  document.getElementById("wordToGuess").innerText = displayedWord.join(" ");
}

function makeGuess(guessedLetter) {
  if (displayedWord.includes(guessedLetter)) return;
  revealLetter(guessedLetter);
  if (!wordToGuess.includes(guessedLetter)) {
    wrongGuesses.push(guessedLetter);
    document.getElementById("wrongGuesses").innerText = wrongGuesses.join(", ");
    reduceHealth(10, "hero");
  }
  updateGameStatus();
}

function updateGameStatus() {
  const statusElem = document.getElementById("status");
  const enemyElem = document.getElementById("enemy");
  const heroElem = document.getElementById("hero");

  // Vérifie si toutes les lettres ont été trouvées, en ignorant les espaces
  if (!displayedWord.includes("_")) {
    score++;
    document.getElementById("score").innerText = `${score}/${totalWords}`;
    if (wordsList.length > 0) {
      document.getElementById("nextBtn").style.display = "inline";
    } else {
      document.getElementById("status").innerText = "Bravo!";
      document.getElementById("nextBtn").style.display = "none";
    }
  } else if (wrongGuesses.length >= maxTries) {
    statusElem.innerText = wordToGuess;
    heroElem.classList.add("fade-out"); // Applique l'animation de disparition
    document.getElementById("nextBtn").style.display = "inline";
  }
}

function reduceHealth(percentage, character) {
  const healthBar = document.getElementById(character + "-bar");
  const currentHealthPercentage = parseFloat(healthBar.style.width);
  const newHealth = Math.max(0, currentHealthPercentage - percentage);
  healthBar.style.width = newHealth + "%";
  console.log("new HP : " + newHealth);
}

function resetHealth(character) {
  const healthBar = document.getElementById(character + "-bar");
  healthBar.style.width = "100%";
  healthBar.style.backgroundColor = "rgba(79,185,212,1)";

  if (character === "enemy") {
    const enemyElem = document.getElementById("enemy");
    enemyElem.classList.remove("fade-out"); // Reset animation
    enemyElem.style.opacity = 1; // Reset opacity
    return;
  }
  const heroElem = document.getElementById("hero");
  heroElem.classList.remove("fade-out"); // Reset animation
  heroElem.style.opacity = 1; // Reset opacity
}

window.onload = function () {
  fetchWords();
  setupKeyboardListeners();
};

function setupKeyboardListeners() {
  document.addEventListener("keydown", function (event) {
    const letter = event.key.toUpperCase();
    if (letter >= "A" && letter <= "Z") {
      const buttons = document.querySelectorAll(".keyboard-button");
      buttons.forEach((button) => {
        if (button.textContent === letter && !button.disabled) {
          button.click(); // Trigger the click event of the button
          button.disabled = true; // Disable the button
        }
      });
    }
  });
}

function toggleHint() {
  const hintElem = document.getElementById("hint-container");
  hintElem.style.display = hintElem.style.display === "none" ? "block" : "none";
}
