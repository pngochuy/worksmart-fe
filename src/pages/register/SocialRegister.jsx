export const SocialRegister = () => {
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
          <a href="#" className="theme-btn social-btn-two google-btn">
            <i className="fab fa-google"></i> Login via Gmail
          </a>
        </div>
      </div>
    </>
  );
};
