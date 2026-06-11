import { useEffect, useState } from "react";
import "./style.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import axios from "axios";
import ElementPreview from "../../components/ElementPreview";

interface IUserPost {
  _id: string;
  title: string;
  thumbnail?: string;
  htmlCode: string;
  cssCode: string;
  createdAt?: string;
  status: "draft" | "public" | "rejected" | "review";
  parentId?: string;
}

interface IUserProfile {
  email: string;
  userName: string;
  avatar: string;
  favourites: number;
  posts: IUserPost[];
}

const API_URL = "http://localhost:3000";

const ProfilePage = () => {
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<{ [key: string]: IUserPost[] }>({});
  const [loadingTabs, setLoadingTabs] = useState<{ [key: string]: boolean }>({});

  const handleCreateClick = () => {
    navigate("/elements/new", { state: { openTypePopup: true } });
  };

  // Handle OAuth token in URL
  useEffect(() => {
    const queryToken = new URLSearchParams(location.search).get("token");
    if (queryToken) {
      localStorage.setItem("authToken", queryToken);
      // Notify Navbar + CartContext that auth state changed
      window.dispatchEvent(new Event("auth-changed"));
      window.history.replaceState({}, "", "/profile");
    }
  }, [location]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const usernameValue =
          data.userName || data.username || (data.email ? data.email.split("@")[0] : "user");
        setUser({
          email: data.email || "",
          userName: usernameValue,
          avatar: data.avatar || `https://ui-avatars.com/api/?name=${usernameValue}`,
          favourites: data.favourites?.length || 0,
          posts: data.posts || [],
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.status === 401
              ? "Session expired. Please log in again."
              : "Failed to load profile."
          );
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch posts for all tabs (including Purchases)
  useEffect(() => {
    if (!user) return;

    const tabMap: { [key: string]: string } = {
      Posts: "post",
      Variations: "variations",
      "In Review": "review",
      Rejected: "rejected",
      Drafts: "draft",
      // ── Commerce ──
      "Đã Mua": "purchases",
    };

    Object.keys(tabMap).forEach((displayTab) => {
      setLoadingTabs((prev) => ({ ...prev, [displayTab]: true }));
      fetchTabPosts(tabMap[displayTab], displayTab);
    });
  }, [user]);

  const fetchTabPosts = async (backendTab: string, displayTab: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoadingTabs((prev) => ({ ...prev, [displayTab]: false }));
      return;
    }

    try {
      // ── Purchases tab uses a different endpoint ──
      if (backendTab === "purchases") {
        const res = await axios.get(`${API_URL}/shop/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Each order has a `component` field with the full component data
        const components: IUserPost[] = res.data
          .map((order: { component: IUserPost | null }) => order.component)
          .filter(Boolean);
        setPosts((prev) => ({ ...prev, [displayTab]: components }));
        return;
      }

      // Existing component tabs
      const res = await axios.get(`${API_URL}/components/user/${backendTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => ({ ...prev, [displayTab]: res.data || [] }));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ Error fetching ${backendTab}:`, error.response?.data || error.message);
      }
      setPosts((prev) => ({ ...prev, [displayTab]: [] }));
    } finally {
      setLoadingTabs((prev) => ({ ...prev, [displayTab]: false }));
    }
  };

  const getPostsForTab = (tab: string): IUserPost[] => posts[tab] || [];

  const renderTabContent = (
    tab: string,
    emptyMessage: string,
    showCreate = false,
    emptyIcon = "▢"
  ) => {
    const isLoading = loadingTabs[tab];
    const tabPosts = getPostsForTab(tab);

    if (isLoading) {
      return <div className="tab-loading">Loading {tab.toLowerCase()}...</div>;
    }

    if (tabPosts.length > 0) {
      return (
        <div className="grid" style={{ padding: 0 }}>
          {tabPosts.map((post) => (
            <Link
              // Purchased components always link to detail (never edit)
              to={post.status === "draft" ? `/elements/${post._id}/edit` : `/element/${post._id}`}
              key={post._id}
              className="card"
            >
              <ElementPreview htmlCode={post.htmlCode} cssCode={post.cssCode} />
              <div className="card-info">
                <h3>{post.title}</h3>
                {post.createdAt && (
                  <p className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className="empty-state">
        <div className="empty-icon">{emptyIcon}</div>
        <h2>{emptyMessage}</h2>
        {showCreate && (
          <>
            <p>Click "Create" to start sharing!</p>
            <button className="create-btn" onClick={handleCreateClick}>
              ＋ Create
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  if (error || !user) {
    return (
      <div className="profile-error">
        {error || "User not found"}
        <p>Please log in:</p>
        <a href={`${API_URL}/auth/google`}>Login with Google</a>
        <br />
        <a href={`${API_URL}/auth/github`}>Login with GitHub</a>
        <br />
        <a href={`${API_URL}/auth/discord`}>Login with Discord</a>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={user.avatar} alt={user.userName} className="avatar" />
        </div>
        <div className="profile-info">
          <h1>{user.userName}</h1>
          <p className="username">@{user.userName}</p>
          <p className="email">{user.email}</p>
          <p>Favourites: {user.favourites}</p>
          <Link to="/settings" className="settings-btn">⚙ Settings</Link>
        </div>
      </div>

      <div className="profile-content">
        <Tabs>
          <TabList>
            <Tab>Posts</Tab>
            <Tab>Variations</Tab>
            <Tab>In Review</Tab>
            <Tab>Rejected</Tab>
            <Tab>Drafts</Tab>
            {/* ── Commerce tab ── */}
            <Tab>Bought</Tab>
          </TabList>

          <TabPanel>
            {renderTabContent("Posts", "No public posts yet", true, "▢")}
          </TabPanel>
          <TabPanel>
            {renderTabContent("Variations", "No variations yet", true, "♻")}
          </TabPanel>
          <TabPanel>
            {renderTabContent("In Review", "No submissions in review", false, "⏳")}
          </TabPanel>
          <TabPanel>
            {renderTabContent("Rejected", "No rejected submissions", false, "✗")}
          </TabPanel>
          <TabPanel>
            {renderTabContent("Drafts", "No drafts yet", true, "📝")}
          </TabPanel>

          {/* ── Purchases tab panel ── */}
          <TabPanel>
            {renderTabContent("Đã Mua", "Chưa mua component nào", false, "🛒")}
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
