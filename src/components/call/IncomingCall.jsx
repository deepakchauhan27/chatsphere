import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useCallContext } from "../../context/CallContext";
import Avatar from "../ui/Avatar";
import ringtone from "../../assets/video-audio-ring.mp3";
import { MdCallEnd, MdCall } from "react-icons/md";
import endcall from "../../assets/end-call-ring.mp3";

function IncomingCall() {
  const { incomingCall } = useSelector((state) => state.call);
  const { acceptCall, rejectCall } = useCallContext();

  const audioRef = useRef(null);

  useEffect(() => {
    if (incomingCall) {
      audioRef.current = new Audio(ringtone);
      audioRef.current.loop = true;

      audioRef.current
        .play()
        .catch((err) => console.log("Audio autoplay blocked:", err));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [incomingCall]);

  const handleAccept = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    acceptCall();
  };

  const handleReject = () => {
    // Stop incoming ringtone
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Play end call sound
    const endAudio = new Audio(endCallSound);

    endAudio.play().catch((err) => {
      console.log("End call audio failed:", err);
      rejectCall();
    });

    endAudio.onended = () => {
      rejectCall();
    };

    // Fallback
    setTimeout(() => {
      rejectCall();
    }, 1500);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-80 text-center animate-bounce-once">
        {/* Caller Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar
              src={incomingCall.callerAvatar}
              name={incomingCall.callerName}
              size="xl"
            />
            <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping opacity-50" />
          </div>
        </div>

        {/* Call Info */}
        <p className="text-gray-500 text-sm font-medium mb-1">
          Incoming {incomingCall.callType} call
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {incomingCall.callerName}
        </h2>

        <p className="text-green-500 text-sm mb-8 animate-pulse">Ringing...</p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleReject}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition active:scale-95"
            >
              <MdCallEnd />
            </button>
            <span className="text-xs text-gray-500 font-medium">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAccept}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition active:scale-95"
            >
              <MdCall />
            </button>
            <span className="text-xs text-gray-500 font-medium">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
