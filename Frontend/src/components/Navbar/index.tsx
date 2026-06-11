import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Navbar/style.scss";
import LoginModal from "../../pages/Login";
import ProfileDropdownMenu from "./ProfileDropdownMenu";
import CartModal from "../CartModal";
import { useCart } from "../../contexts/CartContext";

interface UserProfile {
  _id: string;
  email: string;
  userName: string;
  avatar: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("authToken")
  );
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // ── Commerce ──────────────────────────────────────────────────────
  const { cartCount, refreshCart } = useCart();

  // Keep isLoggedIn in sync when auth changes from another component
  useEffect(() => {
    const handler = () => {
      const hasToken = !!localStorage.getItem("authToken");
      setIsLoggedIn(hasToken);
      if (!hasToken) setUser(null);
    };
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      if (token && !user) {
        try {
          const response = await fetch("http://localhost:3000/profile/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const userData: UserProfile = await response.json();
            setUser(userData);

            // ── Store userId for Home's crown-badge check ──
            localStorage.setItem("userId", userData._id);
            // ── Sync cart after login ──
            refreshCart();
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userId");
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    if (isLoggedIn) fetchUserProfile();
  }, [isLoggedIn, user]);

  const handleCreateClick = () => {
    if (isLoggedIn) {
      navigate("/elements/new", { state: { openTypePopup: true } });
    } else {
      setShowLoginPopup(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    window.dispatchEvent(new Event("auth-changed")); // clears cart + home crowns
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="ui">UI</span>Commons
      </Link>

      <ul className="menu">
        <li><Link to="/elements">Yếu Tố</Link></li>
        <li><Link to="/spotlight">Nổi Bật</Link></li>
        <li><Link to="/challenges">Thử Thách</Link></li>
      </ul>

      <div className="actions">
        <button className="create-btn" onClick={handleCreateClick}>
          + Tạo
        </button>

        {/* ── Cart icon — only visible when logged in ── */}
        {isLoggedIn && (
          <button
            className="cart-btn"
            onClick={() => setShowCart(true)}
            title="Giỏ hàng"
          >
            🛒
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>
        )}

        {isLoggedIn && user ? (
          <div className="user-profile-container">
            <div
              className="user-profile-dropdown"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              <span>{user.userName}</span>
              <img src={user.avatar} alt={user.userName} className="avatar" />
            </div>
            {showDropdown && <ProfileDropdownMenu onLogout={handleLogout} />}
          </div>
        ) : isLoggedIn ? (
          <div className="loading-spinner"></div>
        ) : null}
      </div>

      {!isLoggedIn && showLoginPopup && (
        <LoginModal
          onClose={() => setShowLoginPopup(false)}
          onLogin={() => {}}
        />
      )}

      {/* ── Cart drawer ── */}
      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </nav>
  );
};

export default Navbar;
