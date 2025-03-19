import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { formatDistanceToNow } from "date-fns";
import { getUserLoginData } from "../../../helpers/decodeJwt";
import { get } from "jquery";
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const Index = () => {
  const userID = getUserLoginData().userID;
  // State variables
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalunreadCount, setTotalunreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  // Connect to SignalR hub
  useEffect(() => {
    console.log("Selected user:", selectedUser);
    const currentUserId = getUserLoginData().userID;
    let hubConnection;

    const createHubConnection = async () => {
      // Tạo một connection mới mỗi khi selectedUser thay đổi
      hubConnection = new HubConnectionBuilder()
        .withUrl(`${BACKEND_API_URL}/chatHub`)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();

      try {
        await hubConnection.start();
        console.log("SignalR Connected!");

        // Connect user to hub
        await hubConnection.invoke("RegisterUser", currentUserId);

        // Set up handlers for SignalR events
        hubConnection.on("ReceiveMessage", (message) => {
          // Sử dụng hàm callback để luôn nhận được giá trị mới nhất của selectedUser
          setMessages((prev) => {
            // Đảm bảo kiểm tra với giá trị selectedUser mới nhất
            if (
              selectedUser &&
              ((message.senderId === selectedUser.userId &&
                message.receiverId === userID) ||
                (message.receiverId === selectedUser.userId &&
                  message.senderId === userID))
            ) {
              console.log("Received message:", message);
              console.log("Selected user:", selectedUser);

              // Mark as read if the message is from the currently selected user
              if (message.senderId === selectedUser.userId) {
                markMessagesAsRead(selectedUser.userId);
              }

              return [...prev, message];
            }
            return prev;
          });
        });
        hubConnection.on("UpdateunreadCount", (count) => {
          setTotalunreadCount(count);
        });

        hubConnection.on("UpdateConversations", (updatedConversations) => {
          setConversations(updatedConversations);
          setLoading(false);
        });
        // Các event handler khác...

        setConnection(hubConnection);
      } catch (err) {
        console.error("Error establishing SignalR connection:", err);
      }
    };

    createHubConnection();

    // Cleanup function
    return () => {
      if (hubConnection) {
        // Hủy đăng ký tất cả các event handler
        //hubConnection.off("ReceiveMessage");
        // Đóng kết nối
        hubConnection.stop();
      }
    };
  }, [selectedUser, userID]); // Đảm bảo thêm userID vào dependencies
  // Fetch conversations
  const fetchConversations = async () => {
    const currentUserId = getUserLoginData().userID;
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Messages/conversations/${currentUserId}`
      );
      setConversations(response.data);
      console.log("Conversations:", response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setLoading(false);
    }
  };

  // Fetch unread message count
  const fetchunreadCount = async () => {
    const currentUserId = getUserLoginData().userID;
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Messages/unread/${currentUserId}`
      );
      setTotalunreadCount(response.data.count);
      console.log("Unread count:", response.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  // Fetch messages between users
  const fetchMessages = async (userId) => {
    const currentUserId = getUserLoginData().userID;
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Messages/${currentUserId}/${userId}?pageNumber=1&pageSize=50`
      );
      setMessages(response.data);
      console.log("Messages:", response.data);
      // Mark messages as read when conversation is opened
      markMessagesAsRead(userId);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (senderId) => {
    const currentUserId = getUserLoginData().userID;
    try {
      await axios.put(
        `${BACKEND_API_URL}/api/Messages/read/${senderId}/${currentUserId}`
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Send a message
  const sendMessage = async () => {
    const currentUserId = getUserLoginData().userID;
    if (!selectedUser || !newMessage.trim()) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: selectedUser.userId,
      content: newMessage.trim(),
    };

    try {
      // Send message via API
      await axios.post(`${BACKEND_API_URL}/api/Messages`, messageData);

      // Clear input
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Select a user to chat with
  const selectUser = (conversation) => {
    const user = {
      userId: conversation.userId,
      fullName: conversation.fullName,
      avatar: conversation.avatar,
      unreadMessageCount: conversation.unreadCount,
    };

    setSelectedUser(user);

    fetchMessages(user.userId);
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) =>
    conversation.fullName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchConversations();
    fetchunreadCount();
  }, []);

  // Format time for display
  const formatMessageTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: false });
  };

  return (
    <>
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Messages</h3>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Chat Widget */}
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
                            <p className="text-center">
                              Loading conversations...
                            </p>
                          ) : (
                            <ul className="contacts">
                              {filteredConversations.map((conversation) => (
                                <li
                                  key={conversation.userId}
                                  className={
                                    selectedUser?.userId === conversation.userId
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() => selectUser(conversation)}
                                >
                                  <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <div className="d-flex bd-highlight">
                                      <div className="img_cont">
                                        <img
                                          src={
                                            conversation.avatar ||
                                            "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                                          }
                                          className="rounded-circle user_img"
                                          alt={conversation.fullName}
                                        />
                                      </div>
                                      <div className="user_info">
                                        <span>{conversation.fullName}</span>
                                        <p>
                                          {conversation.lastMessage
                                            ? conversation.lastMessage.substr(
                                                0,
                                                20
                                              ) +
                                              (conversation.lastMessage.length >
                                              20
                                                ? "..."
                                                : "")
                                            : ""}
                                        </p>
                                      </div>
                                      <span className="info">
                                        {conversation.lastMessageTime && (
                                          <small>
                                            {formatDistanceToNow(
                                              new Date(
                                                conversation.lastMessageTime
                                              )
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
                                    "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                                  }
                                  alt=""
                                  className="rounded-circle user_img"
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
                                  msg.senderId === userID
                                    ? "justify-content-end mb-2 reply"
                                    : "justify-content-start mb-2"
                                }`}
                              >
                                <div className="img_cont_msg">
                                  <img
                                    src={
                                      msg.senderId === userID
                                        ? getUserLoginData().avatar ||
                                          "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                                        : selectedUser.avatar ||
                                          "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"
                                    }
                                    alt=""
                                    className="rounded-circle user_img_msg"
                                  />
                                  <div className="name">
                                    {msg.senderId === userID
                                      ? "You"
                                      : selectedUser.fullName}{" "}
                                    <span className="msg_time">
                                      {formatMessageTime(msg.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className="msg_cotainer">
                                  {msg.content}
                                </div>
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
                                  e.key === "Enter" &&
                                  !e.shiftKey &&
                                  sendMessage()
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
        </div>
      </section>
    </>
  );
};

export default Index;
