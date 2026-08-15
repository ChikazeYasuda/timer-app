// ========================================
// HTML要素
// ========================================

const setupScreen =
    document.getElementById("setupScreen");

const timerScreen =
    document.getElementById("timerScreen");

const secondsInput =
    document.getElementById("secondsInput");

const setButton =
    document.getElementById("setButton");

const countdown =
    document.getElementById("countdown");

const resetButton =
    document.getElementById("resetButton");

const startButton =
    document.getElementById("startButton");


// ========================================
// タイマー用変数
// ========================================

let initialSeconds = 0;

let remainingSeconds = 0;

let timer = null;

let endTime = null;


// ========================================
// アラーム音
// ========================================

const alarmSound = new Audio("alarm.mp3");

alarmSound.loop = true;
alarmSound.preload = "auto";


// ========================================
// 秒数を設定
// ========================================

setButton.addEventListener(
    "click",
    function () {

        const seconds =
            Number(secondsInput.value);


        if (
            !Number.isFinite(seconds) ||
            seconds < 1
        ) {

            alert(
                "1秒以上の値を入力してください。"
            );

            return;
        }


        initialSeconds =
            Math.floor(seconds);


        remainingSeconds =
            initialSeconds;


        updateDisplay();


        setupScreen.classList.add(
            "hidden"
        );


        timerScreen.classList.remove(
            "hidden"
        );

    }
);


// ========================================
// カウントダウン表示更新
// ========================================

function updateDisplay() {

    countdown.textContent =
        remainingSeconds;

}


// ========================================
// 赤いボタン
// ========================================

startButton.addEventListener(
    "click",
    function () {

        // --------------------------------
        // 今動いているタイマーを停止
        // --------------------------------

        stopTimer();


        // --------------------------------
        // 前の音声を停止
        // --------------------------------

        alarmSound.pause();

        alarmSound.currentTime = 0;


        // --------------------------------
        // 重要
        //
        // ボタンを押した瞬間に
        // 音声再生を開始する
        //
        // ただしほぼ聞こえない音量
        // --------------------------------

        alarmSound.volume = 0.000001;


        const playPromise =
            alarmSound.play();


        if (
            playPromise !== undefined
        ) {

            playPromise.catch(
                function (error) {

                    console.error(
                        "音声再生の準備に失敗しました。",
                        error
                    );

                }
            );

        }


        // --------------------------------
        // 最初の秒数へ戻す
        // --------------------------------

        remainingSeconds =
            initialSeconds;


        updateDisplay();


        // --------------------------------
        // 終了予定時刻
        // --------------------------------

        endTime =
            Date.now() +
            initialSeconds * 1000;


        // --------------------------------
        // カウントダウン開始
        // --------------------------------

        timer =
            setInterval(
                function () {

                    const millisecondsLeft =
                        endTime -
                        Date.now();


                    remainingSeconds =
                        Math.max(
                            0,

                            Math.ceil(
                                millisecondsLeft /
                                1000
                            )
                        );


                    updateDisplay();


                    // ========================
                    // 0秒
                    // ========================

                    if (
                        remainingSeconds === 0
                    ) {

                        stopTimer();

                        playAlarm();

                    }

                },

                100
            );

    }
);


// ========================================
// Pauseボタン
//
// 実際にはReset
// ========================================

resetButton.addEventListener(
    "click",
    function () {

        stopTimer();

        stopAlarm();


        remainingSeconds =
            initialSeconds;


        updateDisplay();

    }
);


// ========================================
// タイマー停止
// ========================================

function stopTimer() {

    if (
        timer !== null
    ) {

        clearInterval(timer);

        timer = null;

    }

}


// ========================================
// 0秒になったとき
// ========================================

function playAlarm() {

    // すでに再生中なので，
    // 新しくplay()はしない

    alarmSound.currentTime = 0;

    alarmSound.volume = 1.0;

}


// ========================================
// アラーム停止
// ========================================

function stopAlarm() {

    alarmSound.pause();

    alarmSound.currentTime = 0;

    alarmSound.volume = 1.0;

}