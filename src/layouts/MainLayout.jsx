/* eslint-disable react/prop-types */
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const MainLayout = ({ children }) => {
  return (
    <>
      <div className="page-wrapper">
        {/* Preloader */}
        {/* <div className="preloader"></div> */}

        {/* Main Header */}
        <Header />
        {/* End Header */}

        {children}

        {/* Main Footer */}
        <Footer />
        {/* End Main Footer */}
      </div>
    </>
  );
};
