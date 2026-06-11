import { useState, useEffect } from "react";
import axios from "axios";

import "../../Setting/style.scss";
import "./style.scss";

const API_URL = "http://localhost:3000";

const EmailSettings = () => {
  // Thêm state email để hiển thị dữ liệu từ API
  const [email, setEmail] = useState("");
  const [receiveNotifications, setReceiveNotifications] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ⚠️ [FIX 1]: Lấy đúng key "authToken" (khớp với trang Login)
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setIsFetching(false);
        return;
      }

      try {
        // ⚠️ [FIX 2]: Gọi API lấy Email (basic-info) theo đường dẫn mới '/setting'
        const userRes = await axios.get(`${API_URL}/setting/basic-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmail(userRes.data.email || "");

        // ⚠️ [FIX 3]: Gọi API lấy setting Email theo đường dẫn mới '/setting'
        const settingRes = await axios.get(`${API_URL}/setting/email`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReceiveNotifications(settingRes.data.emailNotifications);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // ⚠️ [FIX 4]: Update API path thành '/setting/email'
      await axios.put(
        `${API_URL}/setting/email`,
        { emailNotifications: receiveNotifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching)
    return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  return (
    <>
      <div className="spgHeader">Email Settings</div>

      <div className="email-address-section">
        <div className="email-address-label">Email address</div>
        {/* Hiển thị email từ State (lấy từ API) */}
        <input
          type="email"
          value={email}
          readOnly
          disabled
          style={{
            cursor: "not-allowed",
            opacity: 0.7,
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "5px",
            border: "1px solid #333",
            background: "#222",
            color: "#fff",
          }}
        />
      </div>

      <div
        className="receive-notifications-toggle"
        style={{ marginTop: "20px" }}
      >
        <label>Receive email notifications</label>
        <div
          className={`toggle-switch ${receiveNotifications ? "active" : ""}`}
          onClick={() =>
            !isFetching && setReceiveNotifications(!receiveNotifications)
          }
        >
          <span className="toggle-slider"></span>
        </div>
      </div>

      <button
        className="email-btn-save"
        onClick={handleSave}
        disabled={isSaving || isFetching}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          opacity: isSaving ? 0.7 : 1,
        }}
      >
        {isSaving ? "Saving..." : "Save changes"}
      </button>
    </>
  );
};

export default EmailSettings;
