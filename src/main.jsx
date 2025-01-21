import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// Import CSS
import "./styles/bootstrap.css";
import "./styles/style.css";
import "./styles/responsive.css";

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

{
  /* <script src="./src/assets/js/jquery.js"></script>
  <script src="./src/assets/js/popper.min.js"></script>
  <script src="./src/assets/js/chosen.min.js"></script>
  <script src="./src/assets/js/bootstrap.min.js"></script>
  <script src="./src/assets/js/jquery.fancybox.js"></script>
  <script src="./src/assets/js/jquery.modal.min.js"></script>
  <script src="./src/assets/js/mmenu.polyfills.js"></script>
  <script src="./src/assets/js/mmenu.js"></script>
  <script src="./src/assets/js/appear.js"></script>
  <script src="./src/assets/js/anm.min.js"></script>
  <script src="./src/assets/js/ScrollMagic.min.js"></script>
  <script src="./src/assets/js/rellax.min.js"></script>
  <script src="./src/assets/js/owl.js"></script>
  <script src="./src/assets/js/wow.js"></script>
  <script src="./src/assets/js/script.js"></script> */
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
