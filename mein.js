let scoreUser = 0;
let scoreAI = 0;
let round = 0;
let gameMode = "ai";
let currentPlayer = "user";
let player1Choice = "";

let aiMode = "normal";
let userChoiceHistory = { r: 0, p: 0, s: 0 };
let lastUserMoves = [];

const scoreUser_span = document.getElementById("user-score");
const scoreAI_span = document.getElementById("AI-score");
const scoreBoard_div = document.querySelector(".score-board");
const result_div = document.querySelector(".result > p");
const rock_div = document.getElementById("r");
const scissors_div = document.getElementById("s");
const paper_div = document.getElementById("p");
const actionMessage = document.getElementById("action-message");
const turnIndicator = document.getElementById("turn-indicator");
const userLabel = document.getElementById("user-label");
const aiLabel = document.getElementById("AI-label");
const roundCounter = document.getElementById("round-counter");
const resetBtn = document.getElementById("reset-score");

document.querySelectorAll('input[name="ai-mode"]').forEach(input => {
  input.addEventListener("change", (e) => {
    aiMode = e.target.value;
  });
});

document.getElementById("fullscreen-btn").addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Mode toggle
document.getElementById("mode-ai").addEventListener("click", () => {
    gameMode = "ai";
    currentPlayer = "user";
    actionMessage.textContent = "VS AI Mode - Make your move!";
    turnIndicator.textContent = "Mode: VS AI";

    // Transisi badge
    fadeChange(userLabel, "user");
    fadeChange(aiLabel, "AI");

    userLabel.classList.remove("badge-glow");
    aiLabel.classList.remove("badge-glow");
});

document.getElementById("mode-p2").addEventListener("click", () => {
    gameMode = "p2";
    currentPlayer = "user";
    actionMessage.textContent = "VS Player 2 - Player 1's move!";
    turnIndicator.textContent = "Mode: VS Player 2 - Player 1's turn";

    // Transisi badge
    fadeChange(userLabel, "Player 1");
    fadeChange(aiLabel, "Player 2");

    updateBadgeHighlight();
});

// Transisi teks label
function fadeChange(element, newText) {
    element.style.opacity = "0";
    setTimeout(() => {
        element.textContent = newText;
        element.style.opacity = "1";
    }, 200);
}

// Main listener
function main() {
    rock_div.addEventListener("click", () => play("r"));
    scissors_div.addEventListener("click", () => play("s"));
    paper_div.addEventListener("click", () => play("p"));
}

// Mode switcher
function play(choice) {
    if (gameMode === "ai") {
        game(choice);
    } else {
        if (currentPlayer === "user") {
            player1Choice = choice;
            currentPlayer = "p2";
            actionMessage.textContent = "VS Player 2 - Player 2's move!";
            turnIndicator.textContent = "Mode: VS Player 2 - Player 2's turn";
            updateBadgeHighlight();
        } else {
            const player2Choice = choice;
            currentPlayer = "user";
            resolveP2Game(player1Choice, player2Choice);
            actionMessage.textContent = "VS Player 2 - Player 1's move!";
            turnIndicator.textContent = "Mode: VS Player 2 - Player 1's turn";
            updateBadgeHighlight();
        }
    }
}

// VS AI
function game(userChoice) {
    lastUserMoves.push(userChoice);
    if (lastUserMoves.length > 3) lastUserMoves.shift();
    userChoiceHistory[userChoice]++; // Track pilihan user

    const AIChoice = getAIChoice();
    switch (userChoice + AIChoice) {
        case "rs":
        case "sp":
        case "pr":
            win(userChoice, AIChoice);
            break;
        case "rp":
        case "sr":
        case "ps":
            lose(userChoice, AIChoice);
            break;
        case "rr":
        case "ss":
        case "pp":
            draw(userChoice, AIChoice);
            break;
    }
}

// VS Player 2
function resolveP2Game(p1, p2) {
    const smallUserWord = "(P1)".fontsize(3).sub();
    const smallAIWord = "(P2)".fontsize(3).sub();

    if (p1 === p2) {
        draw(p1, p2);
        result_div.innerHTML = `Both chose ${convert2word(p1)}. <strong>DRAW!</strong>`;
    } else if (
        (p1 === "r" && p2 === "s") ||
        (p1 === "s" && p2 === "p") ||
        (p1 === "p" && p2 === "r")
    ) {
        win(p1, p2);
        result_div.innerHTML = `${convert2word(p1)}${smallUserWord} beats ${convert2word(p2)}${smallAIWord}. <strong>Player 1 wins!</strong>`;
    } else {
        lose(p1, p2);
        result_div.innerHTML = `${convert2word(p2)}${smallAIWord} beats ${convert2word(p1)}${smallUserWord}. <strong>Player 2 wins!</strong>`;
    }
}

function getAIChoice() {
  if (aiMode === "medium") {
    // medium
    const maxChoice = Object.entries(userChoiceHistory).reduce((a, b) =>
      a[1] >= b[1] ? a : b
    )[0];

    return counterMove(maxChoice);
  }

  if (aiMode === "hard") {
    // Hard
    if (lastUserMoves.length < 3) {
      return randomMove();
    }

    const freq = { r: 0, p: 0, s: 0 };
    lastUserMoves.forEach(move => freq[move]++);

    const predicted = Object.entries(freq).reduce((a, b) =>
      a[1] >= b[1] ? a : b
    )[0];

    return counterMove(predicted);
  }

  // Normal AI
  return randomMove();
}

