import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { formatDistanceToNow, format } from "date-fns";
import { getUserLoginData } from "../../../helpers/decodeJwt";
import {
  Search,
  Send,
  MessageCircle,
  ChevronLeft,
  User,
  Check,
  CheckCheck,
} from "lucide-react";
import "./messages.css"; // Sẽ tạo file CSS mới

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const Index = () => {
  // Lấy thông tin người dùng
  const userData = getUserLoginData();
  const userID = userData?.userID;
  const userAvatar = userData?.avatar;
  const userName = userData?.fullName || userData?.username;

  // State variables
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const selectedUserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Kết nối với SignalR hub
  useEffect(() => {
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

        // Đăng ký người dùng với hub
        await hubConnection.invoke("RegisterUser", userID);

        // Thiết lập các handler cho sự kiện SignalR
        hubConnection.on("ReceiveMessage", (message) => {
          // Sử dụng ref để truy cập giá trị selectedUser hiện tại
          const currentSelectedUser = selectedUserRef.current;

          if (
            currentSelectedUser &&
            ((message.senderId === currentSelectedUser.userId &&
              message.receiverId === userID) ||
              (message.receiverId === currentSelectedUser.userId &&
                message.senderId === userID))
          ) {
            console.log("Received message:", message);
            setMessages((prev) => [...prev, message]);

            // Đánh dấu là đã đọc nếu tin nhắn từ người dùng hiện tại được chọn
            if (message.senderId === currentSelectedUser.userId) {
              markMessagesAsRead(currentSelectedUser.userId);
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

        hubConnection.on("UserOnline", (userId) => {
          setOnlineUsers((prev) => new Set(prev).add(userId));
        });

        hubConnection.on("UserOffline", (userId) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });

        setConnection(hubConnection);
      } catch (err) {
        console.error("Error establishing SignalR connection:", err);
      }
    };

    createHubConnection();

    // Cleanup function
    return () => {
      if (hubConnection) {
        hubConnection.stop();
        console.log("SignalR Disconnected");
      }
    };
  }, [userID]);

  // Cập nhật ref khi selectedUser thay đổi
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Lấy dữ liệu ban đầu khi component mount
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, []);

  // Lấy danh sách cuộc trò chuyện
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

  // Lấy số lượng tin nhắn chưa đọc
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

  // Lấy tin nhắn giữa các người dùng
  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/api/Messages/${userID}/${userId}?pageNumber=1&pageSize=50`
      );
      // Sắp xếp tin nhắn theo thời gian tăng dần (tin cũ lên trước)
      const sortedMessages = response.data.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      setMessages(sortedMessages);
      // Đánh dấu tin nhắn là đã đọc khi mở cuộc trò chuyện
      markMessagesAsRead(userId);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Đánh dấu tin nhắn là đã đọc
  const markMessagesAsRead = async (senderId) => {
    try {
      await axios.put(
        `${BACKEND_API_URL}/api/Messages/read/${senderId}/${userID}`
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Gửi tin nhắn
  const sendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    const messageData = {
      senderId: userID,
      receiverId: selectedUser.userId,
      content: newMessage.trim(),
    };

    try {
      // Gửi tin nhắn qua API
      await axios.post(`${BACKEND_API_URL}/api/Messages`, messageData);
      // Xóa input
      setNewMessage("");
      // Focus lại vào input
      messageInputRef.current?.focus();
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage("");
    }
  };

  // Chọn người dùng để trò chuyện
  const selectUser = (conversation) => {
    const user = {
      userId: conversation.userId || conversation.otherUserId,
      fullName: conversation.fullName || conversation.otherUserName,
      avatar: conversation.avatar || conversation.otherUserAvatar,
      unreadMessageCount: conversation.unreadCount,
    };
    setSelectedUser(user);
    fetchMessages(user.userId);
    setShowMobileConversation(true); // Chuyển sang chế độ hiển thị hội thoại trên mobile
  };

  // Trở lại danh sách trò chuyện (cho giao diện mobile)
  const goBackToConversations = () => {
    setShowMobileConversation(false);
  };

  // Lọc cuộc trò chuyện dựa trên từ khóa tìm kiếm
  const filteredConversations = conversations.filter((conversation) =>
    (conversation.fullName || conversation.otherUserName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Cuộn đến tin nhắn cuối cùng khi tin nhắn thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format thời gian cho tin nhắn
  const formatMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Nếu là hôm nay, chỉ hiển thị giờ
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, "HH:mm");
    }
    // Nếu là hôm qua, hiển thị "Yesterday, HH:mm"
    else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(messageDate, "HH:mm")}`;
    }
    // Nếu trong tuần này (7 ngày gần đây)
    else if (
      today.getTime() - messageDate.getTime() <
      7 * 24 * 60 * 60 * 1000
    ) {
      return format(messageDate, "EEEE, HH:mm");
    }
    // Nếu xa hơn, hiển thị ngày tháng năm
    else {
      return format(messageDate, "dd/MM/yyyy, HH:mm");
    }
  };

  // Format thời gian cho danh sách hội thoại
  const formatConversationTime = (dateString) => {
    if (!dateString) return "";

    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, "HH:mm");
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (
      today.getTime() - messageDate.getTime() <
      7 * 24 * 60 * 60 * 1000
    ) {
      return format(messageDate, "EEE");
    } else {
      return format(messageDate, "dd/MM/yyyy");
    }
  };

  // Xử lý phím tắt (Enter để gửi tin nhắn)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="user-dashboard">
      <div className="dashboard-outer">
        <div className="upper-title-box">
          <h3>Messages</h3>
          {totalUnreadCount > 0 && (
            <div className="ws-badge">{totalUnreadCount}</div>
          )}
          <div className="text">Manage your conversations</div>
        </div>

        <div className="ws-messages-container">
          {/* Conversations list - hidden on mobile when a conversation is selected */}
          <div
            className={`ws-conversations ${
              showMobileConversation ? "ws-mobile-hidden" : ""
            }`}
          >
            {/* Search */}
            <div className="ws-search">
              <div className="ws-search-wrapper">
                <Search size={16} className="ws-search-icon" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="ws-conversation-list">
              {loading ? (
                <div className="ws-loading">
                  <div className="ws-loading-spinner"></div>
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="ws-empty-state">
                  <MessageCircle size={40} />
                  <p>No conversations found</p>
                  {searchTerm && (
                    <p className="ws-empty-hint">Try a different search term</p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={
                      conversation.userId ||
                      conversation.otherUserId ||
                      Math.random()
                    }
                    className={`ws-conversation-item ${
                      selectedUser?.userId ===
                      (conversation.userId || conversation.otherUserId)
                        ? "ws-active"
                        : ""
                    }`}
                    onClick={() => selectUser(conversation)}
                  >
                    <div className="ws-conversation-avatar">
                      <img
                        src={
                          conversation.avatar ||
                          conversation.otherUserAvatar ||
                          "https://via.placeholder.com/40"
                        }
                        alt={
                          conversation.fullName || conversation.otherUserName
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                    </div>
                    <div className="ws-conversation-content">
                      <div className="ws-conversation-top">
                        <h4>
                          {conversation.fullName || conversation.otherUserName}
                          <span
                            className={`ws-user-status-dot ${
                              onlineUsers.has(
                                conversation.userId || conversation.otherUserId
                              )
                                ? "active"
                                : "offline"
                            }`}
                          ></span>
                        </h4>
                        <span className="ws-conversation-time">
                          {formatConversationTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <div className="ws-conversation-bottom">
                        <p className="ws-conversation-last-msg">
                          {conversation.lastMessage
                            ? conversation.lastMessage.length > 35
                              ? conversation.lastMessage.substring(0, 35) +
                                "..."
                              : conversation.lastMessage
                            : "No messages yet"}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ws-unread-badge">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message area - hidden on mobile when no conversation is selected */}
          <div
            className={`ws-messages ${
              !showMobileConversation ? "ws-mobile-hidden" : ""
            }`}
          >
            {selectedUser ? (
              <>
                {/* Header for mobile view */}
                <div className="ws-messages-header">
                  {showMobileConversation && (
                    <button
                      className="ws-back-btn"
                      onClick={goBackToConversations}
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="ws-user-info">
                    <div className="ws-avatar">
                      <img
                        src={
                          selectedUser.avatar ||
                          "https://via.placeholder.com/40"
                        }
                        alt={selectedUser.fullName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/40";
                        }}
                      />
                    </div>
                    <div className="ws-user-name">
                      <h4>{selectedUser.fullName}</h4>
                      <span
                        className={`ws-user-status ${
                          onlineUsers.has(selectedUser.userId)
                            ? "active"
                            : "offline"
                        }`}
                      >
                        {onlineUsers.has(selectedUser.userId)
                          ? "Active now"
                          : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message list */}
                <div className="ws-message-list">
                  {messages.length === 0 ? (
                    <div className="ws-empty-messages">
                      <div className="ws-empty-message-icon">
                        <MessageCircle size={40} />
                      </div>
                      <p>No messages yet</p>
                      <p className="ws-empty-message-hint">
                        Send a message to start the conversation
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isSender =
                        msg.senderId === userID || msg.senderID === userID;
                      const previousMsg =
                        index > 0 ? messages[index - 1] : null;
                      const showAvatar =
                        !isSender &&
                        (!previousMsg ||
                          previousMsg.senderId !== msg.senderId ||
                          new Date(msg.createdAt) -
                            new Date(previousMsg.createdAt) >
                            5 * 60 * 1000);

                      // Kiểm tra xem có nên hiển thị ngày không
                      const showDate =
                        index === 0 ||
                        (previousMsg &&
                          new Date(msg.createdAt).toDateString() !==
                            new Date(previousMsg.createdAt).toDateString());

                      return (
                        <React.Fragment key={msg.personalMessageID || index}>
                          {showDate && (
                            <div className="ws-date-divider">
                              <span>
                                {format(
                                  new Date(msg.createdAt),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </span>
                            </div>
                          )}
                          <div
                            className={`ws-message ${
                              isSender
                                ? "ws-message-sent"
                                : "ws-message-received"
                            }`}
                          >
                            {!isSender && (
                              <div className="ws-message-avatar">
                                {showAvatar ? (
                                  <img
                                    src={
                                      selectedUser.avatar ||
                                      "https://via.placeholder.com/30"
                                    }
                                    alt={selectedUser.fullName}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://via.placeholder.com/30";
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{ width: "100%", height: "100%" }}
                                  ></div> // placeholder
                                )}
                              </div>
                            )}

                            <div className="ws-message-content-wrapper">
                              <div className="ws-message-content">
                                <p>{msg.content}</p>
                              </div>
                              {/* Thời gian được tách ra khỏi bubble chat */}
                              <div className="ws-message-time">
                                {formatMessageTime(msg.createdAt)}
                                {isSender && (
                                  <span className="ws-message-status">
                                    {msg.isRead ? (
                                      <CheckCheck size={12} />
                                    ) : (
                                      <Check size={12} />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="ws-input">
                  <div className="ws-input-wrapper">
                    <textarea
                      ref={messageInputRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      rows={1}
                    ></textarea>
                    <button
                      className="ws-send-btn"
                      disabled={!newMessage.trim()}
                      onClick={sendMessage}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="ws-no-selection">
                <div className="ws-no-selection-icon">
                  <MessageCircle size={48} />
                </div>
                <h3>Your Messages</h3>
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Index;
