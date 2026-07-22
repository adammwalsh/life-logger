const DEFAULT_STATE = {
    players: {
        top: {
            name: "Sydney",
            life: 20,
            wins: 0,
            losses: 0
        },
        bottom: {
            name: "Adam",
            life: 20,
            wins: 0,
            losses: 0
        }
    },

    timer: {
        running: false,
        elapsed: 0,
        startTime: null
    },

    games: [],
    startingLife: 20
};


let state = loadState();
let lastState = null;


// Elements

const topLife = document.getElementById("sydney-life");
const bottomLife = document.getElementById("adam-life");

const topName = document.getElementById("sydney-name");
const bottomName = document.getElementById("adam-name");

const timer = document.getElementById("timer");

const gameOver = document.getElementById("game-over");
const winnerText = document.getElementById("winner-text");
const finalTime = document.getElementById("final-time");


// Buttons

document.getElementById("sydney-plus")
.onclick = () => changeLife("top",1);

document.getElementById("sydney-minus")
.onclick = () => changeLife("top",-1);

document.getElementById("adam-plus")
.onclick = () => changeLife("bottom",1);

document.getElementById("adam-minus")
.onclick = () => changeLife("bottom",-1);


document.getElementById("undo-button")
.onclick = undoGame;


document.getElementById("next-game-button")
.onclick = nextGame;


render();

setInterval(updateTimer, 1000);



function changeLife(player, amount){

    if(gameOverVisible()) return;


    lastState = JSON.stringify(state);


    if(!state.timer.running){

        state.timer.running = true;
        state.timer.startTime = Date.now();

    }


    state.players[player].life += amount;


    checkWinner();

    saveState();
    render();

}



function checkWinner(){

    let winner = null;
    let loser = null;


    if(state.players.top.life <= 0){

        winner = "bottom";
        loser = "top";

    }


    if(state.players.bottom.life <= 0){

        winner = "top";
        loser = "bottom";

    }


    if(winner){

        finishGame(winner, loser);

    }

}



function finishGame(winner, loser){

    state.timer.elapsed =
    Math.floor(
        (Date.now()-state.timer.startTime)/1000
    );


    state.timer.running = false;


    state.players[winner].wins++;
    state.players[loser].losses++;


    state.games.push({

        winner:
        state.players[winner].name,

        loser:
        state.players[loser].name,

        duration:
        state.timer.elapsed,

        date:
        new Date().toLocaleDateString()

    });


    winnerText.textContent =
    "🏆 " + state.players[winner].name + " Wins!";


    finalTime.textContent =
    "Time: " + formatTime(state.timer.elapsed);


    gameOver.classList.remove("hidden");


    saveState();

}



function nextGame(){

    state.players.top.life = state.startingLife;
    state.players.bottom.life = state.startingLife;


    state.timer = {

        running:false,

        elapsed:0,

        startTime:null

    };


    gameOver.classList.add("hidden");


    saveState();

    render();

}



function undoGame(){

    if(lastState){

        state = JSON.parse(lastState);

    }


    gameOver.classList.add("hidden");

    saveState();

    render();

}



function render(){

    topLife.textContent =
    state.players.top.life;

    bottomLife.textContent =
    state.players.bottom.life;


    topName.textContent =
    state.players.top.name;

    bottomName.textContent =
    state.players.bottom.name;


    updateTimer();

}



function updateTimer(){

    if(state.timer.running){

        state.timer.elapsed =
        Math.floor(
            (Date.now()-state.timer.startTime)/1000
        );

    }


    timer.textContent =
    "⏱ " + formatTime(state.timer.elapsed);

}



function formatTime(seconds){

    let minutes =
    Math.floor(seconds/60);

    let secs =
    seconds % 60;


    return (
        String(minutes).padStart(2,"0")
        + ":" +
        String(secs).padStart(2,"0")
    );

}



function gameOverVisible(){

    return !gameOver.classList.contains("hidden");

}



function saveState(){

    localStorage.setItem(
        "lifeLedger",
        JSON.stringify(state)
    );

}



function loadState(){

    let saved =
    localStorage.getItem("lifeLedger");


    if(saved){

        let loaded = JSON.parse(saved);


        // Upgrade old saves
        loaded.players.top.wins ??= 0;
        loaded.players.top.losses ??= 0;
        loaded.players.bottom.wins ??= 0;
        loaded.players.bottom.losses ??= 0;
        loaded.games ??= [];
        loaded.startingLife ??= 20;


        return loaded;

    }


    return structuredClone(DEFAULT_STATE);

}

// ============= NAVIGATION & SETTINGS =============

const pages = {
    game: document.getElementById("game-screen"),
    season: document.getElementById("season-screen"),
    history: document.getElementById("history-screen"),
    settings: document.getElementById("settings-screen")
};

const pageOrder = ['game', 'season', 'history', 'settings'];
let currentPage = 'game';
let isAnimating = false;

// Wait for DOM to be ready, then set up nav and settings
function setupUI() {
    const navButtons = document.querySelectorAll("nav button");
    
    if (navButtons.length === 0) {
        console.error("Navigation buttons not found!");
        return;
    }
    
    // Setup navigation
    navButtons.forEach(button => {
        button.onclick = (e) => {
            e.preventDefault();
            if (!isAnimating) {
                navigateTo(button.dataset.page);
            }
        };
    });
    
    // Initialize first page as active
    document.querySelector('nav button[data-page="game"]').classList.add("active");
    
    // Setup settings buttons
    setupSettingsButtons();
}

function setupSettingsButtons() {
    const life20 = document.getElementById("life-20");
    const life30 = document.getElementById("life-30");
    const life40 = document.getElementById("life-40");
    const resetSeason = document.getElementById("reset-season");
    const clearHistory = document.getElementById("clear-history");
    const resetAll = document.getElementById("reset-all");
    
    if (life20) life20.onclick = () => updateSettingsLife(20);
    if (life30) life30.onclick = () => updateSettingsLife(30);
    if (life40) life40.onclick = () => updateSettingsLife(40);
    
    if (resetSeason) {
        resetSeason.onclick = () => {
            if(confirm("Reset wins and losses?")){
                state.players.top.wins = 0;
                state.players.top.losses = 0;
                state.players.bottom.wins = 0;
                state.players.bottom.losses = 0;
                saveState();
                updateSeason();
                alert("Season reset");
            }
        };
    }
    
    if (clearHistory) {
        clearHistory.onclick = () => {
            if(confirm("Delete all game history?")){
                state.games = [];
                saveState();
                updateHistory();
                alert("History cleared");
            }
        };
    }
    
    if (resetAll) {
        resetAll.onclick = () => {
            if(confirm("Erase everything?")){
                localStorage.removeItem("lifeLedger");
                location.reload();
            }
        };
    }
}

// Call setup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupUI);
} else {
    setupUI();
}

function navigateTo(newPage) {
    if (newPage === currentPage || isAnimating) return;
    
    isAnimating = true;
    
    const currentPageEl = pages[currentPage];
    const newPageEl = pages[newPage];
    
    if (!currentPageEl || !newPageEl) {
        console.error(`Page not found: ${currentPage} or ${newPage}`);
        isAnimating = false;
        return;
    }
    
    // Determine direction
    const currentIndex = pageOrder.indexOf(currentPage);
    const newIndex = pageOrder.indexOf(newPage);
    const direction = newIndex > currentIndex ? 'right' : 'left';
    
    // Update nav buttons
    document.querySelectorAll("nav button").forEach(b => {
        b.classList.remove("active");
    });
    document.querySelector(`nav button[data-page="${newPage}"]`).classList.add("active");
    
    // Animate out current page
    currentPageEl.classList.add(`slide-out-${direction}`);
    
    // Animate in new page
    setTimeout(() => {
        currentPageEl.classList.remove(`slide-out-${direction}`);
        currentPageEl.style.display = "none";
        
        // Update dynamic content based on page
        if (newPage === "season") updateSeason();
        if (newPage === "history") updateHistory();
        
        newPageEl.style.display = newPage === 'game' ? "flex" : "block";
        newPageEl.classList.add(`slide-in-${direction}`);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            newPageEl.classList.remove(`slide-in-${direction}`);
            isAnimating = false;
        }, 300);
        
        currentPage = newPage;
    }, 250);
}

function updateSeason(){

    document.getElementById("season-adam-name").textContent = state.players.bottom.name;
    document.getElementById("season-sydney-name").textContent = state.players.top.name;

    document.getElementById("adam-wins").textContent = state.players.bottom.wins;
    document.getElementById("adam-losses").textContent = state.players.bottom.losses;
    document.getElementById("sydney-wins").textContent = state.players.top.wins;
    document.getElementById("sydney-losses").textContent = state.players.top.losses;

    let adamGames = state.players.bottom.wins + state.players.bottom.losses;
    let sydneyGames = state.players.top.wins + state.players.top.losses;

    document.getElementById("adam-rate").textContent = adamGames ? Math.round(state.players.bottom.wins / adamGames * 100) + "%" : "0%";
    document.getElementById("sydney-rate").textContent = sydneyGames ? Math.round(state.players.top.wins / sydneyGames * 100) + "%" : "0%";
}

function updateHistory(){

    let list = document.getElementById("history-list");

    if(state.games.length === 0){
        list.innerHTML = "<p>No games played yet.</p>";
        return;
    }

    list.innerHTML = "";

    [...state.games].reverse().forEach(game => {
        let card = document.createElement("div");
        card.className = "history-card";
        card.innerHTML = `
            <h2>🏆 ${game.winner}</h2>
            <p>Defeated ${game.loser}</p>
            <p>⏱ ${formatTime(game.duration)}</p>
            <p>${game.date}</p>
        `;
        list.appendChild(card);
    });
}

// ============= SETTINGS =============

function updateSettingsLife(amount){
    state.startingLife = amount;
    saveState();
    console.log("Starting life updated to:", amount);
}

// Register PWA Service Worker

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
    .then(() => {
        console.log("Life Ledger is ready offline");
    });
}
