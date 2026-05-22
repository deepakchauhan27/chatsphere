import iceServers from "./iceServers";

let peerConnection = null;

// ── Create Peer Connection ──────────────────────────
export const createPeerConnection = (onIceCandidate, onTrack) => {
  peerConnection = new RTCPeerConnection(iceServers);

  // ── ICE Candidate Handler ─────────────────────────
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  // ── Remote Track Handler ──────────────────────────
  peerConnection.ontrack = (event) => {
    onTrack(event.streams[0]);
  };

  // ── Connection State Change ───────────────────────
  peerConnection.onconnectionstatechange = () => {
    console.log("Peer connection state:", peerConnection.connectionState);
  };

  // ── ICE Connection State ──────────────────────────
  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peerConnection.iceConnectionState);
  };

  return peerConnection;
};

// ── Get Peer Connection ─────────────────────────────
export const getPeerConnection = () => peerConnection;

// ── Add Local Stream to Peer ────────────────────────
export const addLocalStream = (stream) => {
  if (peerConnection && stream) {
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  }
};

// ── Create Offer ────────────────────────────────────
export const createOffer = async () => {
  if (!peerConnection) return null;
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
  await peerConnection.setLocalDescription(offer);
  return offer;
};

// ── Create Answer ───────────────────────────────────
export const createAnswer = async (offer) => {
  if (!peerConnection) return null;
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  return answer;
};

// ── Set Remote Answer ───────────────────────────────
export const setRemoteAnswer = async (answer) => {
  if (!peerConnection) return;
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
};

// ── Add ICE Candidate ───────────────────────────────
export const addIceCandidate = async (candidate) => {
  if (!peerConnection) return;
  try {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
};

// ── Close Peer Connection ───────────────────────────
export const closePeerConnection = () => {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
};