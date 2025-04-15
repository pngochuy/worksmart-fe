import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState, useRef } from "react";
import { getUserLoginData, getUserRoleFromToken } from "../helpers/decodeJwt";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationDropdown from "./NotificationDropdown";
import ChatPopup from "./ChatPopup";
import axios from "axios";
import notificationSound from "../assets/sounds/messageSound.mp3";
import { Crown, LayoutDashboard } from "lucide-react";
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const Header = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDataLogin, setUserDataLogin] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // Reference to store SignalR connection
  const signalRConnection = useRef(null);
  const audioRef = useRef(new Audio(notificationSound));
  const originalTitle = useRef(document.title);

  // Track tab visibility
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

  // Load user data on component mount
  useEffect(() => {
    const role = getUserRoleFromToken();
    setUserRole(role);
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);

  // Setup active dropdown based on current location
  useEffect(() => {
    const dropdowns = document.querySelectorAll(".nav .dropdown");

    dropdowns.forEach((dropdown) => {
      const links = dropdown.querySelectorAll("a");
      const isActive = Array.from(links).some(
        (link) => link.getAttribute("href") === location.pathname
      );

      if (isActive) {
        setActiveDropdown(dropdown);
      }
    });
  }, [location.pathname]);

  // Initial fetch for unread count and SignalR connection setup
  useEffect(() => {
    const user = getUserLoginData();
    if (!user || !user.userID) return; // Don't proceed if no user is logged in

    const currentUserId = user.userID;

    // Initial fetch for unread count
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_API_URL}/api/Messages/unread/${currentUserId}`
        );
        setUnreadCount(response.data.count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnreadCount();

    // Setup SignalR connection
    const createHubConnection = async () => {
      const hubConnection = new HubConnectionBuilder()
        .withUrl(`${BACKEND_API_URL}/chatHub`)
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Implement exponential backoff for reconnection attempts
            if (retryContext.previousRetryCount < 10) {
              // First 10 retries happen more quickly
              return Math.min(
                1000 * Math.pow(2, retryContext.previousRetryCount),
                30000
              );
            } else {
              // After that, we try every 30 seconds
              return 30000;
            }
          },
        })
        .build();

      try {
        await hubConnection.start();
        console.log("Header SignalR Connected!");

        // Register user to receive updates
        await hubConnection.invoke("RegisterUser", currentUserId);

        // Listen for unread count updates
        hubConnection.on("UpdateUnreadCount", (count) => {
          console.log("Received unread count update:", count);
          setUnreadCount(count);
        });

        // Listen for new message notifications
        hubConnection.on("ReceiveMessage", (message) => {
          // If message is for current user
          if (message.receiverId === currentUserId) {
            // Play notification sound (but not if the chat is already open)
            if (!isChatOpen) {
              audioRef.current
                .play()
                .catch((err) => console.log("Audio play error:", err));
            }

            // Update tab title if tab is not active
            if (!isTabActive) {
              setNewMessageCount((prevCount) => {
                const newCount = prevCount + 1;
                document.title = `(${newCount}) New Message - ${originalTitle.current}`;
                return newCount;
              });
            }
          }
        });

        // Store connection in ref for later cleanup
        signalRConnection.current = hubConnection;
      } catch (err) {
        console.error("Error establishing SignalR connection in Header:", err);
      }
    };

    createHubConnection();

    // Cleanup function to stop SignalR connection when component unmounts
    return () => {
      if (signalRConnection.current) {
        signalRConnection.current
          .stop()
          .then(() => console.log("Header SignalR connection stopped"))
          .catch((err) =>
            console.error("Error stopping SignalR connection:", err)
          );
      }
    };
  }, [isTabActive, isChatOpen]); // Added dependencies for when these states change

  // Reset title when chat is opened
  useEffect(() => {
    if (isChatOpen) {
      document.title = originalTitle.current;
      setNewMessageCount(0);
    }
  }, [isChatOpen]);
  // Logout function
  const logout = () => {
    // Stop SignalR connection before logout
    if (signalRConnection.current) {
      signalRConnection.current
        .stop()
        .then(() => console.log("SignalR connection stopped on logout"))
        .catch((err) =>
          console.error("Error stopping SignalR connection on logout:", err)
        );
    }

    localStorage.clear();
    window.location.href = "/login";
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Main Header*/}
      <header className="main-header border-bottom-1">
        {/* Main box */}
        <div className="main-box">
          {/*Nav Outer */}
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <a href="/">
                  <img
                    src={logo}
                    alt=""
                    style={{ width: "100px", height: "55px" }}
                    title=""
                  />
                </a>
              </div>
            </div>

            <nav className="nav main-menu">
              <ul className="navigation" id="navbar">
                <li
                  className={`dropdown ${
                    activeDropdown?.innerText.includes("Jobs") ? "current" : ""
                  }`}
                >
                  <span>Jobs</span>
                  <ul>
                    <li>
                      <a href="/job-list">Job List</a>
                    </li>
                    <li>
                      <a href="#">Suitable Jobs</a>
                    </li>
                    <li>
                      <a href="#">IT Jobs</a>
                    </li>
                  </ul>
                </li>
                <li
                  className={`dropdown ${
                    activeDropdown?.innerText.includes("Company")
                      ? "current"
                      : ""
                  }`}
                >
                  <span>Company</span>
                  <ul>
                    <li>
                      <a href="/company-list">Company List</a>
                    </li>
                    <li>
                      <a href="#">Top Company</a>
                    </li>
                  </ul>
                </li>
                <li
                  className={`dropdown ${
                    activeDropdown?.innerText.includes("Profile & CV")
                      ? "current"
                      : ""
                  }`}
                >
                  <span>Profile & CV</span>
                  <ul>
                    <li>
                      <a href="candidate/my-cv">Create CV</a>
                    </li>
                    <li>
                      <a href="candidate/my-cv">Manage CV</a>
                    </li>
                  </ul>
                </li>
                {userRole === "Employer" && (
                  <li
                    className={`dropdown ${
                      activeDropdown?.innerText.includes("Candidates")
                        ? "current"
                        : ""
                    }`}
                  >
                    <span>Candidates</span>
                    <ul>
                      <li>
                        <a href="/candidate-list">Candidate List</a>
                      </li>
                    </ul>
                  </li>
                )}
              </ul>
            </nav>
            {/* Main Menu End*/}
          </div>

          <div className="outer-box">
            {userRole != null ? (
              <>
                {userRole === "Employer" && (
                  <>
                    <a
                      href="/employer/package-list"
                      className="theme-btn btn-style-four mr-2"
                      style={{ padding: "10px 25px" }}
                    >
                      <Crown className="mr-2" size={16} />
                      Upgrade Account
                    </a>
                    <a
                      href="/employer/post-job"
                      className="theme-btn btn-style-one"
                      style={{ padding: "10px 25px" }}
                    >
                      <LayoutDashboard className="mr-2" size={16} />
                      Post a Job
                    </a>
                  </>
                )}
                {userRole === "Candidate" && (
                  <>
                    <a
                      href="/candidate/package-list"
                      className="theme-btn btn-style-four mr-2"
                      style={{ padding: "10px 25px" }}
                    >
                      <Crown className="mr-2" size={16} />
                      Upgrade Account
                    </a>
                    <a href="/candidate/saved-jobs" className="menu-btn">
                      <span className="count" style={{ textAlign: "center" }}>
                        1
                      </span>
                      <span className="icon la la-heart-o"></span>
                    </a>
                  </>
                )}

                {/* Chat Button - Added to header */}
                <div
                  className="menu-btn"
                  onClick={toggleChat}
                  style={{ cursor: "pointer" }}
                >
                  {unreadCount > 0 && (
                    <span className="count" style={{ textAlign: "center" }}>
                      {unreadCount}
                    </span>
                  )}
                  <span className="icon la la-comments"></span>
                </div>

                <NotificationDropdown userId={userDataLogin?.userID} />

                <DropdownMenu className="ml-8">
                  <DropdownMenuTrigger>
                    <Avatar>
                      <AvatarImage
                        src={
                          userDataLogin?.avatar
                            ? userDataLogin.avatar
                            : "https://www.topcv.vn/images/avatar-default.jpg"
                        }
                      />
                      <AvatarFallback>avatar_user</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <h2 className="text-sm font-semibold leading-none">
                          My account
                        </h2>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userDataLogin?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <a
                        href={
                          userRole
                            ? `/${userRole.toLowerCase()}/dashboard`
                            : "test"
                        }
                      >
                        Dashboard
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <a onClick={logout}>Logout</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <a href="candidate/create-cv" className="upload-cv">
                  Upload your CV
                </a>
                <div className="btn-box">
                  <a
                    href="/login"
                    className="theme-btn btn-style-three call-modal"
                  >
                    Login / Register
                  </a>
                  <a
                    href="employer/create-job"
                    className="theme-btn btn-style-one"
                  >
                    Job Post
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Chat Popup */}
      {isChatOpen && (
        <ChatPopup
          isOpen={isChatOpen}
          onClose={toggleChat}
          existingConnection={signalRConnection.current}
        />
      )}

      {/* End Main Header */}
    </>
  );
};
