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

let initialSeconds = 0;

let remainingSeconds = 0;

let timer = null;

let endTime = null;


// ========================================
// 音声関連
// ========================================

let audioContext = null;

let alarmBuffer = null;

let alarmSource = null;


// ========================================
// MP3を読み込む
// ========================================

async function loadAlarmSound() {

    try {

        const response =
            await fetch(
                "low_emergency_alarm(1).mp3"
            );


        const arrayBuffer =
            await response.arrayBuffer();


        // AudioContextがまだ無ければ作成
        if (audioContext === null) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }


        // MP3をWeb Audio用に変換
        alarmBuffer =
            await audioContext.decodeAudioData(
                arrayBuffer
            );


        console.log(
            "アラーム音を読み込みました"
        );

    }

    catch (error) {

        console.error(
            "アラーム音の読み込みに失敗しました",
            error
        );

    }

}


// ページを開いた時点で読み込み開始
loadAlarmSound();


// ========================================
// AudioContextを有効化
//
// iPhone対策として重要
// ========================================

async function prepareAudio() {

    if (audioContext === null) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioContext.state === "suspended"
    ) {

        await audioContext.resume();

    }


    console.log(
        "AudioContext:",
        audioContext.state
    );

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
// 表示更新
// ========================================

function updateDisplay() {

    countdown.textContent =
        remainingSeconds;

}


// ========================================
// 赤ボタン
//
// 最初からカウントダウン開始
// ========================================

startButton.addEventListener(
    "click",
    async function () {

        // ====================================
        // iPhoneで最重要
        //
        // ユーザーが赤ボタンを押した瞬間に
        // AudioContextを有効化する
        // ====================================

        await prepareAudio();


        stopTimer();

        stopAlarm();


        remainingSeconds =
            initialSeconds;


        updateDisplay();


        endTime =
            Date.now() +
            initialSeconds * 1000;


        // ====================================
        // タイマー開始
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
// アラーム再生
// ========================================

async function playAlarm() {

    // AudioContextが止まっていたら再開
    if (
        audioContext.state === "suspended"
    ) {

        try {

            await audioContext.resume();

        }

        catch (error) {

            console.error(
                error
            );

        }

    }


    // 音源がまだ読み込まれていない場合
    if (
        alarmBuffer === null
    ) {

        console.log(
            "アラーム音を読み込み中です"
        );

        return;

    }


    // 以前の音を停止
    stopAlarm();


    // 新しい音源を作る
    alarmSource =
        audioContext.createBufferSource();


    alarmSource.buffer =
        alarmBuffer;


    // Resetを押すまで繰り返す
    alarmSource.loop = true;


    alarmSource.connect(
        audioContext.destination
    );


    alarmSource.start(0);

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


        alarmSource.disconnect();

        alarmSource = null;

    }

}