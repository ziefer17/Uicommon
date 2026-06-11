import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./style.scss";
import {
  FaUser,
  FaTrophy,
  FaEnvelope,
  FaUserCog,
  FaChartBar,
  FaBuilding,
  FaTwitter,
  FaGlobe,
  FaMapMarkerAlt,
  FaPen,
  FaSave,
} from "react-icons/fa";

const API_URL = "http://localhost:3000";

const Profile = () => {
  // Lấy dữ liệu từ localStorage để hiển thị ngay lập tức (tránh delay)
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    userName: storedUser.userName || "",
    address: "",
    company: "",
    twitter: "",
    website: "",
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("authToken"); // Hoặc "token" tùy key bạn lưu

  // 1. LOAD DỮ LIỆU TỪ BACKEND
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // --- [SỬA LẠI ĐƯỜNG DẪN API TẠI ĐÂY] ---
        // Cũ: /profile/detailed-info
        // Mới: /setting/detailed-info
        const res = await axios.get(`${API_URL}/setting/detailed-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          userName: res.data.userName || storedUser.userName || "",
          address: res.data.address || "",
          company: res.data.company || "",
          twitter: res.data.twitter || "",
          website: res.data.website || "",
          bio: res.data.bio || "",
        });
      } catch (err) {
        console.error("Lỗi gọi API:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // 2. XỬ LÝ KHI NHẬP LIỆU
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. LƯU DỮ LIỆU
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // --- [SỬA LẠI ĐƯỜNG DẪN API TẠI ĐÂY] ---
      await axios.put(`${API_URL}/setting/detailed-info`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Cập nhật lại localStorage để Header cũng đổi tên theo
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      currentUser.userName = formData.userName;
      localStorage.setItem("user", JSON.stringify(currentUser));

      alert("Lưu thành công!");
    } catch (err) {
      console.error(err);
      alert("Lưu thất bại. Hãy kiểm tra Console (F12).");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div style={{ color: "#fff", padding: "20px" }}>Loading...</div>;

  return (
    <>
      <div className="spgHeader">Personal Information</div>
      <div className="spgHint">
        Thông tin này sẽ được hiển thị công khai trên hồ sơ của bạn.
      </div>

      <form className="spgForm" onSubmit={handleSave}>
        <div className="spgRow">
          <div className="spgField">
            <label>
              <FaUser className="spgFieldIcon" /> Tên
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="User"
            />
          </div>
          <div className="spgField">
            <label>
              <FaMapMarkerAlt className="spgFieldIcon" /> Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Địa chỉ của bạn"
            />
          </div>
        </div>

        <div className="spgRow">
          <div className="spgField">
            <label>
              <FaBuilding className="spgFieldIcon" /> Công ty
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Công ty của bạn"
            />
          </div>
          <div className="spgField">
            <label>
              <FaTwitter className="spgFieldIcon" /> Twitter
            </label>
            <input
              type="text"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="Twitter của bạn"
            />
          </div>
        </div>

        <div className="spgRow">
          <div className="spgFieldFull">
            <label>
              <FaGlobe className="spgFieldIcon" /> Websites
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Địa chỉ trang web của bạn"
            />
          </div>
        </div>

        <div className="spgRow">
          <div className="spgFieldFull">
            <label>
              <FaPen className="spgFieldIcon" /> Ghi chú
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Thêm ghi chú ......"
              rows={4}
            ></textarea>
          </div>
        </div>

        <div
          className="spgRow"
          style={{ justifyContent: "flex-end", marginTop: "20px" }}
        >
          <button
            type="submit"
            disabled={isSaving}
            style={{
              backgroundColor: "#6366f1",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <FaSave /> {isSaving ? "Lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
      </form>
    </>
  );
};

// Component Layout Chính
const SettingProfile = () => {
  const location = useLocation();
  const menuItems = [
    { path: "/settings", icon: FaUser, label: "Hồ sơ" },
    { path: "/settings/achievements", icon: FaTrophy, label: "Thành tích" },
    { path: "/settings/email", icon: FaEnvelope, label: "Email" },
    { path: "/settings/account", icon: FaUserCog, label: "Tài khoản" },
    { path: "/settings/stats", icon: FaChartBar, label: "Số liệu thống kê" },
  ];

  return (
    <div className="spgRoot">
      <aside
        className="spgSidebar"
        style={{ background: "black", paddingTop: "50px" }}
      >
        <div className="spgSettingsTitle">Settings</div>
        <nav className="spgMenu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/settings" && location.pathname === "/settings");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`spgMenuItem ${isActive ? "spgMenuItemActive" : ""}`}
              >
                <Icon className="spgMenuIcon" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="spgMain">
        <Outlet />
      </main>
    </div>
  );
};

export default SettingProfile;
export { Profile };
