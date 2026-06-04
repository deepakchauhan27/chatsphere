import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useCallContext } from "../../context/CallContext";
import VideoPlayer from "./VideoPlayer";
import CallControls from "./CallControls";
import CallTimer from "./CallTimer";
import Avatar from "../ui/Avatar";
import AudioCall from "./AudioCall";

function CallScreen() {
  const { activeCall, incomingCall, callStatus, isVideoMuted } = useSelector(
    (state) => state.call,
  );

  const { localStream, remoteStream } = useCallContext();

  const isVideoCall =
    activeCall?.callType === "video" || incomingCall?.callType === "video";

  const otherUser = activeCall
    ? { name: activeCall.receiverName, avatar: activeCall.receiverAvatar }
    : { name: incomingCall?.callerName, avatar: incomingCall?.callerAvatar };

  // Only show if there is an active call
  if (!activeCall && !incomingCall) return null;
  if (callStatus === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {isVideoCall ? (
        /* ── Video Call ─────────────────────────── */
        <div className="relative flex-1 bg-black">
          {/* Remote Video */}
          {remoteStream ? (
            <VideoPlayer
              stream={remoteStream}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gray-900">
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

          {/* Local Video PiP */}
          {localStream && !isVideoMuted && (
            <div className="absolute top-4 right-4 z-10 rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-300">
              <VideoPlayer stream={localStream} muted isLocal />
            </div>
          )}

          {/* Call Info */}
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
            <p className="text-white font-semibold text-sm">
              {otherUser?.name}
            </p>
            <CallTimer />
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
            <CallControls />
          </div>
        </div>
      ) : (
        /* ── Audio Call ─────────────────────────── */
        <div
          className="flex-1 flex flex-col items-center justify-between py-16 px-8"
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #92400e 100%)",
          }}
        >
          <div className="mt-10">
            <AudioCall />
          </div>
          {/* Top: Other User */}
        </div>
      )}
    </div>
  );
}

export default CallScreen;
