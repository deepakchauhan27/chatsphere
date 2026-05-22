import { useSelector }    from "react-redux";
import { useCallContext } from "../../context/CallContext";
import VideoPlayer        from "./VideoPlayer";
import AudioCall          from "./AudioCall";
import CallControls       from "./CallControls";
import CallTimer          from "./CallTimer";
import Avatar             from "../ui/Avatar";

function CallScreen() {
  const { activeCall, incomingCall, callStatus, isVideoMuted } =
    useSelector((state) => state.call);
  const { localStream, remoteStream } = useCallContext();

  const isVideoCall = activeCall?.callType === "video" ||
                      incomingCall?.callType === "video";

  const otherUser = activeCall
    ? { name: activeCall.receiverName,  avatar: activeCall.receiverAvatar }
    : { name: incomingCall?.callerName, avatar: incomingCall?.callerAvatar };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">

      {/* ── Video Call ─────────────────────────────── */}
      {isVideoCall ? (
        <div className="relative flex-1">
          {/* Remote Video (full screen) */}
          {remoteStream ? (
            <VideoPlayer stream={remoteStream} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <Avatar
                src={otherUser?.avatar}
                name={otherUser?.name}
                size="xl"
              />
              <h2 className="text-2xl font-bold text-white">
                {otherUser?.name}
              </h2>
              <CallTimer />
            </div>
          )}

          {/* Local Video (picture-in-picture) */}
          {localStream && !isVideoMuted && (
            <div className="absolute top-4 right-4 z-10">
              <VideoPlayer stream={localStream} muted isLocal />
            </div>
          )}

          {/* Call Info Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white font-semibold text-sm">
                {otherUser?.name}
              </p>
              <CallTimer />
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
            <CallControls />
          </div>
        </div>

      ) : (
        /* ── Audio Call ──────────────────────────── */
        <div
          className="flex-1 flex flex-col"
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #92400e 100%)",
          }}
        >
          <AudioCall />
        </div>
      )}
    </div>
  );
}

export default CallScreen;