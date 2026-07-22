const DEFAULT_STATE = {
    players: {
        top: {
            name: "Sydney",
            life: 20
        },
        bottom: {
            name: "Adam",
            life: 20
        }
    },

    timer: {
        running: false,
        elapsed: 0,
        startTime: null
    },

    history: []
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


// Render

render();

setInterval(updateTimer,1000);


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


    if(state.players.top.life <= 0){

        winner = state.players.bottom.name;

    }


    if(state.players.bottom.life <= 0){

        winner = state.players.top.name;

    }


    if(winner){

        state.timer.elapsed =
        Math.floor(
            (Date.now()-state.timer.startTime)/1000
        );


        state.timer.running=false;


        winnerText.textContent =
        "🏆 " + winner + " Wins!";


        finalTime.textContent =
        "Time: " + formatTime(state.timer.elapsed);


        gameOver.classList.remove("hidden");

    }

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

    const name =
    prompt(
        "Player Name",
        state.players[player].name
    );


    if(name){

        state.players[player].name=name;

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
    seconds%60;


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

        return JSON.parse(saved);

    }


    return structuredClone(DEFAULT_STATE);

}