function counterMove(move) {
  switch (move) {
    case "r": return "p";
    case "p": return "s";
    case "s": return "r";
  }
}

function randomMove() {
  const choices = ["r", "p", "s"];
  return choices[Math.floor(Math.random() * 3)];
}


function win(userChoice, AIChoice) {
    scoreUser++;
    round++;
    roundCounter.textContent = `Round: ${round}`;
    scoreUser_span.innerHTML = scoreUser;
    scoreAI_span.innerHTML = scoreAI;
    result_div.className = "result-win";
    if (gameMode === "ai") {
        const smallUserWord = "(you)".fontsize(3).sub();
        const smallAIWord = "(AI)".fontsize(3).sub();
        result_div.innerHTML = `${convert2word(userChoice)}${smallUserWord} beats ${convert2word(AIChoice)}${smallAIWord}. <strong>You win!</strong>`;
    }
    document.getElementById(userChoice).classList.add("green-glow");
    setTimeout(() => {
        document.getElementById(userChoice).classList.remove("green-glow");
    }, 700);
    updateFontSize();
    localStorage.setItem("scoreUser", scoreUser);
    localStorage.setItem("scoreAI", scoreAI);
    localStorage.setItem("round", round);
}

function lose(userChoice, AIChoice) {
    scoreAI++;
    round++;
    roundCounter.textContent = `Round: ${round}`;
    scoreUser_span.innerHTML = scoreUser;
    scoreAI_span.innerHTML = scoreAI;
    result_div.className = "result-lose";
    if (gameMode === "ai") {
        const smallUserWord = "(you)".fontsize(3).sub();
        const smallAIWord = "(AI)".fontsize(3).sub();
        result_div.innerHTML = `${convert2word(AIChoice)}${smallAIWord} beats ${convert2word(userChoice)}${smallUserWord}. <strong>You lose!</strong>`;
    }
    document.getElementById(userChoice).classList.add("red-glow");
    setTimeout(() => {
        document.getElementById(userChoice).classList.remove("red-glow");
    }, 700);
    updateFontSize();
    localStorage.setItem("scoreUser", scoreUser);
    localStorage.setItem("scoreAI", scoreAI);
    localStorage.setItem("round", round);
}

function draw(userChoice, AIChoice) {
    round++;
    roundCounter.textContent = `Round: ${round}`;
    scoreUser_span.innerHTML = scoreUser;
    scoreAI_span.innerHTML = scoreAI;
    result_div.className = "result-draw";
    result_div.innerHTML = `Both chose ${convert2word(userChoice)}. <strong>DRAW!</strong>`;
    document.getElementById(userChoice).classList.add("blue-glow");
    setTimeout(() => {
        document.getElementById(userChoice).classList.remove("blue-glow");
    }, 700);
    updateFontSize();
    localStorage.setItem("scoreUser", scoreUser);
    localStorage.setItem("scoreAI", scoreAI);
    localStorage.setItem("round", round);
}

function convert2word(letter) {
    if (letter === "r") return "Rock";
    if (letter === "s") return "Scissors";
    if (letter === "p") return "Paper";
}

function updateFontSize() {
    const maxLength = Math.max(scoreUser.toString().length, scoreAI.toString().length);
    let fontSize;
    if (maxLength <= 2) {
        fontSize = "600px";
    } else if (maxLength === 3) {
        fontSize = "400px";
    } else {
        fontSize = "300px";
    }
    scoreUser_span.style.fontSize = fontSize;
    scoreAI_span.style.fontSize = fontSize;
}

function updateBadgeHighlight() {
    userLabel.classList.remove("badge-glow");
    aiLabel.classList.remove("badge-glow");

    if (gameMode === "p2") {
        if (currentPlayer === "user") {
            userLabel.classList.add("badge-glow");
        } else {
            aiLabel.classList.add("badge-glow");
        }
    }
}

function resetScore() {
    scoreUser = 0;
    scoreAI = 0;
    round = 0;

    scoreUser_span.innerHTML = scoreUser;
    scoreAI_span.innerHTML = scoreAI;
    roundCounter.textContent = `Round: ${round}`;
    updateFontSize();

    localStorage.setItem("scoreUser", scoreUser);
    localStorage.setItem("scoreAI", scoreAI);
    localStorage.setItem("round", round);
}

resetBtn.addEventListener("click", resetScore);

function loadSavedScore() {
    const savedUser = localStorage.getItem("scoreUser");
    const savedAI = localStorage.getItem("scoreAI");
    const savedRound = localStorage.getItem("round");

    if (savedUser !== null && savedAI !== null && savedRound !== null) {
        scoreUser = parseInt(savedUser);
        scoreAI = parseInt(savedAI);
        round = parseInt(savedRound);

        scoreUser_span.innerHTML = scoreUser;
        scoreAI_span.innerHTML = scoreAI;
        roundCounter.textContent = `Round: ${round}`;
        updateFontSize();
    }
}

main();
loadSavedScore();

