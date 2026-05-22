import { useCallContext } from "../../context/CallContext";
import { useSelector }    from "react-redux";
import Tooltip            from "../ui/Tooltip";

function CallControls() {
  const {
    hangUp,
    handleToggleAudio,
    handleToggleVideo,
    handleScreenShare,
  }                 = useCallContext();
  const {
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    activeCall,
  }                 = useSelector((state) => state.call);

  const isVideoCall = activeCall?.callType === "video";

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
          {isAudioMuted ? "🔇" : "🎙️"}
        </button>
      </Tooltip>

      {/* Mute Video (video calls only) */}
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
            {isVideoMuted ? "📷" : "📹"}
          </button>
        </Tooltip>
      )}

      {/* Screen Share (video calls only) */}
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
            🖥️
          </button>
        </Tooltip>
      )}

      {/* End Call */}
      <Tooltip text="End Call">
        <button
          onClick={hangUp}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition active:scale-95"
        >
          📵
        </button>
      </Tooltip>
    </div>
  );
}

export default CallControls;