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

// 最初に設定した秒数
let initialSeconds = 0;


// 現在の残り秒数
let remainingSeconds = 0;


// setIntervalを保存
let timer = null;


// タイマー終了予定時刻
let endTime = null;


// ========================================
// アラーム音
// ========================================

const alarmSound =
    new Audio(
        "low_emergency_alarm(1).mp3"
    );


// アラームを繰り返す
alarmSound.loop = true;


// ========================================
// iPhone / Safari用
// 音声再生をあらかじめ許可させる
// ========================================

let audioUnlocked = false;


function unlockAudio() {

    if (audioUnlocked) {
        return;
    }


    const oldVolume =
        alarmSound.volume;


    // 無音状態にする
    alarmSound.volume = 0;


    const playPromise =
        alarmSound.play();


    if (
        playPromise !== undefined
    ) {

        playPromise
            .then(function () {

                alarmSound.pause();

                alarmSound.currentTime = 0;

                alarmSound.volume =
                    oldVolume;

                audioUnlocked = true;

            })

            .catch(function () {

                alarmSound.volume =
                    oldVolume;

            });

    }

}


// ========================================
// 秒数を設定
// ========================================

setButton.addEventListener(
    "click",
    function () {

        const seconds =
            Number(
                secondsInput.value
            );


        // ====================================
        // 入力チェック
        // ====================================

        if (
            !Number.isFinite(seconds) ||
            seconds < 1
        ) {

            alert(
                "1秒以上の値を入力してください。"
            );

            return;
        }


        // 小数点以下を切り捨て
        initialSeconds =
            Math.floor(seconds);


        remainingSeconds =
            initialSeconds;


        updateDisplay();


        // 設定画面を非表示
        setupScreen.classList.add(
            "hidden"
        );


        // タイマー画面を表示
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
//
// 押したら
//
// 1. 今のタイマーを停止
// 2. アラーム停止
// 3. 最初の秒数へ戻る
// 4. カウントダウン開始
// ========================================

startButton.addEventListener(
    "click",
    function () {

        // iPhoneなどで音声を有効化
        unlockAudio();


        // 既存タイマー停止
        stopTimer();


        // アラーム停止
        stopAlarm();


        // 最初の秒数へ戻す
        remainingSeconds =
            initialSeconds;


        updateDisplay();


        // ====================================
        // 終了予定時刻を決定
        // ====================================

        endTime =
            Date.now() +
            initialSeconds * 1000;


        // ====================================
        // タイマー開始
        // ====================================

        timer =
            setInterval(
                function () {

                    // 現在時刻との差
                    const millisecondsLeft =
                        endTime -
                        Date.now();


                    // 残り秒数
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
                    // 0秒になった
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
// Pauseボタン
//
// 表示はPauseだが
// 実際にはReset
//
// ・タイマー停止
// ・警告音停止
// ・最初の秒数へ戻す
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

    alarmSound.currentTime = 0;


    const playPromise =
        alarmSound.play();


    if (
        playPromise !== undefined
    ) {

        playPromise.catch(
            function (error) {

                console.log(
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

}