import { Sidebar } from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
  return (
    <div className="page-wrapper dashboard ">
      {/* Preloader */}
      {/* <div className="preloader"></div> */}
      {/* Header Span */}
      <span className="header-span"></span>
      {/* Sidebar Backdrop */}
      <div className="sidebar-backdrop"></div>
      <Sidebar />
      <Outlet /> {/* Nơi hiển thị các trang dựa trên route */}
    </div>
  );
};
