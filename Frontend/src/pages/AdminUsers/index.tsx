import { useEffect, useState } from "react";
import "./style.scss";

interface IUser {
  _id: string;
  userName: string;
  email: string;
  avatar: string;
  role: "user" | "reviewer" | "moderator" | "admin";
  promotedBy?: string;
  promotedAt?: string;
  createdAt?: string;
}

const AdminUsers = () => {
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<IUser[]>([]);
  const [reviewers, setReviewers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "eligible" | "reviewers">("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("authToken");
    
    try {
      setLoading(true);
      
      // Fetch all users
      const allRes = await fetch("http://localhost:3000/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allData = await allRes.json();
      setAllUsers(allData);

      // Fetch eligible users (users only)
      const eligibleRes = await fetch("http://localhost:3000/accounts/eligible-for-promotion", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eligibleData = await eligibleRes.json();
      setEligibleUsers(eligibleData);

      // Fetch reviewers/moderators
      const reviewersRes = await fetch("http://localhost:3000/accounts/reviewers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reviewersData = await reviewersRes.json();
      setReviewers(reviewersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId: string, role: "reviewer" | "moderator") => {
    if (!confirm(`Promote this user to ${role}?`)) return;

    const token = localStorage.getItem("authToken");
    
    try {
      const res = await fetch(`http://localhost:3000/accounts/${userId}/promote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        alert(`Người dùng được thăng hạng lên ${role} thành công!`);
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.message || "Không thể lên chức người dùng");
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("Không thể lên chức người dùng");
    }
  };

  const handleDemoteUser = async (userId: string) => {
    if (!confirm("Xuống chức người dùng này?")) return;

    const token = localStorage.getItem("authToken");
    
    try {
      const res = await fetch(`http://localhost:3000/accounts/${userId}/demote`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Người dùng được xuống chức thành công!");
        fetchUsers();
      } else {
        const error = await res.json();
        alert(error.message || "Thất bại xuống chức");
      }
    } catch (error) {
      console.error("Error demoting user:", error);
      alert("Thất bại xuống chức");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "#ef4444";
      case "moderator": return "#f59e0b";
      case "reviewer": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return "👑";
      case "moderator": return "🛡️";
      case "reviewer": return "⭐";
      default: return "👤";
    }
  };

  const getDisplayUsers = () => {
    let users: IUser[] = [];
    
    switch (selectedTab) {
      case "all":
        users = allUsers;
        break;
      case "eligible":
        users = eligibleUsers;
        break;
      case "reviewers":
        users = reviewers;
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.userName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return users;
  };

  const displayUsers = getDisplayUsers();

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <h1>👥 Quản lý người dùng</h1>
        <div className="admin-users__stats">
          <div className="stat-card">
            <span className="stat-label">Toàn bộ người dùng</span>
            <span className="stat-value">{allUsers.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Reviewers/Moderators</span>
            <span className="stat-value">{reviewers.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Có thể thăng chức</span>
            <span className="stat-value">{eligibleUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-users__tabs">
        <button
          className={`tab ${selectedTab === "all" ? "tab--active" : ""}`}
          onClick={() => setSelectedTab("all")}
        >
          All Users ({allUsers.length})
        </button>
        <button
          className={`tab ${selectedTab === "eligible" ? "tab--active" : ""}`}
          onClick={() => setSelectedTab("eligible")}
        >
          Eligible for Promotion ({eligibleUsers.length})
        </button>
        <button
          className={`tab ${selectedTab === "reviewers" ? "tab--active" : ""}`}
          onClick={() => setSelectedTab("reviewers")}
        >
          Reviewers & Moderators ({reviewers.length})
        </button>
      </div>

      {/* Search */}
      <div className="admin-users__search">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm bằng tên hoặc email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* User List */}
      <div className="admin-users__list">
        {displayUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        ) : (
          displayUsers.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-card__info">
                <img
                  src={user.avatar}
                  alt={user.userName}
                  className="user-card__avatar"
                />
                <div className="user-card__details">
                  <div className="user-card__name-row">
                    <span className="user-card__name">{user.userName}</span>
                    <span
                      className="user-card__role"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {getRoleIcon(user.role)} {user.role}
                    </span>
                  </div>
                  <span className="user-card__email">{user.email}</span>
                  {user.promotedAt && (
                    <span className="user-card__promoted">
                      Promoted: {new Date(user.promotedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="user-card__actions">
                {user.role === "user" && (
                  <>
                    <button
                      className="btn btn--reviewer"
                      onClick={() => handlePromoteUser(user._id, "reviewer")}
                    >
                      ⭐ Làm Reviewer
                    </button>
                    <button
                      className="btn btn--moderator"
                      onClick={() => handlePromoteUser(user._id, "moderator")}
                    >
                      🛡️ Làm Moderator
                    </button>
                  </>
                )}

                {(user.role === "reviewer" || user.role === "moderator") && (
                  <>
                    {user.role === "reviewer" && (
                      <button
                        className="btn btn--moderator"
                        onClick={() => handlePromoteUser(user._id, "moderator")}
                      >
                        🛡️ Thăng chức lên Moderator
                      </button>
                    )}
                    <button
                      className="btn btn--demote"
                      onClick={() => handleDemoteUser(user._id)}
                    >
                      ⬇️ Xuống chức về User
                    </button>
                  </>
                )}

                {user.role === "admin" && (
                  <span className="admin-badge">Không thể ảnh hưởng admin</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
