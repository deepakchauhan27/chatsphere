import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector }    from "react-redux";
import { searchUsers, clearSearchResults, accessChat } from "../../store/chatSlice";
import Avatar                          from "../ui/Avatar";
import Loader                          from "../ui/Loader";
import { MdSearch } from "react-icons/md";

function SearchUser() {
  const dispatch        = useDispatch();
  const { searchResults, loading } = useSelector((state) => state.chat);
  const [query,   setQuery]   = useState("");
  const [isOpen,  setIsOpen]  = useState(false);
  const debounceRef           = useRef(null);
  const wrapperRef            = useRef(null);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      dispatch(clearSearchResults());
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(searchUsers(query));
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [query, dispatch]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = async (userId) => {
    await dispatch(accessChat(userId));
    setQuery("");
    setIsOpen(false);
    dispatch(clearSearchResults());
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Search Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-yellow-900 transition active:scale-95"
      >
        <MdSearch />
      </button>

      {/* Search Panel */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-30 w-72 bg-white rounded-2xl shadow-2xl border border-yellow-100 overflow-hidden">
          {/* Input */}
          <div className="p-3 border-b border-yellow-100">
            <input
              autoFocus
              type="email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email..."
              className="w-full px-3 py-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
            />
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="py-6 flex justify-center">
                <Loader size="sm" />
              </div>
            ) : searchResults.length === 0 && query ? (
              <div className="py-6 text-center">
                <p className="text-gray-400 text-sm">No users found</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-gray-400 text-sm">
                  Enter an email to search
                </p>
              </div>
            ) : (
              searchResults.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelect(u._id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 cursor-pointer transition border-b border-gray-50 last:border-0"
                >
                  <Avatar src={u.avatar} name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchUser;