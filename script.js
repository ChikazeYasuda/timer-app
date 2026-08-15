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

// 最初に設定した秒数
let initialSeconds = 0;


// 現在の残り秒数
let remainingSeconds = 0;


// タイマー
let timer = null;


// 終了予定時刻
let endTime = null;


// ========================================
// アラーム
// ========================================

const alarmSound =
    new Audio("alarm.mp3");


// 事前読み込み
alarmSound.preload = "auto";


// 繰り返し再生
alarmSound.loop = true;


// iPhoneで音声再生許可を取得済みか
let audioUnlocked = false;


// ========================================
// iPhone / Safari用
// 音声再生許可
// ========================================

async function unlockAudio() {

    // すでに許可済みなら何もしない
    if (audioUnlocked) {
        return;
    }


    // 完全にミュート
    alarmSound.muted = true;


    // 音源の先頭
    alarmSound.currentTime = 0;


    try {

        // ====================================
        // 赤ボタンを押した瞬間に
        // 一度だけ音声を再生
        // ====================================

        await alarmSound.play();


        // すぐ停止
        alarmSound.pause();


        // 音源の先頭へ戻す
        alarmSound.currentTime = 0;


        // ミュート解除
        alarmSound.muted = false;


        // 許可取得完了
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


        // ====================================
        // 最初の秒数
        // ====================================

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
// カウントダウン表示
// 小数点第2位まで
// ========================================

function updateDisplay() {

    countdown.textContent =
        remainingSeconds.toFixed(2);

}


// ========================================
// 赤い大型ボタン
// ========================================

startButton.addEventListener(
    "click",

    async function () {

        // ====================================
        // 現在のタイマー停止
        // ====================================

        stopTimer();


        // ====================================
        // 現在のアラーム停止
        // ====================================

        stopAlarm();


        // ====================================
        // iPhone用音声再生許可
        // ====================================

        await unlockAudio();


        // ====================================
        // 最初の秒数へ戻す
        // ====================================

        remainingSeconds =
            initialSeconds;


        updateDisplay();


        // ====================================
        // 終了予定時刻
        // ====================================

        endTime =
            Date.now() +
            initialSeconds * 1000;


        // ====================================
        // カウントダウン開始
        // ====================================

        timer =
            setInterval(
                function () {

                    // =================================
                    // 現在時刻との差
                    // =================================

                    const millisecondsLeft =
                        endTime -
                        Date.now();


                    // =================================
                    // 秒に変換
                    // =================================

                    remainingSeconds =
                        Math.max(
                            0,
                            millisecondsLeft / 1000
                        );


                    // =================================
                    // 表示更新
                    // =================================

                    updateDisplay();


                    // =================================
                    // 0秒
                    // =================================

                    if (
                        remainingSeconds <= 0
                    ) {

                        // 必ず0にする
                        remainingSeconds = 0;


                        updateDisplay();


                        stopTimer();


                        playAlarm();

                    }

                },

                // 約0.01秒ごとに更新
                10
            );

    }
);


// ========================================
// Pause
//
// 表示はPauseだが，実際にはReset
//
// ・カウント停止
// ・アラーム停止
// ・最初の秒数へ戻る
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

    // 一度停止
    alarmSound.pause();


    // 必ず最初から
    alarmSound.currentTime = 0;


    // ミュート解除
    alarmSound.muted = false;


    // ====================================
    // アラーム再生
    // ====================================

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