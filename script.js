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

const alarmSound =
    document.getElementById("alarmSound");


// ========================================
// タイマー用変数
// ========================================

let initialSeconds = 0;

let remainingSeconds = 0;

let timer = null;

let endTime = null;


// ========================================
// 秒数設定
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
// 表示更新
// ========================================

function updateDisplay() {

    countdown.textContent =
        remainingSeconds;

}


// ========================================
// 赤いボタン
//
// 最初からカウントダウン開始
// ========================================

startButton.addEventListener(
    "click",
    function () {

        // --------------------------------
        // 既存タイマー停止
        // --------------------------------

        stopTimer();


        // --------------------------------
        // 既存アラーム停止
        // --------------------------------

        stopAlarm();


        // --------------------------------
        // iPhone対策
        //
        // ユーザーが赤ボタンを押した瞬間に
        // MP3をほぼ無音で再生開始しておく
        //
        // 0秒になったときには
        // play()せず，音量を上げるだけ
        // --------------------------------

        alarmSound.volume = 0.001;

        alarmSound.currentTime = 0;


        const playPromise =
            alarmSound.play();


        if (
            playPromise !== undefined
        ) {

            playPromise.catch(
                function (error) {

                    console.error(
                        "音声の準備に失敗しました",
                        error
                    );

                }
            );

        }


        // --------------------------------
        // タイマーを最初に戻す
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


                    // ============================
                    // 0秒
                    // ============================

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

    /*
        MP3自体は赤ボタンを押した時点から
        ほぼ無音で再生されている．

        ここでは音量を上げるだけ．
    */

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