import { useEffect, useRef } from "react";

function VideoPlayer({ stream, muted = false, isLocal = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted || isLocal}
      className={`bg-black ${
        isLocal
          ? "w-32 h-24 md:w-40 md:h-32 rounded-2xl object-cover"
          : "w-full h-full object-contain"
      }`}
      style={
        !isLocal
          ? {
              transform: "scaleX(-1)",
            }
          : {}
      }
    />
  );
}

export default VideoPlayer;
