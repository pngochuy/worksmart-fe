import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import { getUserLoginData, getUserRoleFromToken } from "../helpers/decodeJwt";
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
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const Header = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userRole, setUserRole] = useState(null); // State lưu role người dùng
  const [userDataLogin, setUserDataLogin] = useState(null); // State lưu người dùng đăng nhập
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const role = getUserRoleFromToken(); // Lấy role từ token
    setUserRole(role); // Cập nhật state với role người dùng
    const user = getUserLoginData();
    setUserDataLogin(user);
  }, []);

  useEffect(() => {
    // Lấy danh sách tất cả các dropdown
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

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userLoginData");
    window.location.href = "/login";
  };

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const currentUserId = getUserLoginData().userID;
        const response = await axios.get(
          `${BACKEND_API_URL}/api/Messages/unread/${currentUserId}`
        );
        setUnreadCount(response.data.count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };

    fetchUnreadCount();

    // Set up polling for unread messages (optional)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 1000); // Check every minute

    return () => clearInterval(interval);
  }, []);

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
                      <a href="/suitable-jobs">Suitable Jobs</a>
                    </li>
                    <li>
                      <a href="/it-jobs">IT Jobs</a>
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
                      <a href="blog-list-v1.html">Top Company</a>
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
                      <a href="candidate/create-cv">Create CV</a>
                    </li>
                    <li>
                      <a href="candidate/manage-cv">Manage CV</a>
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
                  <a
                    href="/employer/post-job"
                    className="theme-btn btn-style-one"
                    style={{ padding: "10px 25px" }}
                  >
                    Post a Job
                  </a>
                )}
                {userRole === "Candidate" && (
                  <a href="/candidate/job-alerts" className="menu-btn">
                    <span className="count" style={{ textAlign: "center" }}>
                      1
                    </span>
                    <span className="icon la la-heart-o"></span>
                  </a>
                )}

                {/* Chat Button - Added to header */}
                <div
                  className="menu-btn"
                  onClick={toggleChat}
                  style={{ cursor: "pointer", marginRight: "15px" }}
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
      {isChatOpen && <ChatPopup isOpen={isChatOpen} onClose={toggleChat} />}

      {/* End Main Header */}
    </>
  );
};
