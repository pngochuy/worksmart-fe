import { useEffect } from "react";

export const FooterUser = () => {
  useEffect(() => {
    const scrollButton = document.querySelector(".scroll-to-top");
    const handleScroll = () => {
      if (window.scrollY > 200) {
        scrollButton.classList.add("show");
      } else {
        scrollButton.classList.remove("show");
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    scrollButton.addEventListener("click", scrollToTop);
    window.addEventListener("scroll", handleScroll);

    return () => {
      scrollButton.removeEventListener("click", scrollToTop);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Copyright */}
      <div className="copyright-text">
        <p>
          © 2025 <a href="#">WorkSmart</a>. All Right Reserved.
        </p>
      </div>

      {/* Scroll To Top */}
      <div
        className="scroll-to-top scroll-to-target scroll-to-top"
        data-target="html"
      >
        <span className="fa fa-angle-up"></span>
      </div>
    </>
  );
};
