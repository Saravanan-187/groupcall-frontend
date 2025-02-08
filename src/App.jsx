import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState([]);

  // Fetch Groups from Backend
  useEffect(() => {
    axios.get("https://backend-i4ya.onrender.com/groups")
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("❌ Error Fetching Groups:", err));
  }, []);

  // Handle Create Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || !members) return alert("⚠️ Please fill in all fields!");
    
    try {
      const res = await axios.post("https://backend-i4ya.onrender.com/groups", {
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
    <div className="glassmorphism">
      {/* 🌍 Heading */}
      <h1 className="heading">
        🌍 Groups
      </h1>

      {/* ➕ Create Group Form */}
      <form onSubmit={handleCreateGroup} className="mt-6">
        <input
          type="text"
          placeholder="Enter Group Name"
          className="input-box mb-3"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Invite Members (comma separated)"
          className="input-box mb-3"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
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
      <div className="mt-5">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <div key={index} className="glassmorphism mt-3 p-3">
              <h3 className="font-bold text-lg">{group.name}</h3>
              <p className="text-sm text-gray-300">👥 Members: {group.members.join(", ")}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 mt-4">❌ No Groups Found</p>
        )}
      </div>
    </div>
  );
};

export default App;
