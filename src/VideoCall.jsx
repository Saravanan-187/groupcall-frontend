import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const VideoCall = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [translatedComment, setTranslatedComment] = useState("");
  const [city, setCity] = useState("New York"); // Default city

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", (id) => setPeerId(id));
    newPeer.on("call", (incomingCall) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        myVideoRef.current.srcObject = stream;
        incomingCall.answer(stream);
        incomingCall.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      });
    });
    setPeer(newPeer);
  }, []);

  const callPeer = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      myVideoRef.current.srcObject = stream;
      const outgoingCall = peer.call(remotePeerId, stream);
      outgoingCall.on("stream", (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
      setCall(outgoingCall);
    });
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      myVideoRef.current.srcObject = stream;
      if (call) {
        call.peerConnection.getSenders().forEach((sender) => {
          if (sender.track.kind === "video") {
            sender.replaceTrack(stream.getVideoTracks()[0]);
          }
        });
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  };

  const startRecording = () => {
    if (myVideoRef.current.srcObject) {
      const stream = myVideoRef.current.srcObject;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => recordedChunks.current.push(event.data);
      mediaRecorderRef.current.start();
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    const blob = new Blob(recordedChunks.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();
  };

  const handleCommentSubmit = () => {
    const commentRegex = /^[a-zA-Z0-9 ]+$/;

    if (newComment) {
      if (commentRegex.test(newComment)) {
        setComments([
          ...comments,
          { text: newComment, city: city, likes: 0, dislikes: 0 },
        ]);
        setNewComment(""); 
      } else {
        alert("Comment can only contain alphabets and numbers.");
      }
    }
  };

  
  const handleLike = (index) => {
    const updatedComments = [...comments];
    updatedComments[index].likes += 1;
    setComments(updatedComments);
  };

  const handleDislike = (index) => {
    const updatedComments = [...comments];
    updatedComments[index].dislikes += 1;

    if (updatedComments[index].dislikes >= 2) {
      updatedComments.splice(index, 1);
    }

    setComments(updatedComments);
  };

  const handleTranslate = (text) => {
    setTranslatedComment(`${text} (translated)`);
  };

  return (
    <div className="p-4 text-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Group Video Call 📹</h1>
      <div className="flex gap-4 justify-center">
        <video ref={myVideoRef} autoPlay playsInline className="w-1/3 border border-gray-500 rounded-md"></video>
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/3 border border-gray-500 rounded-md"></video>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <p>Your ID: {peerId}</p>
        <input
          className="p-2 bg-gray-700 rounded mt-2"
          type="text"
          placeholder="Enter Peer ID to Call"
          onChange={(e) => setRemotePeerId(e.target.value)}
        />
        <button className="mt-2 px-4 py-2 bg-green-500 rounded hover:bg-green-600" onClick={callPeer}>
          Call 📞
        </button>
        <button className="mt-2 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600" onClick={startScreenShare}>
          Share Screen 🎦
        </button>
        <button className="mt-2 px-4 py-2 bg-red-500 rounded hover:bg-red-600" onClick={startRecording}>
          Start Recording 🔴
        </button>
        <button className="mt-2 px-4 py-2 bg-gray-500 rounded hover:bg-gray-600" onClick={stopRecording}>
          Stop & Download ⬇️
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />

        <button
          className="mt-2 px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
          onClick={handleCommentSubmit}
        >
          Submit Comment
        </button>

        {/* Display Comments */}
        <div className="mt-4">
          {comments.map((comment, index) => (
            <div key={index} className="border-b border-gray-500 py-2">
              <p className="font-semibold">{comment.text}</p>
              <p className="text-sm text-gray-400">Posted from: {comment.city}</p>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                  onClick={() => handleLike(index)}
                >
                  👍 Like
                </button>
                <button
                  className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
                  onClick={() => handleDislike(index)}
                >
                  👎 Dislike
                </button>
                <button
                  className="px-4 py-2 bg-yellow-500 rounded hover:bg-yellow-600"
                  onClick={() => handleTranslate(comment.text)}
                >
                  🌐 Translate
                </button>
              </div>
              {translatedComment && <p className="mt-2 text-gray-300">Translated: {translatedComment}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* City Selection under comments */}
      <div className="mt-6">
        <label htmlFor="city" className="text-lg">Select Your City</label>
        <select
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-2 p-2 bg-gray-700 text-white rounded"
        >
          <option value="New York">New York</option>
          <option value="Los Angeles">Los Angeles</option>
          <option value="Chicago">Chicago</option>
          <option value="San Francisco">San Francisco</option>
          <option value="Miami">Miami</option>
        </select>
      </div>
    </div>
  );
};

export default VideoCall;
