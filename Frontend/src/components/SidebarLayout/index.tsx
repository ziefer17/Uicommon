import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

const SidebarLayout = () => {
  return (
    // Bỏ minHeight ở đây nếu Navbar đã fixed, hoặc giữ nguyên nếu Navbar cuộn theo
    <div className="app-container" style={{ display: "flex", width: "100%" }}>
      {/* Sidebar (Đã có position: sticky trong CSS nên nó sẽ tự đứng yên) */}
      <Sidebar />

      {/* Nội dung bên phải */}
      <div
        className="main-content"
        style={{
          flex: 1,
          padding: "30px",
          background: "#000", // Màu nền trùng khớp
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
