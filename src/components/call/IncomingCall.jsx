import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useCallContext } from "../../context/CallContext";
import Avatar from "../ui/Avatar";
import { MdCall, MdCallEnd } from "react-icons/md";
import ringtone from "../../assets/video-audio-ring.mp3";
import endCallSound from "../../assets/end-call-ring.mp3";

function IncomingCall() {
  const { incomingCall } = useSelector((state) => state.call);
  const { acceptCall, rejectCall } = useCallContext();

  const ringtoneRef = useRef(null);

  useEffect(() => {
    if (!incomingCall) return;

    const audio = new Audio(ringtone);
    audio.loop = true;

    audio.play()
      .then(() => console.log("Ringtone playing"))
      .catch((err) => console.log("Ringtone blocked:", err));

    ringtoneRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [incomingCall]);

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };

  const handleAccept = () => {
    stopRingtone();
    acceptCall();
  };

  const handleReject = () => {
    stopRingtone();

    const endAudio = new Audio(endCallSound);

    endAudio.play().catch(() => {
      rejectCall();
    });

    endAudio.onended = () => {
      rejectCall();
    };

    setTimeout(() => {
      rejectCall();
    }, 1000);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-80 text-center">
        {/* Caller Avatar */}
        <div className="flex justify-center mb-4 relative">
          <div className="relative">
            <Avatar
              src={incomingCall.callerAvatar}
              name={incomingCall.callerName}
              size="xl"
            />
            <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping opacity-40" />
          </div>
        </div>

        {/* Call Info */}
        <p className="text-gray-400 text-sm font-medium mb-1">
          Incoming {incomingCall.callType} call
        </p>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {incomingCall.callerName}
        </h2>

        <p className="text-green-500 text-sm mb-2 animate-pulse">Ringing...</p>

        <p className="text-yellow-500 text-sm mb-8 font-medium">
          {incomingCall.callType === "video"
            ? "📹 Video Call"
            : "🎙️ Audio Call"}
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleReject}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition active:scale-95"
            >
              <MdCallEnd className="text-3xl" />
            </button>
            <span className="text-xs text-gray-500 font-medium">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAccept}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition active:scale-95"
            >
              <MdCall className="text-3xl" />
            </button>
            <span className="text-xs text-gray-500 font-medium">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
