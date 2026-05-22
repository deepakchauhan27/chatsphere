import { useState, useRef }         from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGroupChat }          from "../../store/chatSlice";
import Modal                        from "../ui/Modal";
import Avatar                       from "../ui/Avatar";
import chatService                  from "../../services/chatService";
import toast                        from "react-hot-toast";

function CreateGroup({ isOpen, onClose }) {
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);

  const [name,      setName]      = useState("");
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState([]);
  const [selected,  setSelected]  = useState([]);
  const [preview,   setPreview]   = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading,   setLoading]   = useState(false);
  const fileRef                   = useRef(null);
  const debounceRef               = useRef(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const data = await chatService.searchUsers(val);
      setResults(data.filter((u) => u._id !== user._id));
    }, 400);
  };

  const handleSelect = (u) => {
    if (selected.find((s) => s._id === u._id)) return;
    setSelected([...selected, u]);
    setQuery("");
    setResults([]);
  };

  const handleRemove = (id) => {
    setSelected(selected.filter((s) => s._id !== id));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!name.trim())       { toast.error("Group name is required"); return; }
    if (selected.length < 2){ toast.error("Add at least 2 members"); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("participants", JSON.stringify(selected.map((s) => s._id)));
    if (avatarFile) formData.append("groupAvatar", avatarFile);

    const result = await dispatch(createGroupChat(formData));
    if (createGroupChat.fulfilled.match(result)) {
      toast.success("Group created!");
      onClose();
      setName(""); setSelected([]); setPreview(null); setAvatarFile(null);
    } else {
      toast.error("Failed to create group");
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group" size="md">
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-300 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="group" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-yellow-100 flex items-center justify-center text-3xl">
                👥
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ✏️
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Group Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Group name"
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none mb-4"
      />

      {/* Search Members */}
      <input
        type="email"
        value={query}
        onChange={handleSearch}
        placeholder="Search members by email..."
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-300 outline-none mb-2"
      />

      {/* Search Results */}
      {results.length > 0 && (
        <div className="border border-yellow-100 rounded-xl overflow-hidden mb-3 max-h-36 overflow-y-auto">
          {results.map((u) => (
            <div
              key={u._id}
              onClick={() => handleSelect(u)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-yellow-50 cursor-pointer border-b last:border-0"
            >
              <Avatar src={u.avatar} name={u.name} size="sm" />
              <div>
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Members */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((s) => (
            <div
              key={s._id}
              className="flex items-center gap-1 bg-yellow-100 rounded-full px-3 py-1"
            >
              <span className="text-sm text-yellow-800 font-medium">{s.name}</span>
              <button
                onClick={() => handleRemove(s._id)}
                className="text-yellow-600 hover:text-yellow-900 font-bold text-xs ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold py-3 rounded-lg transition active:scale-95 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Group"}
      </button>
    </Modal>
  );
}

export default CreateGroup;