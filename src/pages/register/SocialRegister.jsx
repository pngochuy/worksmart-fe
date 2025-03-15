import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";
import { loginUserByGoogle } from "../../services/accountServices";
import { toast } from "react-toastify";
import { getUserRoleFromToken } from "@/helpers/decodeJwt";
import { useNavigate, useSearchParams } from "react-router-dom";

export const SocialRegister = () => {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Đọc query parameter từ URL
  const role = searchParams.get("role") || "candidate-form"; // Mặc định là "candidate-form" nếu không có role trong URL

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
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          if (!res.data) {
            console.error("Google Login Response is empty!");
            return;
          }

          console.log("User Profile:", res.data);
          // localStorage.setItem("", JSON.stringify(response.data.token));

          // Đợi profile cập nhật xong rồi gọi login
          setTimeout(() => handleBackendLogin(res.data), 100);
        })
        .catch((err) => console.log(err));
    } else {
      console.log("Access token is undefined:", user);
    }
  }, [user]);

  const handleBackendLogin = async (profileData) => {
    console.log(
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        profileData.name
      )}&background=random&color=fff`
    );
    try {
      const response = await loginUserByGoogle({
        email: profileData.email,
        name: profileData.name,
        avatar:
          role === "candidate-form"
            ? profileData.picture
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                profileData.name
              )}&background=random&color=fff`,
        role: role === "candidate-form" ? "Candidate" : "Employer",
      });
      toast.success("Login success!");
      console.log("Login thành công:", response);

      const userRole = getUserRoleFromToken();
      navigate(`/${userRole.toLowerCase()}/dashboard`);
    } catch (error) {
      console.error("Login Failed:", error);
      alert("Đăng nhập thất bại, vui lòng thử lại!");
    }
  };

  return (
    <>
      {/* <div className="form-group" style={{ textAlign: "left" }}>
        <label>
          <input type="checkbox" name="agree" required /> By logging in with my
          social media account, I agree to the{" "}
          <a href="/terms">Terms of Service </a>and{" "}
          <a href="/privacy">Privacy Policy</a>
        </label>
      </div> */}
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
