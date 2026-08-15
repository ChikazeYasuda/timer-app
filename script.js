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

let alarmBuffer = null;

let alarmSource = null;


// ========================================
// alarm.mp3を先に取得しておく
// ========================================

const alarmDataPromise =
    fetch("alarm.mp3")
        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "alarm.mp3 を読み込めませんでした。"
                );

            }

            return response.arrayBuffer();

        });


// ========================================
// アラーム音を使用可能な状態にする
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
    // 赤ボタンを押したユーザー操作内で再開
    if (
        audioContext.state === "suspended"
    ) {

        await audioContext.resume();

    }


    // MP3をまだ変換していない場合
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
// 秒数設定
// ========================================

setButton.addEventListener(
    "click",
    function () {

        const seconds =
            Number(
                secondsInput.value
            );


        // 入力チェック
        if (
            !Number.isFinite(seconds) ||
            seconds < 1
        ) {

            alert(
                "1秒以上の値を入力してください。"
            );

            return;

        }


        // 最初に設定した秒数
        initialSeconds =
            Math.floor(seconds);


        // 残り時間
        remainingSeconds =
            initialSeconds;


        updateDisplay();


        // 設定画面を消す
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
        // 今動いているものを全部止める
        // ====================================

        stopTimer();

        stopAlarm();


        // ====================================
        // アラームを準備
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
        // 終了予定時刻を設定
        // ====================================

        endTime =
            Date.now() +
            initialSeconds * 1000;


        // ====================================
        // アラームを
        // 「initialSeconds秒後」に予約
        //
        // ここではまだ音は鳴らない
        // ====================================

        scheduleAlarm(
            initialSeconds
        );


        // ====================================
        // カウントダウン表示開始
        // ====================================

        timer =
            setInterval(
                function () {

                    const millisecondsLeft =
                        endTime -
                        Date.now();


                    // 秒へ変換
                    remainingSeconds =
                        Math.max(
                            0,
                            millisecondsLeft / 1000
                        );


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
                        // アラームはすでに予約されているので
                        // ここではplay()しない
                        stopTimer();

                    }

                },

                // 0.01秒程度で表示更新
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

    // 念のため前のアラームを停止
    stopAlarm();


    // 新しい音源を作成
    alarmSource =
        audioContext.createBufferSource();


    // alarm.mp3をセット
    alarmSource.buffer =
        alarmBuffer;


    // Pauseを押すまで繰り返す
    alarmSource.loop =
        true;


    // スピーカーへ接続
    alarmSource.connect(
        audioContext.destination
    );


    // ====================================
    // 指定秒数後に再生開始
    //
    // 例えば10秒なら
    //
    // 赤ボタン
    // ↓
    // 10秒待つ
    // ↓
    // alarm.mp3の先頭から鳴る
    // ====================================

    const alarmStartTime =
        audioContext.currentTime +
        secondsUntilAlarm;


    alarmSource.start(
        alarmStartTime
    );

}


// ========================================
// Pauseボタン
//
// 表示はPauseだが機能はReset
// ========================================

resetButton.addEventListener(
    "click",
    function () {

        // カウント停止
        stopTimer();


        // 予約済み・再生中の
        // アラームも停止
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

            alarmSource.stop();

        }

        catch (error) {

            // すでに停止している場合は無視

        }


        try {

            alarmSource.disconnect();

        }

        catch (error) {

            // 無視

        }


        alarmSource = null;

    }

}