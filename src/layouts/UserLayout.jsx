/* eslint-disable react/prop-types */
import { Outlet } from "react-router-dom";
import { FooterUser } from "../components/FooterUser";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";

export const UserLayout = () => {
  return (
    <>
      <div className="page-wrapper dashboard ">
        {/* Preloader */}
        {/* <div className="preloader"></div> */}
        {/* Header Span */}
        <span className="header-span"></span>
        {/* Main Header */}
        <Header />
        {/* End Header */}
        {/* Sidebar Backdrop */}
        <div className="sidebar-backdrop"></div>
        <Sidebar />
        <Outlet /> {/* Nơi hiển thị các trang dựa trên route */}
        {/* User Footer */}
        <FooterUser />
        {/* End User Footer */}
      </div>
    </>
  );
};
