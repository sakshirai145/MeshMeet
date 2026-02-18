import React, { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = "http://localhost:8000";
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const connections = useRef({});

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(true);

  // ------------------ PERMISSIONS ------------------

  const getPermissions = useCallback(async () => {
    try {
      const videoPerm = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPerm);

      const audioPerm = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPerm);

      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getPermissions();
  }, [getPermissions]);

  // ------------------ USER MEDIA ------------------

  const getUserMedia = useCallback(async () => {
    try {
      if ((video && videoAvailable) || (audio && audioAvailable)) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video,
          audio,
        });

        window.localStream = stream;
        if (localVideoref.current) {
          localVideoref.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [video, audio, videoAvailable, audioAvailable]);

  useEffect(() => {
    getUserMedia();
  }, [getUserMedia]);

  // ------------------ SCREEN SHARE ------------------

  const getDisplayMedia = useCallback(async () => {
    try {
      if (screen && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        window.localStream = stream;
        if (localVideoref.current) {
          localVideoref.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [screen]);

  useEffect(() => {
    getDisplayMedia();
  }, [getDisplayMedia]);

  // ------------------ SOCKET ------------------

  const connectToSocketServer = useCallback(() => {
  socketRef.current = io(server_url);

  socketRef.current.on("connect", () => {
    socketIdRef.current = socketRef.current.id;
    socketRef.current.emit("join-call", window.location.href);
  });

  socketRef.current.on("user-joined", (socketId) => {
    const peer = new RTCPeerConnection(peerConfigConnections);

    connections.current[socketId] = peer;

    // Add local stream tracks
    window.localStream?.getTracks().forEach((track) => {
      peer.addTrack(track, window.localStream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("signal", socketId, {
          ice: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      setVideos((prev) => [
        ...prev,
        { socketId, stream: event.streams[0] },
      ]);
    };

    peer.createOffer().then((offer) => {
      peer.setLocalDescription(offer);
      socketRef.current.emit("signal", socketId, {
        sdp: offer,
      });
    });
  });

  socketRef.current.on("signal", async (fromId, message) => {
    const peer =
      connections.current[fromId] ||
      new RTCPeerConnection(peerConfigConnections);

    connections.current[fromId] = peer;

    if (message.sdp) {
      await peer.setRemoteDescription(
        new RTCSessionDescription(message.sdp)
      );

      if (message.sdp.type === "offer") {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socketRef.current.emit("signal", fromId, {
          sdp: answer,
        });
      }
    }

    if (message.ice) {
      await peer.addIceCandidate(
        new RTCIceCandidate(message.ice)
      );
    }
  });
}, []);
  // ------------------ CONTROLS ------------------

  const handleVideo = () => setVideo((prev) => !prev);
  const handleAudio = () => setAudio((prev) => !prev);
  const handleScreen = () => setScreen((prev) => !prev);

  const handleEndCall = () => {
    try {
      localVideoref.current?.srcObject?.getTracks()?.forEach((track) => track.stop());
    } catch {}
    window.location.href = "/";
  };

  const sendMessage = () => {
    if (message.trim() === "") return;
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const connect = () => {
    if (!username.trim()) return;
    setAskForUsername(false);
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  // ------------------ UI ------------------

  return (
    <div>
      {askForUsername ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <video ref={localVideoref} autoPlay muted />
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length === 0 ? (
                    <p>No Messages Yet</p>
                  ) : (
                    messages.map((item, index) => (
                      <div key={index}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    label="Enter chat"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable && (
              <IconButton onClick={handleScreen}>
                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
            )}

            <Badge badgeContent={newMessages} color="error">
              <IconButton onClick={() => setShowModal(!showModal)}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          />

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <video
                key={video.socketId}
                ref={(ref) => {
                  if (ref && video.stream) {
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
