import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";

export const SocialRegister = () => {
  const [user, setUser] = useState([]);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      console.log("Login Success:", codeResponse);
      setUser(codeResponse);
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user) {
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
          console.log("User Profile:", res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

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
