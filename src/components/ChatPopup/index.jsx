import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { formatDistanceToNow } from "date-fns";
import { getUserLoginData } from "../../helpers/decodeJwt";
import "./style.css";
import notificationSound from "../../assets/sounds/messageSound.mp3";
const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "https://localhost:5001";

const ChatPopup = ({ isOpen, onClose }) => {
  // User state
  const userID = getUserLoginData()?.userID || 1; // Fallback to 1 for demo

  // State variables
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const selectedUserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatPopupRef = useRef(null);
  const audioRef = useRef(new Audio(notificationSound));
  const messageContainerRef = useRef(null);
  const originalTitle = useRef(document.title);
  // Prevent click propagation for the popup container
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };
  // Check if tab is active/visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabActive(false);
      } else {
        setIsTabActive(true);
        // Reset title and message count when tab becomes active
        document.title = originalTitle.current;
        setNewMessageCount(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Connect to SignalR hub
  useEffect(() => {
    if (!isOpen) return;

    console.log("Connecting to SignalR...");
    selectedUserRef.current = selectedUser;
    let hubConnection;

    const createHubConnection = async () => {
      hubConnection = new HubConnectionBuilder()
        .withUrl(`${BACKEND_API_URL}/chatHub`)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      try {
        await hubConnection.start();
        console.log("SignalR Connected!");

        // Connect user to hub
        await hubConnection.invoke("RegisterUser", userID);

        // Set up handlers for SignalR events
        hubConnection.on("ReceiveMessage", (message) => {
          // Use ref to access current selectedUser value
          const currentSelectedUser = selectedUserRef.current;

          // Check if message is relevant to current conversation
          const isRelevantMessage =
            currentSelectedUser &&
            ((message.senderId === currentSelectedUser.userId &&
              message.receiverId === userID) ||
              (message.receiverId === currentSelectedUser.userId &&
                message.senderId === userID));

          // If it's a relevant message
          if (isRelevantMessage) {
            console.log("Received message:", message);

            // Add message to conversation
            setMessages((prev) => [...prev, message]);

            // Mark as read if from selected user
            if (message.senderId === currentSelectedUser.userId) {
              markMessagesAsRead(currentSelectedUser.userId);

              // Play notification sound only if message is from someone else
              if (!isTabActive || !isOpen) {
                audioRef.current
                  .play()
                  .catch((err) => console.log("Audio play error:", err));

                // Update tab title when receiving messages and tab is not active
                if (!isTabActive) {
                  setNewMessageCount((prevCount) => {
                    const newCount = prevCount + 1;
                    document.title = `(${newCount}) New Message - ${originalTitle.current}`;
                    return newCount;
                  });
                }
              }
            }

            // Scroll to bottom with messages update
          } else {
            // If the message is not for the current conversation but is for the current user
            if (message.receiverId === userID) {
              // Play notification sound
              audioRef.current
                .play()
                .catch((err) => console.log("Audio play error:", err));

              // Update tab title when receiving messages and tab is not active
              if (!isTabActive) {
                setNewMessageCount((prevCount) => {
                  const newCount = prevCount + 1;
                  document.title = `(${newCount}) New Message - ${originalTitle.current}`;
                  return newCount;
                });
              }
            }
          }
        });

        hubConnection.on("UpdateUnreadCount", (count) => {
          setTotalUnreadCount(count);
        });

        hubConnection.on("UpdateConversations", (updatedConversations) => {
          setConversations(updatedConversations);
          setLoading(false);
        });

        setConnection(hubConnection);
      } catch (err) {
        console.error("Error establishing SignalR connection:", err);
      }
    };

    createHubConnection();

    // Reset title when popup opens
    document.title = originalTitle.current;
    setNewMessageCount(0);

    // Cleanup function
    return () => {
      if (hubConnection) {
        hubConnection.stop();
        console.log("SignalR Disconnected");
      }
    };
  }, [isOpen, selectedUser, userID, isTabActive]);

  // Update ref whenever selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Fetch initial data when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Messages/conversations/${userID}`
      );
      setConversations(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setLoading(false);
    }
  };

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Messages/unread/${userID}`
      );
      setTotalUnreadCount(response.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Fetch messages between users
  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Messages/${userID}/${userId}?pageNumber=1&pageSize=50`
      );
      setMessages(response.data);
      // Mark messages as read when conversation is opened
      markMessagesAsRead(userId);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (senderId) => {
    try {
      await axios.put(
        `${BACKEND_API_URL}/api/Messages/read/${senderId}/${userID}`
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    const messageData = {
      senderId: userID,
      receiverId: selectedUser.userId,
      content: newMessage.trim(),
    };

    try {
      // Send message via API
      await axios.post(`${BACKEND_API_URL}/api/Messages`, messageData);

      // Add message locally for immediate display
      const newMsg = {
        personalMessageID: Date.now(), // Temporary ID
        senderId: userID,
        receiverId: selectedUser.userId,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prev) => [...prev, newMsg]);

      // Clear input
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      // Still show message locally for demo
      const newMsg = {
        personalMessageID: Date.now(), // Temporary ID
        senderId: userID,
        receiverId: selectedUser.userId,
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
    }
  };

  // Select a user to chat with
  const selectUser = (conversation) => {
    const user = {
      userId: conversation.userId || conversation.otherUserId,
      fullName: conversation.fullName || conversation.otherUserName,
      avatar: conversation.avatar || conversation.otherUserAvatar,
      unreadMessageCount: conversation.unreadCount,
    };
    console.log("Selected user:", user);
    setSelectedUser(user);
    fetchMessages(user.userId);
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) =>
    (conversation.fullName || conversation.otherUserName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format time for display
  const formatMessageTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: false });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-popup-overlay" onClick={onClose}>
      <div
        className="chat-popup-container"
        ref={chatPopupRef}
        onClick={handlePopupClick}
      >
        <div className="chat-popup-header">
          <h3>
            Messages{" "}
            {totalUnreadCount > 0 && (
              <span className="badge badge-danger">{totalUnreadCount}</span>
            )}
          </h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="chat-widget">
          <div className="widget-content">
            <div className="row">
              <div
                className="contacts_column col-xl-4 col-lg-5 col-md-12 col-sm-12 chat"
                id="chat_contacts"
              >
                <div className="card contacts_card">
                  <div className="card-header">
                    <div className="search-box-one">
                      <div className="form-group">
                        <span className="icon flaticon-search-1"></span>
                        <input
                          type="search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search"
                          required=""
                        />
                      </div>
                    </div>
                  </div>
                  <div className="card-body contacts_body">
                    {loading ? (
                      <p className="text-center">Loading conversations...</p>
                    ) : (
                      <ul className="contacts">
                        {filteredConversations.map((conversation) => (
                          <li
                            key={
                              conversation.userId ||
                              conversation.otherUserId ||
                              Math.random()
                            }
                            className={
                              selectedUser?.userId ===
                              (conversation.userId || conversation.otherUserId)
                                ? "active"
                                : ""
                            }
                            onClick={() => selectUser(conversation)}
                          >
                            <a href="#" onClick={(e) => e.preventDefault()}>
                              <div className="d-flex bd-highlight">
                                <div className="img_cont">
                                  <img
                                    src={
                                      conversation.avatar ||
                                      conversation.otherUserAvatar ||
                                      "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                                    }
                                    className="rounded-circle user_img"
                                    alt={
                                      conversation.fullName ||
                                      conversation.otherUserName
                                    }
                                  />
                                </div>
                                <div className="user_info">
                                  <span>
                                    {conversation.fullName ||
                                      conversation.otherUserName}
                                  </span>
                                  <p>
                                    {conversation.lastMessage
                                      ? conversation.lastMessage.substr(0, 20) +
                                        (conversation.lastMessage.length > 20
                                          ? "..."
                                          : "")
                                      : ""}
                                  </p>
                                </div>
                                <span className="info">
                                  {conversation.lastMessageTime && (
                                    <small>
                                      {formatDistanceToNow(
                                        new Date(conversation.lastMessageTime)
                                      )}
                                    </small>
                                  )}
                                  {conversation.unreadCount > 0 && (
                                    <span className="count">
                                      {conversation.unreadCount}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-xl-8 col-lg-7 col-md-12 col-sm-12 chat">
                {selectedUser ? (
                  <div className="card message-card">
                    <div className="card-header msg_head">
                      <div className="d-flex bd-highlight">
                        <div className="img_cont">
                          <img
                            src={
                              selectedUser.avatar ||
                              "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                            }
                            alt=""
                            className="rounded-circle user_img"
                            onError={(e) => {
                              console.log(
                                "Image failed to load:",
                                e.target.src
                              );
                              e.target.onerror = null;
                              e.target.src =
                                "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";
                            }}
                          />
                        </div>
                        <div className="user_info">
                          <span>{selectedUser.fullName}</span>
                          <p>Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="card-body msg_card_body">
                      {messages.map((msg, index) => (
                        <div
                          key={msg.personalMessageID || index}
                          className={`d-flex ${
                            msg.senderId === userID || msg.senderID === userID
                              ? "justify-content-end mb-2 reply"
                              : "justify-content-start mb-2"
                          }`}
                        >
                          <div className="img_cont_msg">
                            <img
                              src={
                                msg.senderId === userID ||
                                msg.senderID === userID
                                  ? msg.senderAvatar
                                  : selectedUser.avatar ||
                                    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                              }
                              alt=""
                              className="rounded-circle user_img_msg"
                            />
                            <div className="name">
                              {msg.senderId === userID ||
                              msg.senderID === userID
                                ? "You"
                                : selectedUser.fullName}{" "}
                              <span className="msg_time">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="msg_cotainer">{msg.content}</div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="card-footer">
                      <div className="form-group mb-0">
                        <textarea
                          className="form-control type_msg"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && !e.shiftKey && sendMessage()
                          }
                        ></textarea>
                        <button
                          type="button"
                          className="theme-btn btn-style-one submit-btn"
                          onClick={sendMessage}
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card message-card">
                    <div className="card-body msg_card_body">
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <h3>Select a conversation to start messaging</h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
