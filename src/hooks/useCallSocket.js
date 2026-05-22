import { useEffect }               from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket }               from "../socket/socket";
import {
  setIncomingCall,
  setCallConnected,
  setCallStatus,
  endCall,
  saveCallLog,
} from "../store/callSlice";

const useCallSocket = () => {
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);
  const callState = useSelector((state) => state.call);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    // ── Incoming Call ──────────────────────────────
    socket.on("call:incoming", (callData) => {
      dispatch(setIncomingCall(callData));
    });

    // ── Call Accepted ──────────────────────────────
    socket.on("call:accepted", ({ callId }) => {
      dispatch(setCallConnected());
    });

    // ── Call Rejected ──────────────────────────────
    socket.on("call:rejected", ({ callId }) => {
      dispatch(setCallStatus("rejected"));
      setTimeout(() => dispatch(endCall()), 2000);
    });

    // ── Call Ended ─────────────────────────────────
    socket.on("call:ended", ({ callId, duration }) => {
      dispatch(setCallStatus("ended"));

      // Save call log for receiver side
      if (callState.incomingCall) {
        dispatch(saveCallLog({
          receiverId: user._id,
          type:       callState.incomingCall.callType,
          status:     "received",
          duration:   duration || 0,
          endedAt:    new Date().toISOString(),
        }));
      }

      setTimeout(() => dispatch(endCall()), 1500);
    });

    // ── Call Busy ──────────────────────────────────
    socket.on("call:busy", () => {
      dispatch(setCallStatus("busy"));
      setTimeout(() => dispatch(endCall()), 2000);
    });

    // ── Call Timeout ───────────────────────────────
    socket.on("call:timeout", ({ callId }) => {
      dispatch(setCallStatus("timeout"));

      // Save missed call log
      dispatch(saveCallLog({
        receiverId: callState.activeCall?.receiverId,
        type:       callState.activeCall?.callType,
        status:     "missed",
        duration:   0,
        endedAt:    new Date().toISOString(),
      }));

      setTimeout(() => dispatch(endCall()), 2000);
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:busy");
      socket.off("call:timeout");
    };
  }, [user, dispatch, callState]);

  // ── Initiate Call ──────────────────────────────────
  const initiateCall = ({ receiverId, receiverName, receiverAvatar, callType }) => {
    const socket = getSocket();
    socket?.emit("call:initiate", {
      receiverId,
      callType,
      callerId:     user._id,
      callerName:   user.name,
      callerAvatar: user.avatar,
    });
  };

  // ── Accept Call ────────────────────────────────────
  const acceptCall = (callId, callerId) => {
    const socket = getSocket();
    socket?.emit("call:accepted", { callId, callerId });
    dispatch(setCallConnected());
  };

  // ── Reject Call ────────────────────────────────────
  const rejectCall = (callId, callerId) => {
    const socket = getSocket();
    socket?.emit("call:rejected", { callId, callerId });
    dispatch(endCall());
  };

  // ── End Call ───────────────────────────────────────
  const hangUp = ({ callId, receiverId, callerId }) => {
    const socket = getSocket();
    socket?.emit("call:ended", { callId, receiverId, callerId });
    dispatch(setCallStatus("ended"));
    setTimeout(() => dispatch(endCall()), 1500);
  };

  return {
    initiateCall,
    acceptCall,
    rejectCall,
    hangUp,
  };
};

export default useCallSocket;