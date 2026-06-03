import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGroupChat } from "../../store/chatSlice";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import chatService from "../../services/chatService";
import toast from "react-hot-toast";
import { MdGroupAdd, MdClose, MdSearch, MdAdd } from "react-icons/md";

function CreateGroup({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await chatService.searchUsers(val);
        setResults(data.filter((u) => u._id !== user._id));
      } catch {
        setResults([]);
      }
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
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selected.length < 2) {
      toast.error("Add at least 2 members");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());

      // ── Send each participant ID separately ──────────
      selected.forEach((s) => {
        formData.append("participants", s._id);
      });

      if (avatarFile) formData.append("groupAvatar", avatarFile);

      const result = await dispatch(createGroupChat(formData));

      if (createGroupChat.fulfilled.match(result)) {
        toast.success("Group created successfully!");
        onClose();
        // Reset
        setName("");
        setSelected([]);
        setPreview(null);
        setAvatarFile(null);
        setQuery("");
        setResults([]);
      } else {
        toast.error(result.payload || "Failed to create group");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Group" size="md">
      {/* Group Avatar */}
      <div className="flex justify-center mb-5">
        <div className="relative">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-300 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="group"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-yellow-100 flex items-center justify-center">
                <MdGroupAdd className="text-4xl text-yellow-500" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 bg-yellow-400 hover:bg-yellow-500 rounded-full w-7 h-7 flex items-center justify-center transition"
          >
            <MdAdd className="text-yellow-900 text-sm" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Group Name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Group Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name..."
          className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-yellow-300 outline-none transition bg-gray-50"
        />
      </div>

      {/* Search Members */}
      <div className="mb-3">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Add Members
        </label>
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="email"
            value={query}
            onChange={handleSearch}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-yellow-300 outline-none transition bg-gray-50"
          />
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="border border-yellow-100 rounded-xl overflow-hidden mb-3 max-h-40 overflow-y-auto shadow-sm">
          {results.map((u) => (
            <div
              key={u._id}
              onClick={() => handleSelect(u)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 cursor-pointer border-b last:border-0 transition"
            >
              <Avatar src={u.avatar} name={u.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {u.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <MdAdd className="text-yellow-500 text-xl flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Selected Members */}
      {selected.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Selected ({selected.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((s) => (
              <div
                key={s._id}
                className="flex items-center gap-1.5 bg-yellow-100 border border-yellow-200 rounded-full px-3 py-1"
              >
                <span className="text-sm text-yellow-800 font-medium">
                  {s.name}
                </span>
                <button
                  onClick={() => handleRemove(s._id)}
                  className="text-yellow-600 hover:text-red-500 transition"
                >
                  <MdClose className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members count hint */}
      <p className="text-xs text-gray-400 mb-4">
        {selected.length < 2
          ? `Add ${2 - selected.length} more member${2 - selected.length === 1 ? "" : "s"} to create group`
          : `${selected.length} members selected ✅`}
      </p>

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={loading || !name.trim() || selected.length < 2}
        className="w-full bg-yellow-300 hover:bg-yellow-400 text-yellow-900 font-bold py-3 rounded-xl transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <MdGroupAdd className="text-xl" />
        {loading ? "Creating..." : "Create Group"}
      </button>
    </Modal>
  );
}

export default CreateGroup;
