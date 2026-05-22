import { useState, useRef } from "react";

const MEDIA_TYPES = [
  { label: "Photo",    accept: "image/*",  type: "image",  icon: "📷" },
  { label: "Video",    accept: "video/*",  type: "video",  icon: "🎥" },
  { label: "Audio",    accept: "audio/*",  type: "audio",  icon: "🎙️" },
  { label: "Document", accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt", type: "file", icon: "📄" },
];

function MediaUpload({ onSend, onClose }) {
  const [preview,      setPreview]      = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [error,        setError]        = useState("");
  const fileRef                         = useRef(null);

  const MAX_SIZES = {
    image: 5  * 1024 * 1024,
    video: 50 * 1024 * 1024,
    audio: 10 * 1024 * 1024,
    file:  20 * 1024 * 1024,
  };

  const handleTypeSelect = (mediaType) => {
    setSelectedType(mediaType);
    fileRef.current.accept = mediaType.accept;
    fileRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = MAX_SIZES[selectedType?.type] || MAX_SIZES.file;
    if (file.size > maxSize) {
      setError(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setError("");
    setSelectedFile(file);

    if (selectedType?.type === "image") {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSend = () => {
    if (!selectedFile || !selectedType) return;
    onSend(selectedFile, selectedType.type);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
  };

  return (
    <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {!selectedFile ? (
        <>
          <p className="text-xs text-yellow-700 font-semibold mb-3">
            Select media to send
          </p>
          <div className="grid grid-cols-4 gap-2">
            {MEDIA_TYPES.map((mt) => (
              <button
                key={mt.type}
                onClick={() => handleTypeSelect(mt)}
                className="flex flex-col items-center gap-1 bg-white border border-yellow-200 hover:bg-yellow-100 rounded-xl py-3 transition active:scale-95"
              >
                <span className="text-2xl">{mt.icon}</span>
                <span className="text-xs text-gray-600 font-medium">
                  {mt.label}
                </span>
              </button>
            ))}
          </div>
          {error && (
            <p className="text-red-500 text-xs mt-2">{error}</p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-16 h-16 object-cover rounded-xl border border-yellow-200"
            />
          ) : (
            <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl border border-yellow-200">
              {selectedType?.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-3 py-1.5 text-xs text-yellow-900 bg-yellow-300 hover:bg-yellow-400 rounded-lg font-semibold transition active:scale-95"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaUpload;