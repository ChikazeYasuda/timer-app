let remainingTime = 0;
let timer = null;

const timeDisplay = document.getElementById("time");

const minutesInput = document.getElementById("minutes");
const secondsInput = document.getElementById("seconds");

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");


function updateDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    timeDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


startButton.addEventListener("click", function () {

    if (timer !== null) {
        return;
    }

    if (remainingTime === 0) {
        const minutes = Number(minutesInput.value) || 0;
        const seconds = Number(secondsInput.value) || 0;

        remainingTime = minutes * 60 + seconds;

        updateDisplay();
    }

    if (remainingTime <= 0) {
        return;
    }

    timer = setInterval(function () {

        if (remainingTime > 0) {
            remainingTime--;
            updateDisplay();
        }

        if (remainingTime === 0) {
            clearInterval(timer);
            timer = null;

            alert("時間です！");
        }

    }, 1000);

});


pauseButton.addEventListener("click", function () {

    clearInterval(timer);
    timer = null;

});


resetButton.addEventListener("click", function () {

    clearInterval(timer);
    timer = null;

    remainingTime = 0;

    updateDisplay();

    minutesInput.value = "";
    secondsInput.value = "";

});