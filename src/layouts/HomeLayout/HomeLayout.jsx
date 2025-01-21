/* eslint-disable react/prop-types */
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
      </div>
    </>
  );
};
