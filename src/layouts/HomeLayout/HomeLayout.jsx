/* eslint-disable react/prop-types */
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
console.log("second header");
export const HomeLayout = ({ children }) => {
  return (
    <>
      <div className="page-wrapper">
        {/* Preloader */}
        <div className="preloader"></div>

        {/* Main Header */}
        <Header />
        {/* End Header */}

        <main>{children}</main>

        {/* Main Footer */}
        <Footer />
        {/* End Main Footer */}
      </div>
    </>
  );
};
