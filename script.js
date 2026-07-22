// =========================
// Life Ledger v0.1
// =========================

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
    }
};

let state = loadState();

// ---------- Elements ----------

const topLife = document.getElementById("sydney-life");
const bottomLife = document.getElementById("adam-life");

const topName = document.getElementById("sydney-name");
const bottomName = document.getElementById("adam-name");

const timer = document.getElementById("timer");

// ---------- Initial Render ----------

render();

setInterval(updateTimer, 1000);

// ---------- Buttons ----------

document.getElementById("sydney-plus").onclick = () => changeLife("top", 1);
document.getElementById("sydney-minus").onclick = () => changeLife("top", -1);

document.getElementById("adam-plus").onclick = () => changeLife("bottom", 1);
document.getElementById("adam-minus").onclick = () => changeLife("bottom", -1);

// ---------- Editable Names ----------

topName.onclick = () => editName("top");
bottomName.onclick = () => editName("bottom");

// =========================

function changeLife(player, amount) {

    if (!state.timer.running) {

        state.timer.running = true;
        state.timer.startTime = Date.now();

    }

    state.players[player].life += amount;

    saveState();

    render();

}

function editName(player) {

    const current = state.players[player].name;

    const name = prompt("Player Name", current);

    if (!name) return;

    state.players[player].name = name.trim();

    saveState();

    render();

}

function render() {

    topLife.textContent = state.players.top.life;
    bottomLife.textContent = state.players.bottom.life;

    topName.textContent = state.players.top.name;
    bottomName.textContent = state.players.bottom.name;

    updateTimer();

}

function updateTimer() {

    if (state.timer.running) {

        state.timer.elapsed =
            Math.floor((Date.now() - state.timer.startTime) / 1000);

    }

    const minutes = Math.floor(state.timer.elapsed / 60);
    const seconds = state.timer.elapsed % 60;

    timer.textContent =
        "⏱ " +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}

function saveState() {

    localStorage.setItem(
        "lifeLedger",
        JSON.stringify(state)
    );

}

function loadState() {

    const saved = localStorage.getItem("lifeLedger");

    if (saved) {

        return JSON.parse(saved);

    }

    return structuredClone(DEFAULT_STATE);

}
