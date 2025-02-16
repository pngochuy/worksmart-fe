/* eslint-disable react/prop-types */
import { FooterUser } from "../components/FooterUser";
import { Header } from "../components/Header";

export const UserLayout = ({ children }) => {
  return (
    <>
      <div className="page-wrapper dashboard ">
        {/* Preloader */}
        <div className="preloader"></div>

        {/* Header Span */}
        <span className="header-span"></span>

        {/* Main Header */}
        <Header />
        {/* End Header */}

        {children}

        {/* User Footer */}
        <FooterUser />
        {/* End User Footer */}
      </div>
    </>
  );
};
