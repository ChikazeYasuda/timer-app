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

// setInterval
let timer = null;

// 終了予定時刻
let endTime = null;


// ========================================
// アラーム音
// ========================================

// GitHub上にある alarm.mp3 を使用
const alarmSound =
    new Audio("alarm.mp3");


// 音声を事前読み込み
alarmSound.preload = "auto";


// 繰り返し再生
alarmSound.loop = true;


// ========================================
// Web Audio API
// iPhoneの音量制御対策
// ========================================

let audioContext = null;

let sourceNode = null;

let gainNode = null;


// ========================================
// 音声システムを準備
// ========================================

function prepareAudio() {

    // 初回だけ作成
    if (audioContext === null) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        // alarmSoundをWeb Audio APIへ接続
        sourceNode =
            audioContext.createMediaElementSource(
                alarmSound
            );


        // 音量を制御するGainNode
        gainNode =
            audioContext.createGain();


        // alarm.mp3
        // ↓
        // GainNode
        // ↓
        // スピーカー
        sourceNode.connect(
            gainNode
        );


        gainNode.connect(
            audioContext.destination
        );


        // 最初は完全に無音
        gainNode.gain.setValueAtTime(
            0,
            audioContext.currentTime
        );

    }


    // iPhoneなどでAudioContextが停止していたら再開
    if (
        audioContext.state === "suspended"
    ) {

        audioContext.resume().catch(
            function (error) {

                console.error(
                    "AudioContextの再開に失敗しました。",
                    error
                );

            }
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
// 押すと
//
// 1. 今のタイマー停止
// 2. アラーム停止
// 3. 音声システム準備
// 4. alarm.mp3を無音で再生開始
// 5. 最初の秒数へ戻る
// 6. カウントダウン開始
//
// ========================================

startButton.addEventListener(
    "click",
    function () {

        // ====================================
        // タイマー停止
        // ====================================

        stopTimer();


        // ====================================
        // 前回のアラーム停止
        // ====================================

        stopAlarm();


        // ====================================
        // iPhone対策
        //
        // 必ずユーザーが赤ボタンを
        // 押した瞬間にAudioContextを作る
        // ====================================

        prepareAudio();


        // ====================================
        // 音を完全に無音にする
        // ====================================

        gainNode.gain.setValueAtTime(
            0,
            audioContext.currentTime
        );


        // ====================================
        // MP3を最初に戻す
        // ====================================

        alarmSound.currentTime = 0;


        // ====================================
        // 赤ボタンを押した瞬間に
        // 音声再生自体は開始する
        //
        // GainNode = 0なので音は聞こえない
        // ====================================

        const playPromise =
            alarmSound.play();


        if (
            playPromise !== undefined
        ) {

            playPromise.catch(
                function (error) {

                    console.error(
                        "アラーム音の準備に失敗しました。",
                        error
                    );

                }
            );

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
        // カウントダウン開始
        // ====================================

        timer =
            setInterval(
                function () {

                    // 現在時刻との差
                    const millisecondsLeft =
                        endTime -
                        Date.now();


                    // 残り秒数を計算
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
// 表示はPauseだが，実際にはReset
//
// ・タイマー停止
// ・警告音停止
// ・最初の秒数に戻す
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

    // ====================================
    // MP3はすでに無音で再生中
    //
    // ここでは新しくplay()しない
    // ====================================

    if (
        gainNode === null ||
        audioContext === null
    ) {

        console.error(
            "音声システムが準備されていません。"
        );

        return;

    }


    // アラームを最初から鳴らす
    alarmSound.currentTime = 0;


    // ====================================
    // 音量を一気に上げる
    // ====================================

    gainNode.gain.setValueAtTime(
        1,
        audioContext.currentTime
    );

}


// ========================================
// アラーム停止
// ========================================

function stopAlarm() {

    // ====================================
    // GainNodeが存在する場合
    // まず完全に無音にする
    // ====================================

    if (
        gainNode !== null &&
        audioContext !== null
    ) {

        gainNode.gain.setValueAtTime(
            0,
            audioContext.currentTime
        );

    }


    // MP3停止
    alarmSound.pause();


    // 最初へ戻す
    alarmSound.currentTime = 0;

}