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
      className={`rounded-2xl object-cover bg-gray-900 ${
        isLocal
          ? "w-32 h-24 md:w-48 md:h-36 shadow-lg border-2 border-yellow-300"
          : "w-full h-full"
      }`}
    />
  );
}

export default VideoPlayer;