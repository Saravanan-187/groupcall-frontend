import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoCall from "./VideoCall"; // Import Video Call Component

const App = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);
  const [showVideoCall, setShowVideoCall] = useState(false); // Toggle Video Call UI

  // Fetch Groups from Backend
  useEffect(() => {
    axios.get("https://groupcall-backend.onrender.com/groups")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("❌ Error Fetching Groups:", err));
  }, []);

  // Handle Create Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || !members) return alert("⚠️ Please fill in all fields!");
    
    try {
      const res = await axios.post("https://groupcall-backend.onrender.com/groups", {
        name: groupName,
        members: members.split(","),
      });
      setGroups([...groups, res.data]); // Update UI
      setGroupName(""); setMembers(""); // Clear Input Fields
    } catch (err) {
      console.error("❌ Error Creating Group:", err);
    }
  };

  // Filter Groups for Search
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white p-6">
      {/* 🌍 Heading */}
      <h1 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        🌍 Groups
      </h1>

      {/* ➕ Create Group Form */}
      <form onSubmit={handleCreateGroup} className="glassmorphism p-6 rounded-lg shadow-lg w-full max-w-md">
        <input
          type="text"
          placeholder="Enter Group Name"
          className="input-box mb-4"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Invite Members (comma separated)"
          className="input-box mb-4"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
        />
        <button type="submit" className="create-group-btn w-full">
          ➕ Create Group
        </button>
      </form>

      {/* 🔍 Search Groups */}
      <input
        type="text"
        placeholder="🔍 Search Groups..."
        className="input-box mt-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* 📋 List of Groups */}
      <div className="mt-6 w-full max-w-md">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <div key={index} className="glassmorphism mt-3 p-4 rounded-lg">
              <h3 className="font-bold text-lg">{group.name}</h3>
              <p className="text-sm text-gray-300">👥 Members: {group.members.join(", ")}</p>
              <button
                className="start-video-btn mt-3"
                onClick={() => setShowVideoCall(true)}
              >
                📹 Start Video Call
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-400 mt-4">❌ No Groups Found</p>
        )}
      </div>

      {/* Video Call UI */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-lg">
            <button className="absolute top-5 right-5 text-white" onClick={() => setShowVideoCall(false)}>❌ Close</button>
            <VideoCall />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
