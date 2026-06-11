import { useEffect, useState } from "react";
import axios from "axios";

import "../../Setting/style.scss";
import "./style.scss";

const API_URL = "http://localhost:3000";

const AccountSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // State để hiển thị thông tin
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Lấy đúng token
  const token = localStorage.getItem("authToken");

  // 1. LOAD DATA TỪ SERVER
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        // Gọi API lấy thông tin (chỉ để hiển thị)
        const res = await axios.get(`${API_URL}/setting/basic-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsername(res.data.userName || "");
        setEmail(res.data.email || "");
      } catch (err) {
        console.error("Failed to load profile", err);
        // Fallback nếu lỗi
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        setUsername(stored.userName || "N/A");
        setEmail(stored.email || "N/A");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // (Đã xóa hàm handleSaveChanges vì không cho sửa nữa)

  // 2. XÓA TÀI KHOẢN
  const handleDeleteAccount = async () => {
    // Thêm confirm 2 lần cho chắc chắn
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này không?"
      )
    )
      return;
    if (
      !window.confirm("Hành động này không thể hoàn tác. Bạn thực sự muốn xóa?")
    )
      return;

    try {
      setIsDeleting(true);

      await axios.delete(`${API_URL}/setting/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Đã xóa tài khoản thành công.");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Xóa tài khoản thất bại.");
      setIsDeleting(false);
    }
  };

  if (isLoading)
    return (
      <div className="loading-text" style={{ color: "white", padding: 20 }}>
        Loading account info...
      </div>
    );

  return (
    <>
      <div className="spgHeader">Account Settings</div>
      <div className="spgHint">
        Thông tin định danh tài khoản (Không thể chỉnh sửa tại đây).
      </div>

      <div className="account-info-card">
        {/* USERNAME: CHỈ XEM (READONLY) */}
        <div className="info-row">
          <div className="info-label">Username</div>
          <input
            type="text"
            className="info-input disabled"
            value={username}
            readOnly
            disabled
            style={{
              opacity: 0.7,
              cursor: "not-allowed",
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          />
        </div>

        {/* EMAIL: CHỈ XEM (READONLY) */}
        <div className="info-row">
          <div className="info-label">Email</div>
          <input
            type="text"
            className="info-input disabled"
            value={email}
            readOnly
            disabled
            style={{
              opacity: 0.7,
              cursor: "not-allowed",
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          />
        </div>
      </div>

      {/* Chỉ còn lại nút Delete */}
      <div
        className="action-buttons"
        style={{
          marginTop: "30px",
          borderTop: "1px solid #333",
          paddingTop: "20px",
        }}
      >
        <div
          style={{ color: "#ff4d4f", marginBottom: "10px", fontSize: "14px" }}
        >
          ⚠️ Khu vực nguy hiểm
        </div>
        <button
          className="delete-button"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          style={{
            padding: "10px 20px",
            background: "#ff4d4f",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isDeleting ? "Đang xử lý..." : "Xóa Tài Khoản Vĩnh Viễn"}
        </button>
      </div>
    </>
  );
};

export default AccountSettings;
