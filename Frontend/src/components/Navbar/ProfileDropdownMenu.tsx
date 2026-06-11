// File: src/components/Navbar/ProfileDropdownMenu.tsx

import React from "react";
import { Link } from "react-router-dom";
import "./style.scss";

interface ProfileDropdownMenuProps {
  onLogout: () => void;
}

const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  onLogout,
}) => {
  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole");

  return (
    <div className="profile-dropdown-menu">
      <ul>
        <li>
          <Link to="/profile">Hồ Sơ Của Bạn</Link>
        </li>
        <li>
          <Link to="/favourite">Yêu Thích</Link>
        </li>
        <li>
          <Link to="/settings">Cài Đặt</Link>
        </li>

        {/* Admin-only menu items */}
        {userRole === "admin" && (
          <>
            <li>
              <Link to="/admin">Đánh Giá Thành Phần</Link>
            </li>
            <li>
              <Link to="/admin/challenges">Quản Lý Thử Thách</Link>
            </li>
            <li>
              <Link to="/admin/users">Quản Lý Người Dùng</Link>
            </li>
          </>
        )}

        {/* Reviewer/Moderator/Admin can access challenges */}
        {["reviewer", "moderator", "admin"].includes(userRole || "") && (
          <li>
            <Link to="/challenges">
              <span className="reviewer-badge">⭐</span> Đánh Giá Thử Thách
            </Link>
          </li>
        )}
      </ul>

      <div className="divider"></div>

      <ul>
        <li>
          <a href="#">Đưa Phản Hồi</a>
        </li>
        <li>
          <a href="#">Báo Cáo Lỗi</a>
        </li>
      </ul>

      <div className="divider"></div>

      <ul>
        <li>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-link"
          >
            Tham Gia Discord
          </a>
        </li>
      </ul>

      <div className="divider"></div>

      <ul>
        <li>
          <button onClick={onLogout} className="logout-menu-btn">
            Đăng Xuất
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ProfileDropdownMenu;
