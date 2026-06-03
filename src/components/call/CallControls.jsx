import { useCallContext } from "../../context/CallContext";
import { useSelector } from "react-redux";
import Tooltip from "../ui/Tooltip";
import endcall from "../../assets/end-call-ring.mp3";
import {
  MdCallEnd,
  MdComputer,
  MdMicOff,
  MdVideocam,
  MdOutlineVideocamOff,
  MdMic,
} from "react-icons/md";

function CallControls() {
  const { hangUp, handleToggleAudio, handleToggleVideo, handleScreenShare } =
    useCallContext();

  const { isAudioMuted, isVideoMuted, isScreenSharing, activeCall } =
    useSelector((state) => state.call);

  const isVideoCall = activeCall?.callType === "video";

  const handleHangUp = () => {
    const audio = new Audio(endcall);

    audio.play().catch((err) => {
      console.log("End call sound failed:", err);
      hangUp();
    });

    audio.onended = () => {
      hangUp();
    };

    // Fallback in case onended doesn't fire
    setTimeout(() => {
      hangUp();
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6 bg-gray-900/80 backdrop-blur-sm rounded-2xl px-8">
      {/* Mute Audio */}
      <Tooltip text={isAudioMuted ? "Unmute" : "Mute"}>
        <button
          onClick={handleToggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition active:scale-95 ${
            isAudioMuted
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-white/20 hover:bg-white/30 text-white"
          }`}
        >
          {isAudioMuted ? <MdMicOff /> : <MdMic />}
        </button>
      </Tooltip>

      {/* Mute Video */}
      {isVideoCall && (
        <Tooltip text={isVideoMuted ? "Turn on camera" : "Turn off camera"}>
          <button
            onClick={handleToggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition active:scale-95 ${
              isVideoMuted
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-white/20 hover:bg-white/30 text-white"
            }`}
          >
            {isVideoMuted ? <MdOutlineVideocamOff /> : <MdVideocam />}
          </button>
        </Tooltip>
      )}

      {/* Screen Share */}
      {isVideoCall && (
        <Tooltip text={isScreenSharing ? "Stop sharing" : "Share screen"}>
          <button
            onClick={handleScreenShare}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition active:scale-95 ${
              isScreenSharing
                ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                : "bg-white/20 hover:bg-white/30 text-white"
            }`}
          >
            <MdComputer />
          </button>
        </Tooltip>
      )}

      {/* End Call */}
      <Tooltip text="End Call">
        <button
          onClick={handleHangUp}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition active:scale-95"
        >
          <MdCallEnd />
        </button>
      </Tooltip>
    </div>
  );
}

export default CallControls;
