import { useState, useRef, useEffect } from "react";
import {
  getUserMedia,
  getScreenShare,
  stopMediaStream,
  toggleAudio,
  toggleVideo,
} from "../webrtc/mediaConstraints";

const useMediaStream = (callType = "video") => {
  const [localStream,    setLocalStream]    = useState(null);
  const [isAudioMuted,   setIsAudioMuted]   = useState(false);
  const [isVideoMuted,   setIsVideoMuted]   = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error,          setError]          = useState(null);
  const [isLoading,      setIsLoading]      = useState(false);

  const streamRef       = useRef(null);
  const screenStreamRef = useRef(null);

  // ── Get local media stream ─────────────────────────
  const startStream = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await getUserMedia(callType);
      streamRef.current = stream;
      setLocalStream(stream);

      return stream;
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Camera/Microphone permission denied"
          : err.name === "NotFoundError"
          ? "Camera/Microphone not found"
          : "Failed to access media devices";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stop local media stream ────────────────────────
  const stopStream = () => {
    stopMediaStream(streamRef.current);
    stopMediaStream(screenStreamRef.current);
    streamRef.current       = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setIsScreenSharing(false);
  };

  // ── Toggle Audio ───────────────────────────────────
  const handleToggleAudio = () => {
    const newMuted = !isAudioMuted;
    toggleAudio(streamRef.current, newMuted);
    setIsAudioMuted(newMuted);
  };

  // ── Toggle Video ───────────────────────────────────
  const handleToggleVideo = () => {
    const newMuted = !isVideoMuted;
    toggleVideo(streamRef.current, newMuted);
    setIsVideoMuted(newMuted);
  };

  // ── Start Screen Share ─────────────────────────────
  const startScreenShare = async () => {
    try {
      const screenStream = await getScreenShare();
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      // Auto stop when browser stop button clicked
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      return screenStream;
    } catch (err) {
      console.error("Screen share error:", err);
      return null;
    }
  };

  // ── Stop Screen Share ──────────────────────────────
  const stopScreenShare = () => {
    stopMediaStream(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenSharing(false);
  };

  // ── Cleanup on unmount ─────────────────────────────
  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
      stopMediaStream(screenStreamRef.current);
    };
  }, []);

  return {
    localStream,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    isLoading,
    error,
    startStream,
    stopStream,
    handleToggleAudio,
    handleToggleVideo,
    startScreenShare,
    stopScreenShare,
  };
};

export default useMediaStream;