import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";

export const SocialRegister = () => {
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log("Login Success:", codeResponse);
      setUser(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user && user.access_token) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          if (!res.data) {
            console.error("Google Login Response is empty!");
            return;
          }
        
          console.log("User Profile:", res.data);

          setProfile(res.data);
        
          // Đợi profile cập nhật xong rồi gọi login
          setTimeout(() => handleBackendLogin(res.data), 100);
        })
        .catch((err) => console.log(err));
    } else {
      console.log("Access token is undefined:", user);
    }
  }, [user]);

  const handleBackendLogin = async (profileData) => {
    const requestData = {
      email: profile.email,
      name: profile.name,
      avatar: profile.picture || "",
      role: "Candidate", // Nếu chưa có role, đặt mặc định
    };
    console.log("Sending request:", requestData);

    try {
      const response = await axios.post("https://localhost:7141/accounts/google-login", {
        email: profileData.email,
        name: profileData.name,
        picture: profileData.picture,
      });

      console.log("Login Response:", response.data);
      localStorage.setItem("token", response.data.Token);

      // Luôn điều hướng vào Candidate Dashboard
      window.location.href = "/candidate/dashboard";
    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      alert("Đăng nhập thất bại, vui lòng thử lại!");
    }
  };

  return (
    <>
      <div className="form-group" style={{ textAlign: "left" }}>
        <label>
          <input type="checkbox" name="agree" required /> By logging in with my
          social media account, I agree to the{" "}
          <a href="/terms">Terms of Service </a>and{" "}
          <a href="/privacy">Privacy Policy</a>
        </label>
      </div>
      <div className="btn-box row">
        {/* <div className="col-lg-6 col-md-12">
          <a href="#" className="theme-btn social-btn-two facebook-btn">
            <i className="fab fa-facebook-f"></i> Login via Facebook
          </a>
        </div> */}
        <div className="col-lg-12 col-md-12">
          <button
            onClick={login}
            className="theme-btn social-btn-two google-btn"
          >
            <i className="fab fa-google"></i> Login with Google
          </button>
        </div>
      </div>
    </>
  );
};
