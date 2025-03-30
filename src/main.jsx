import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// Import CSS
// import "./styles/animate.css";
import "./assets/styles/bootstrap.css";
// import "./styles/chosen.css";
// import "./styles/flaticon.css";
import "./assets/styles/fontawesome.css";
// import "./styles/icons.css";
// import "./styles/jquery-ui.min.css";
// import "./styles/jquery.fancybox.min.css";
// import "./styles/jquery.modal.min.css";
// import "./styles/line-awesome.css";
// import "./styles/mmenu.css";
// import "./styles/owl.css";
// import "./styles/select2.min.css";
import "./assets/styles/style.css";
import "./assets/styles/index.css";
import "./assets/styles/responsive.css";

// Import các thư viện JS cần thiết
import "./assets/js/jquery.js";
// import "./assets/js/popper.min.js";
import "popper.js";
import "./assets/js/chosen.min.js";
import "./assets/js/bootstrap.min.js";
// import "bootstrap";
import "./assets/js/jquery.fancybox.js";
import "./assets/js/jquery.modal.min.js";
import "./assets/js/mmenu.polyfills.js";
import "./assets/js/mmenu.js";
import "./assets/js/appear.js";
import "./assets/js/anm.min.js";
// import "./assets/js/ScrollMagic.min.js";
import "scrollmagic";
import "./assets/js/rellax.min.js";
// import "rellax";
import "./assets/js/owl.js";
// import "./assets/js/wow.js";
import "wowjs";
import "./assets/js/script.js";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Khởi tạo localStorage với giá trị mặc định nếu chưa có
const initializeLocalStorage = () => {
  if (!localStorage.getItem("jobLimitSettings")) {
    const defaultSettings = {
      maxJobsPerDay: 5,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("jobLimitSettings", JSON.stringify(defaultSettings));
    console.log("Default job limit settings initialized");
  }
};

// Gọi hàm khởi tạo trước khi render ứng dụng
initializeLocalStorage();

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="343167304228-2ner08mmv6jk0qpfposq74blmmrcope5.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
);
