// ── Audio Only Constraints ──────────────────────────
export const audioConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate:       44100,
  },
  video: false,
};

// ── Audio + Video Constraints ───────────────────────
export const videoConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate:       44100,
  },
  video: {
    width:     { min: 640,  ideal: 1280, max: 1920 },
    height:    { min: 480,  ideal: 720,  max: 1080 },
    frameRate: { min: 15,   ideal: 30,   max: 60   },
    facingMode: "user",
  },
};

// ── Screen Share Constraints ────────────────────────
export const screenShareConstraints = {
  video: {
    cursor:    "always",
    frameRate: { ideal: 30, max: 60 },
  },
  audio: false,
};

// ── Get User Media ───────────────────────────────────
export const getUserMedia = async (callType = "video") => {
  try {
    const constraints =
      callType === "audio" ? audioConstraints : videoConstraints;
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error("Error getting user media:", error);
    throw error;
  }
};

// ── Get Screen Share Stream ──────────────────────────
export const getScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(
      screenShareConstraints
    );
    return stream;
  } catch (error) {
    console.error("Error getting screen share:", error);
    throw error;
  }
};

// ── Stop All Tracks ──────────────────────────────────
export const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

// ── Toggle Audio Track ───────────────────────────────
export const toggleAudio = (stream, mute) => {
  if (stream) {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !mute;
    });
  }
};

// ── Toggle Video Track ───────────────────────────────
export const toggleVideo = (stream, mute) => {
  if (stream) {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !mute;
    });
  }
};

// ── Replace Video Track (for screen share) ───────────
export const replaceVideoTrack = async (peerConnection, newStream) => {
  const videoTrack = newStream.getVideoTracks()[0];
  const sender = peerConnection
    .getSenders()
    .find((s) => s.track?.kind === "video");
  if (sender && videoTrack) {
    await sender.replaceTrack(videoTrack);
  }
};