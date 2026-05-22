import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector }    from "react-redux";
import { getSocket }                   from "../socket/socket";
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
  setCallConnected,
  endCall,
} from "../store/callSlice";

const useWebRTC = () => {
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);
  const callState = useSelector((state) => state.call);

  const peerRef         = useRef(null);
  const localStreamRef  = useRef(null);
  const remoteStreamRef = useRef(null);

  const [localStream,  setLocalStream]  = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // ── Setup Peer Connection ──────────────────────────
  const setupPeerConnection = (targetId) => {
    const socket = getSocket();

    const pc = createPeerConnection(
      // On ICE candidate
      (candidate) => {
        socket?.emit("webrtc:ice", { candidate, targetId });
      },
      // On remote track
      (stream) => {
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
        dispatch(setCallConnected());
        setIsConnecting(false);
      }
    );

    peerRef.current = pc;
    return pc;
  };

  // ── Start Call as Caller ───────────────────────────
  const startCall = async (localStream, targetId) => {
    try {
      setIsConnecting(true);
      localStreamRef.current = localStream;
      setLocalStream(localStream);

      setupPeerConnection(targetId);
      addLocalStream(localStream);

      const offer = await createOffer();
      const socket = getSocket();
      socket?.emit("webrtc:offer", { offer, receiverId: targetId });
    } catch (error) {
      console.error("Error starting call:", error);
      setIsConnecting(false);
    }
  };

  // ── Answer Call as Receiver ────────────────────────
  const answerCall = async (localStream, callerId, offer) => {
    try {
      setIsConnecting(true);
      localStreamRef.current = localStream;
      setLocalStream(localStream);

      setupPeerConnection(callerId);
      addLocalStream(localStream);

      const answer = await createAnswer(offer);
      const socket = getSocket();
      socket?.emit("webrtc:answer", { answer, callerId });
    } catch (error) {
      console.error("Error answering call:", error);
      setIsConnecting(false);
    }
  };

  // ── Handle Incoming Offer ──────────────────────────
  const handleOffer = async (offer, callerId) => {
    if (!localStreamRef.current) return;
    const answer = await createAnswer(offer);
    const socket = getSocket();
    socket?.emit("webrtc:answer", { answer, callerId });
  };

  // ── Handle Incoming Answer ─────────────────────────
  const handleAnswer = async (answer) => {
    await setRemoteAnswer(answer);
  };

  // ── Handle Incoming ICE Candidate ──────────────────
  const handleIceCandidate = async (candidate) => {
    await addIceCandidate(candidate);
  };

  // ── Cleanup ────────────────────────────────────────
  const cleanupWebRTC = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    closePeerConnection();
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnecting(false);
  };

  // ── Cleanup on unmount ─────────────────────────────
  useEffect(() => {
    return () => cleanupWebRTC();
  }, []);

  return {
    localStream,
    remoteStream,
    isConnecting,
    startCall,
    answerCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanupWebRTC,
  };
};

export default useWebRTC;