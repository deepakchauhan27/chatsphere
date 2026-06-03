import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../socket/socket";
import {
  setActiveCall,
  setCallConnected,
  endCall,
  setCallStatus,
  setIncomingCall,
  toggleAudioMute,
  toggleVideoMute,
  toggleScreenShare,
  incrementDuration,
  saveCallLog,
} from "../store/callSlice";
import {
  createPeerConnection,
  closePeerConnection,
  addLocalStream,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
} from "../webrtc/peerConnection";
import {
  getUserMedia,
  getScreenShare,
  stopMediaStream,
  toggleAudio,
  toggleVideo,
  replaceVideoTrack,
} from "../webrtc/mediaConstraints";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const callState = useSelector((state) => state.call);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const timerRef = useRef(null);
  const callStartRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // ── WebRTC Socket Events ───────────────────────────
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    // ── Receive Offer ──────────────────────────────
    socket.on("webrtc:offer", async ({ offer }) => {
      if (!localStreamRef.current) return;

      const answer = await createAnswer(offer);
      const callerId = callState.incomingCall?.callerId;

      socket.emit("webrtc:answer", { answer, callerId });
    });

    // ── Receive Answer ─────────────────────────────
    socket.on("webrtc:answer", async ({ answer }) => {
      await setRemoteAnswer(answer);
    });

    // ── Receive ICE Candidate ──────────────────────
    socket.on("webrtc:ice", async ({ candidate }) => {
      await addIceCandidate(candidate);
    });

    return () => {
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice");
    };
  }, [user, callState.incomingCall]);

  // ── Call Duration Timer ────────────────────────────
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

  // ── Initiate Call ──────────────────────────────────
  const initiateCall = async ({
    receiverId,
    receiverName,
    receiverAvatar,
    callType,
  }) => {
    try {
      const stream = await getUserMedia(callType);
      localStreamRef.current = stream;
      setLocalStream(stream);

      // Setup peer connection
      const pc = createPeerConnection(
        (candidate) => {
          const socket = getSocket();
          socket?.emit("webrtc:ice", { candidate, targetId: receiverId });
        },
        (remoteStream) => {
          remoteStreamRef.current = remoteStream;
          setRemoteStream(remoteStream);
        },
      );

      addLocalStream(stream);

      dispatch(
        setActiveCall({ receiverId, receiverName, receiverAvatar, callType }),
      );

      const socket = getSocket();
      socket?.emit("call:initiate", {
        receiverId,
        callType,
        callerId: user._id,
        callerName: user.name,
        callerAvatar: user.avatar,
      });

      // Get callId back from server
      socket?.once("call:callId", async ({ callId }) => {
        dispatch(
          setActiveCall({
            receiverId,
            receiverName,
            receiverAvatar,
            callType,
            callId,
          }),
        );

        // Create and send offer
        const offer = await createOffer();
        socket?.emit("webrtc:offer", { offer, receiverId });
      });
    } catch (error) {
      console.error("Error initiating call:", error);
      dispatch(setCallStatus("error"));
    }
  };

  // ── Accept Incoming Call ───────────────────────────
  const acceptCall = async () => {
    try {
      const { incomingCall } = callState;
      const stream = await getUserMedia(incomingCall.callType);
      localStreamRef.current = stream;
      setLocalStream(stream);

      createPeerConnection(
        (candidate) => {
          const socket = getSocket();
          socket?.emit("webrtc:ice", {
            candidate,
            targetId: incomingCall.callerId,
          });
        },
        (remoteStream) => {
          remoteStreamRef.current = remoteStream;
          setRemoteStream(remoteStream);
        },
      );

      addLocalStream(stream);
      dispatch(
        setActiveCall({
          receiverId: incomingCall.callerId,
          receiverName: incomingCall.callerName,
          receiverAvatar: incomingCall.callerAvatar,
          callType: incomingCall.callType,
          callId: incomingCall.callId,
        }),
      );

      const socket = getSocket();
      socket?.emit("call:accepted", {
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
      });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  // ── Reject Incoming Call ───────────────────────────
  const rejectCall = () => {
    const { incomingCall } = callState;
    const socket = getSocket();
    socket?.emit("call:rejected", {
      callId: incomingCall?.callId,
      callerId: incomingCall?.callerId,
    });
    dispatch(setIncomingCall(null));
    dispatch(endCall());
  };

  // ── End Active Call ────────────────────────────────
  const hangUp = () => {
    const { activeCall, incomingCall, callDuration } = callState;
    const socket = getSocket();

    socket?.emit("call:ended", {
      callId: activeCall?.callId || incomingCall?.callId,
      receiverId: activeCall?.receiverId,
      callerId: incomingCall?.callerId,
    });

    // Save call log
    dispatch(
      saveCallLog({
        receiverId: activeCall?.receiverId || incomingCall?.callerId,
        type: activeCall?.callType || incomingCall?.callType,
        status: "ended",
        duration: callDuration,
        startedAt: callStartRef.current
          ? new Date(callStartRef.current).toISOString()
          : null,
        endedAt: new Date().toISOString(),
      }),
    );

    // Cleanup
    stopMediaStream(localStreamRef.current);
    stopMediaStream(remoteStreamRef.current);
    stopMediaStream(screenStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    closePeerConnection();
    dispatch(endCall());
  };

  // ── Toggle Mute Audio ──────────────────────────────
  const handleToggleAudio = () => {
    toggleAudio(localStreamRef.current, !callState.isAudioMuted);
    dispatch(toggleAudioMute());
  };

  // ── Toggle Mute Video ──────────────────────────────
  const handleToggleVideo = () => {
    toggleVideo(localStreamRef.current, !callState.isVideoMuted);
    dispatch(toggleVideoMute());
  };

  // ── Toggle Screen Share ────────────────────────────
  const handleScreenShare = async () => {
    const { isScreenSharing } = callState;

    if (!isScreenSharing) {
      try {
        const screenStream = await getScreenShare();
        screenStreamRef.current = screenStream;

        const pc = createPeerConnection(
          () => {},
          () => {},
        );
        await replaceVideoTrack(pc, screenStream);

        // Stop screen share when user clicks browser stop button
        screenStream.getVideoTracks()[0].onended = () => {
          handleScreenShare();
        };

        dispatch(toggleScreenShare());
      } catch (error) {
        console.error("Screen share error:", error);
      }
    } else {
      // Switch back to camera
      const pc = createPeerConnection(
        () => {},
        () => {},
      );
      await replaceVideoTrack(pc, localStreamRef.current);
      stopMediaStream(screenStreamRef.current);
      screenStreamRef.current = null;
      dispatch(toggleScreenShare());
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
