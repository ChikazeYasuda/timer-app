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
// タイマー
// ========================================

let initialSeconds = 0;

let remainingSeconds = 0;

let timer = null;

let endTime = null;


// ========================================
// アラーム
// ========================================

const alarmSound =
    new Audio("alarm.mp3");

alarmSound.preload = "auto";

alarmSound.loop = true;


// iPhoneで音声再生許可を取得済みか
let audioUnlocked = false;


// ========================================
// iPhone / Safari用
// 音声再生許可
// ========================================

async function unlockAudio() {

    if (audioUnlocked) {
        return;
    }


    // 完全にミュート
    alarmSound.muted = true;

    alarmSound.currentTime = 0;


    try {

        // ユーザーが赤ボタンを押した瞬間に
        // 一度だけ再生する
        await alarmSound.play();


        // すぐ停止
        alarmSound.pause();

        alarmSound.currentTime = 0;

        alarmSound.muted = false;


        audioUnlocked = true;


        console.log(
            "Audio unlocked"
        );

    }

    catch (error) {

        alarmSound.muted = false;


        console.error(
            "音声の準備に失敗しました。",
            error
        );

    }

}


// ========================================
// 秒数設定
// ========================================

setButton.addEventListener(
    "click",
    function () {

        const seconds =
            Number(
                secondsInput.value
            );


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
// 赤い大型ボタン
// ========================================

startButton.addEventListener(
    "click",

    async function () {

        // 既存タイマー停止
        stopTimer();


        // 既存アラーム停止
        stopAlarm();


        // iPhoneで音声再生許可を取得
        await unlockAudio();


        // 最初の秒数に戻す
        remainingSeconds =
            initialSeconds;


        updateDisplay();


        // 終了予定時刻
        endTime =
            Date.now() +
            initialSeconds * 1000;


        // ====================================
        // カウントダウン開始
        // ====================================

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


                    // =================================
                    // 0秒
                    // =================================

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
// Pause
// 表示はPauseだが実際にはReset
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
// アラーム再生
// ========================================

function playAlarm() {

    // 必ず一度停止
    alarmSound.pause();


    // 音源の先頭へ
    alarmSound.currentTime = 0;


    // ミュート解除
    alarmSound.muted = false;


    // 最初から警告音を鳴らす
    const playPromise =
        alarmSound.play();


    if (
        playPromise !== undefined
    ) {

        playPromise.catch(
            function (error) {

                console.error(
                    "アラームを再生できませんでした。",
                    error
                );

            }
        );

    }

}


// ========================================
// アラーム停止
// ========================================

function stopAlarm() {

    alarmSound.pause();


    alarmSound.currentTime = 0;


    alarmSound.muted = false;

}