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

    games: []
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


topName.onclick = () => editName("top");
bottomName.onclick = () => editName("bottom");


document.getElementById("undo-button")
.onclick = undoGame;


document.getElementById("next-game-button")
.onclick = nextGame;


render();

setInterval(updateTimer,1000);



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

    state.players.top.life = 20;
    state.players.bottom.life = 20;


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



function editName(player){

    let name =
    prompt(
        "Player Name",
        state.players[player].name
    );


    if(name){

        state.players[player].name = name;

        saveState();

        render();

    }

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


        return loaded;

    }


    return structuredClone(DEFAULT_STATE);

}
// Navigation

const pages = {

game: document.getElementById("game-screen"),

season: document.getElementById("season-screen")

};


document.querySelectorAll("nav button")
.forEach(button => {


button.onclick = () => {


let page = button.dataset.page;


if(page === "game"){

pages.game.style.display="flex";
pages.season.style.display="none";

}


if(page === "season"){

pages.game.style.display="none";
pages.season.style.display="block";

updateSeason();

}


};


});



function updateSeason(){


document.getElementById("season-adam-name")
.textContent =
state.players.bottom.name;


document.getElementById("season-sydney-name")
.textContent =
state.players.top.name;



document.getElementById("adam-wins")
.textContent =
state.players.bottom.wins;


document.getElementById("adam-losses")
.textContent =
state.players.bottom.losses;


document.getElementById("sydney-wins")
.textContent =
state.players.top.wins;


document.getElementById("sydney-losses")
.textContent =
state.players.top.losses;



let adamGames =
state.players.bottom.wins +
state.players.bottom.losses;


let sydneyGames =
state.players.top.wins +
state.players.top.losses;



document.getElementById("adam-rate")
.textContent =
adamGames
?
Math.round(
state.players.bottom.wins / adamGames * 100
)
+"%"
:
"0%";


document.getElementById("sydney-rate")
.textContent =
sydneyGames
?
Math.round(
state.players.top.wins / sydneyGames * 100
)
+"%"
:
"0%";


}
// History Navigation

const historyScreen =
document.getElementById("history-screen");


document.querySelectorAll("nav button")
.forEach(button => {


button.onclick = () => {

let page = button.dataset.page;


pages.game.style.display = "none";
pages.season.style.display = "none";
historyScreen.style.display = "none";


if(page === "game"){

pages.game.style.display="flex";

}


if(page === "season"){

pages.season.style.display="block";

updateSeason();

}


if(page === "history"){

historyScreen.style.display="block";

updateHistory();

}


};


});



function updateHistory(){


let list =
document.getElementById("history-list");


if(state.games.length === 0){

list.innerHTML =
"<p>No games played yet.</p>";

return;

}



list.innerHTML = "";


[...state.games]
.reverse()
.forEach(game => {


let card =
document.createElement("div");


card.className =
"history-card";


card.innerHTML = `

<h2>
🏆 ${game.winner}
</h2>

<p>
Defeated ${game.loser}
</p>

<p>
⏱ ${formatTime(game.duration)}
</p>

<p>
${game.date}
</p>

`;


list.appendChild(card);


});


}
// SETTINGS


const settingsScreen =
document.getElementById("settings-screen");



function updateSettingsLife(amount){

localStorage.setItem(
"startingLife",
amount
);

}



document.getElementById("edit-adam-name")
.onclick = () => editName("bottom");


document.getElementById("edit-sydney-name")
.onclick = () => editName("top");



document.getElementById("life-20")
.onclick = () => updateSettingsLife(20);


document.getElementById("life-30")
.onclick = () => updateSettingsLife(30);


document.getElementById("life-40")
.onclick = () => updateSettingsLife(40);



document.getElementById("reset-season")
.onclick = () => {


if(confirm("Reset wins and losses?")){


state.players.top.wins = 0;
state.players.top.losses = 0;

state.players.bottom.wins = 0;
state.players.bottom.losses = 0;


saveState();


alert("Season reset");

}

};



document.getElementById("clear-history")
.onclick = () => {


if(confirm("Delete all game history?")){


state.games = [];

saveState();


alert("History cleared");

}

};



document.getElementById("reset-all")
.onclick = () => {


if(confirm("Erase everything?")){


localStorage.removeItem("lifeLedger");


location.reload();

}

};