import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socket";
import {
  setActiveCall,
  setCallConnected,
  setIncomingCall,
  endCall,
  setCallStatus,
  toggleAudioMute,
  toggleVideoMute,
  incrementDuration,
  saveCallLog,
} from "../store/callSlice";

const CallContext = createContext();

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "8f38fa7ee18fec12ce70c3b2",
      credential: "+23rHRDqhvvZ3ucY",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "8f38fa7ee18fec12ce70c3b2",
      credential: "+23rHRDqhvvZ3ucY",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "8f38fa7ee18fec12ce70c3b2",
      credential: "+23rHRDqhvvZ3ucY",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "8f38fa7ee18fec12ce70c3b2",
      credential: "+23rHRDqhvvZ3ucY",
    },
  ],
};

export const CallProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const callState = useSelector((state) => state.call);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const timerRef = useRef(null);
  const callStartRef = useRef(null);
  const callIdRef = useRef(null);
  const targetIdRef = useRef(null);
  const callerIdRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  // ── Get Media Stream ───────────────────────────────
  const getMedia = async (callType) => {
    try {
      const constraints =
        callType === "audio"
          ? {
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
              video: false,
            }
          : {
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
              video: true,
            };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log(
        "LOCAL TRACKS:",
        stream.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted,
          readyState: t.readyState,
        })),
      );
      return stream;
    } catch (err) {
      console.error("Media error:", err);
      throw err;
    }
  };

  // ── Create Peer Connection ─────────────────────────
  const createPC = useCallback(
    (targetId) => {
      // Close existing
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      targetIdRef.current = targetId;

      // ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = getSocket();
          socket?.emit("webrtc:ice", {
            candidate: event.candidate,
            targetId,
          });
        }
      };

      // Remote stream
      pc.ontrack = (event) => {
        console.log("===== REMOTE TRACK RECEIVED =====");
        console.log(event.streams);
        console.log(event.track.kind);

        const stream = event.streams[0];
        remoteStreamRef.current = stream;
        setRemoteStream(stream);

        dispatch(setCallConnected());
      };

      pc.onconnectionstatechange = () => {
        console.log("PC STATE:", pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE STATE:", pc.iceConnectionState);
      };

      return pc;
    },
    [dispatch],
  );

  // ── Add Local Tracks to PC ─────────────────────────
  const addTracks = (stream) => {
    if (!pcRef.current || !stream) return;
    console.log(
      "ADDING TRACKS:",
      stream.getTracks().map((t) => t.kind),
    );
    stream.getTracks().forEach((track) => {
      pcRef.current.addTrack(track, stream);
    });
  };

  // ── Cleanup ────────────────────────────────────────
  const cleanup = useCallback(() => {
    // Stop timer
    clearInterval(timerRef.current);

    // Stop streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    callIdRef.current = null;
    targetIdRef.current = null;
  }, []);

  // ── Timer ──────────────────────────────────────────
  useEffect(() => {
    if (callState.callStatus === "connected") {
      callStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        dispatch(incrementDuration());
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callState.callStatus, dispatch]);

  // ── Socket Event Listeners ─────────────────────────
  useEffect(() => {
    console.log("Registering CallContext listeners");
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    socket.off("webrtc:offer");
    socket.off("webrtc:answer");
    socket.off("webrtc:ice");
    socket.off("call:accepted");
    socket.off("call:rejected");
    socket.off("call:ended");
    socket.off("call:busy");
    socket.off("call:timeout");
    socket.off("call:callId");

    // // Receive callId after initiating
    socket.on("call:callId", async ({ callId }) => {
      console.log("Got callId:", callId);
      callIdRef.current = callId;
    });

    // Receive WebRTC offer (receiver side

    socket.on("webrtc:offer", async ({ offer }) => {
      console.log("Received offer");
      console.log("===== RECEIVED OFFER =====");

      if (!pcRef.current) return;

      try {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(offer),
        );

        // Add queued ICE candidates after remote description is set
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Pending ICE error:", err);
          }
        }

        pendingCandidatesRef.current = [];

        const answer = await pcRef.current.createAnswer();

        await pcRef.current.setLocalDescription(answer);

        const socket = getSocket();

        socket?.emit("webrtc:answer", {
          answer,
          callerId: callerIdRef.current,
        });
      } catch (err) {
        console.error("Offer handling error:", err);
      }
    });

    // Receive WebRTC answer (caller side)
    socket.on("webrtc:answer", async ({ answer }) => {
      console.log("===== RECEIVED ANSWER =====");

      if (!pcRef.current) return;

      try {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        // Add queued ICE candidates after remote description is available
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Pending ICE error:", err);
          }
        }

        pendingCandidatesRef.current = [];

        console.log("Remote description set successfully");
      } catch (err) {
        console.error("Answer handling error:", err);
      }
    });
    // Receive ICE candidate

    socket.on("webrtc:ice", async ({ candidate }) => {
      if (!pcRef.current) return;

      try {
        if (!pcRef.current.remoteDescription) {
          console.log("Queueing ICE candidate");

          pendingCandidatesRef.current.push(candidate);
          return;
        }

        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));

        console.log("ICE candidate added");
      } catch (err) {
        console.error("ICE error:", err);
      }
    });

    socket.on("call:accepted", async ({ callId }) => {
      console.log("CALL ACCEPTED EVENT RECEIVED");
      console.log("Call accepted:", callId);
      dispatch(setCallConnected());

      // Create and send offer
      try {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket.emit("webrtc:offer", {
          offer,
          receiverId: targetIdRef.current,
        });
        console.log("OFFER SENT TO:", targetIdRef.current);
      } catch (err) {
        console.error("Offer creation error:", err);
      }
    });

    // Call rejected
    socket.on("call:rejected", () => {
      console.log("Call rejected");
      dispatch(setCallStatus("rejected"));
      cleanup();
      setTimeout(() => dispatch(endCall()), 2000);
    });

    // Call ended
    socket.on("call:ended", () => {
      console.log("Call ended by other party");
      dispatch(setCallStatus("ended"));
      cleanup();
      setTimeout(() => dispatch(endCall()), 1500);
    });

    // Call busy
    socket.on("call:busy", () => {
      dispatch(setCallStatus("busy"));
      cleanup();
      setTimeout(() => dispatch(endCall()), 2000);
    });

    // Call timeout
    socket.on("call:timeout", () => {
      dispatch(setCallStatus("timeout"));
      cleanup();
      setTimeout(() => dispatch(endCall()), 2000);
    });

    return () => {
      socket.off("call:callId");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:busy");
      socket.off("call:timeout");
    };
  }, [user, dispatch, cleanup, callState.incomingCall]);

  // ── Initiate Call ──────────────────────────────────
  const initiateCall = async ({
    receiverId,
    receiverName,
    receiverAvatar,
    callType,
  }) => {
    try {
      console.log("Initiating call to:", receiverId);

      const stream = await getMedia(callType);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPC(receiverId);
      addTracks(stream);

      dispatch(
        setActiveCall({
          receiverId,
          receiverName,
          receiverAvatar,
          callType,
          callId: null,
        }),
      );

      const socket = getSocket();
      socket?.emit("call:initiate", {
        receiverId,
        callType,
        callerId: user._id,
        callerName: user.name,
        callerAvatar: user.avatar,
      });
    } catch (error) {
      console.error("Initiate call error:", error);
      dispatch(setCallStatus("error"));
      cleanup();
    }
  };

  // ── Accept Incoming Call ───────────────────────────
  const acceptCall = async () => {
    try {
      const { incomingCall } = callState;
      if (!incomingCall) return;

      console.log("Accepting call from:", incomingCall.callerId);

      const stream = await getMedia(incomingCall.callType);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPC(incomingCall.callerId);
      addTracks(stream);

      const socket = getSocket();
      socket?.emit("call:accepted", {
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
      });

      callerIdRef.current = incomingCall.callerId;

      dispatch(
        setActiveCall({
          receiverId: incomingCall.callerId,
          receiverName: incomingCall.callerName,
          receiverAvatar: incomingCall.callerAvatar,
          callType: incomingCall.callType,
          callId: incomingCall.callId,
        }),
      );

      dispatch(setIncomingCall(null));
      dispatch(setCallConnected());
    } catch (error) {
      console.error("Accept call error:", error);
      dispatch(setCallStatus("error"));
      cleanup();
    }
  };

  // ── Reject Call ────────────────────────────────────
  const rejectCall = () => {
    const { incomingCall } = callState;
    if (!incomingCall) return;

    const socket = getSocket();
    socket?.emit("call:rejected", {
      callId: incomingCall.callId,
      callerId: incomingCall.callerId,
    });

    dispatch(setIncomingCall(null));
    dispatch(endCall());
    cleanup();
  };

  // ── Hang Up ────────────────────────────────────────
  const hangUp = () => {
    const { activeCall, callDuration } = callState;
    const socket = getSocket();

    socket?.emit("call:ended", {
      callId: callIdRef.current || activeCall?.callId,
      receiverId: activeCall?.receiverId,
      callerId: user._id,
    });

    // Save call log
    if (activeCall?.receiverId) {
      dispatch(
        saveCallLog({
          receiverId: activeCall.receiverId,
          type: activeCall.callType,
          status: "ended",
          duration: callDuration,
          startedAt: callStartRef.current
            ? new Date(callStartRef.current).toISOString()
            : null,
          endedAt: new Date().toISOString(),
        }),
      );
    }

    dispatch(setCallStatus("ended"));
    cleanup();
    setTimeout(() => dispatch(endCall()), 1500);
  };

  // ── Toggle Audio ───────────────────────────────────
  const handleToggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        dispatch(toggleAudioMute());
      }
    }
  };

  // ── Toggle Video ───────────────────────────────────
  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        dispatch(toggleVideoMute());
      }
    }
  };

  // ── Screen Share ───────────────────────────────────
  const handleScreenShare = async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pcRef.current
          ?.getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        videoTrack.onended = () => {
          handleScreenShare();
        };

        dispatch(toggleVideoMute());
      } else {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        const sender = pcRef.current
          ?.getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
        dispatch(toggleVideoMute());
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  return (
    <CallContext.Provider
      value={{
        localStream,
        remoteStream,
        initiateCall,
        acceptCall,
        rejectCall,
        hangUp,
        handleToggleAudio,
        handleToggleVideo,
        handleScreenShare,
        callState,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCallContext must be used within CallProvider");
  }
  return context;
};

export default CallContext;
