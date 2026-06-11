import { FaGithub, FaGoogle, FaDiscord } from "react-icons/fa";
import "../Login/style.scss";

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  const handleDisCordLogin = () => {
    window.location.href = "http://localhost:3000/auth/discord";
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-login">
        <button className="close-btn" onClick={onClose}>
          &times; {/* Sử dụng ký tự 'times' cho dấu X đẹp hơn */}
        </button>
        <h2>Join the Community</h2>
        <p>Create beautiful UI elements and share them with developers</p>
        <div className="btn-group">
          {/* Thêm icon vào các nút */}
          <button className="btn github" onClick={handleGitHubLogin}>
            <FaGithub /> Continue with GitHub
          </button>
          <button className="btn google" onClick={handleGoogleLogin}>
            <FaGoogle /> Continue with Google
          </button>
          <button className="btn discord" onClick={handleDisCordLogin}>
            <FaDiscord /> Continue with Discord
          </button>
        </div>
        <p className="footer">
          By continuing, you agree to our <a href="#">Terms</a> and{" "}
          <a href="#">Privacy Policy</a>
        </p>
        <p className="signin">
          Already have an account? <a href="#">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
