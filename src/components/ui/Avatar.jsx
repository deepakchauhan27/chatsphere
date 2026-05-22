function Avatar({ src, name, size = "md", online = false }) {
  const sizes = {
    sm:  "w-8 h-8 text-xs",
    md:  "w-10 h-10 text-sm",
    lg:  "w-14 h-14 text-lg",
    xl:  "w-20 h-20 text-2xl",
  };

  const dotSizes = {
    sm:  "w-2 h-2",
    md:  "w-2.5 h-2.5",
    lg:  "w-3 h-3",
    xl:  "w-4 h-4",
  };

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full overflow-hidden border-2 border-yellow-200`}>
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-yellow-300 flex items-center justify-center text-yellow-900 font-bold">
            {name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-green-400 border-2 border-white rounded-full`}
        />
      )}
    </div>
  );
}

export default Avatar;