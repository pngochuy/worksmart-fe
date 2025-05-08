/* eslint-disable react/prop-types */
import { Outlet } from "react-router-dom";
import { FooterUser } from "../components/FooterUser";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { NotificationProvider } from "./NotificationProvider";

export const UserLayout = () => {
  return (
    <>
      <NotificationProvider>
        <div className="page-wrapper dashboard ">
          {/* Header Span */}
          <span className="header-span"></span>
          {/* Main Header */}
          <Header />
          {/* End Header */}
          {/* Sidebar Backdrop */}
          {/* <div className="sidebar-backdrop"></div> */}
          <Sidebar />
          <Outlet /> {/* Nơi hiển thị các trang dựa trên route */}
          {/* User Footer */}
          <FooterUser />
          {/* End User Footer */}
        </div>
      </NotificationProvider>
    </>
  );
};
