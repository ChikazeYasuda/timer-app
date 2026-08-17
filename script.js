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
// タイマー関連
// ========================================

// 最初に設定した秒数
let initialSeconds = 0;

// 現在の残り秒数
let remainingSeconds = 0;

// 表示更新用タイマー
let timer = null;

// 終了予定時刻
let endTime = null;


// ========================================
// アラーム関連
// ========================================

let audioContext = null;

// alarm.mp3の音声データ
let alarmBuffer = null;

// 再生中または再生予約中のアラーム
let alarmSource = null;


// ========================================
// alarm.mp3を読み込む
// ========================================

const alarmDataPromise =
    fetch("alarm.mp3")
        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "alarm.mp3を読み込めませんでした。"
                );

            }

            return response.arrayBuffer();

        });


// ========================================
// アラームを使える状態にする
// ========================================

async function prepareAlarm() {

    // AudioContextを初回だけ作成
    if (audioContext === null) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    // iPhone / Safari対策
    // 赤ボタンを押したタイミングで有効化する
    if (
        audioContext.state === "suspended"
    ) {

        await audioContext.resume();

    }


    // alarm.mp3をまだ変換していなければ変換
    if (alarmBuffer === null) {

        const arrayBuffer =
            await alarmDataPromise;


        alarmBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer.slice(0)
            );

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


        // ====================================
        // 設定秒数
        // ====================================

        initialSeconds =
            Math.floor(seconds);


        remainingSeconds =
            initialSeconds;


        updateDisplay();


        // ====================================
        // 設定画面を消す
        // ====================================

        setupScreen.classList.add(
            "hidden"
        );


        // ====================================
        // タイマー画面を表示
        // ====================================

        timerScreen.classList.remove(
            "hidden"
        );

    }
);


// ========================================
// カウントダウン表示
//
// 小数点第2位まで表示
// ========================================

function updateDisplay() {

    countdown.textContent =
        remainingSeconds.toFixed(2);

}


// ========================================
// 赤い大型ボタン
//
// 押したら最初の秒数から
// カウントダウン開始
// ========================================

startButton.addEventListener(
    "click",

    async function () {

        // ====================================
        // 現在のタイマーを停止
        // ====================================

        stopTimer();


        // ====================================
        // 現在または予約中のアラームを停止
        // ====================================

        stopAlarm();


        // ====================================
        // アラーム準備
        // ====================================

        try {

            await prepareAlarm();

        }

        catch (error) {

            console.error(
                "アラームの準備に失敗しました。",
                error
            );


            alert(
                "アラーム音を読み込めませんでした。"
            );

            return;

        }


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
        // アラームを予約
        //
        // initialSeconds秒後に鳴る
        // ====================================

        scheduleAlarm(
            initialSeconds
        );


        // ====================================
        // カウントダウン開始
        // ====================================

        timer =
            setInterval(
                function () {

                    // =================================
                    // 残り時間を計算
                    // =================================

                    const millisecondsLeft =
                        endTime -
                        Date.now();


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

                        remainingSeconds = 0;


                        updateDisplay();


                        // 表示更新だけ停止
                        // アラームはすでに予約されている
                        stopTimer();

                    }

                },

                // 約0.01秒ごとに更新
                10
            );

    }
);


// ========================================
// アラームを予約
// ========================================

function scheduleAlarm(
    secondsUntilAlarm
) {

    // ====================================
    // 以前のアラームを停止
    // ====================================

    stopAlarm();


    // ====================================
    // 新しい音源を作る
    // ====================================

    alarmSource =
        audioContext.createBufferSource();


    alarmSource.buffer =
        alarmBuffer;


    // ====================================
    // Pauseを押すまで繰り返す
    // ====================================

    alarmSource.loop = true;


    // ====================================
    // スピーカーへ接続
    // ====================================

    alarmSource.connect(
        audioContext.destination
    );


    // ====================================
    // 鳴り始める時刻
    // ====================================

    const alarmStartTime =
        audioContext.currentTime +
        secondsUntilAlarm;


    // ====================================
    // 指定秒数後に再生開始
    // ====================================

    alarmSource.start(
        alarmStartTime
    );

}


// ========================================
// Pauseボタン
//
// 表示はPauseだが，機能はReset
//
// ・タイマー停止
// ・アラーム停止
// ・最初の秒数へ戻す
// ========================================

resetButton.addEventListener(
    "click",
    function () {

        // タイマー停止
        stopTimer();


        // アラーム停止
        // まだ鳴っていない予約もキャンセル
        stopAlarm();


        // 最初の秒数へ戻す
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

        clearInterval(
            timer
        );


        timer = null;

    }

}


// ========================================
// アラーム停止
// ========================================

function stopAlarm() {

    if (
        alarmSource !== null
    ) {

        try {

            // 再生中でも予約中でも停止できる
            alarmSource.stop();

        }

        catch (error) {

            // すでに停止済みなら何もしない

        }


        try {

            alarmSource.disconnect();

        }

        catch (error) {

            // 何もしない

        }


        alarmSource = null;

    }

}