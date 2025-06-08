const userVideo = document.getElementById('user-video');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');

const state = {
  media: null,
  recorder: null
};

const socket = io();

startButton.addEventListener("click", () => {
  if (state.media && !state.recorder) {
    const mediaRecorder = new MediaRecorder(state.media, {
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = ev => {
      console.log("Binary data available", ev.data);
      socket.emit("binary-Stream", ev.data);
    };

    mediaRecorder.start(25); // timeslice: 25ms
    state.recorder = mediaRecorder;
    console.log("Streaming started...");
  }
});

stopButton.addEventListener("click", () => {
  if (state.recorder && state.recorder.state !== "inactive") {
    state.recorder.stop();
    state.recorder = null;
    console.log("Streaming stopped.");
  }
});

window.addEventListener('load', async () => {
  try {
    const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    state.media = media;
    userVideo.srcObject = media;
  } catch (err) {
    console.error("Error accessing media devices.", err);
  }
});
