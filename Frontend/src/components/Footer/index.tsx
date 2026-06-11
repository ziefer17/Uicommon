import "./style.scss";
import { FaInstagram, FaTwitter, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* LEFT COLUMN — BRAND */}
        <div className="footer-brand">
          <h2 className="footer-logo">
            <span className="uiverse">UI</span>commons
          </h2>

          <p className="footer-desc">UiCommons | Thế giới UI</p>

          <div className="footer-license">
            <p>
              ⚖ <strong>MIT License</strong>
            </p>
            <p>
              All content (UI elements) on this site are published under the{" "}
              <a href="#">MIT License</a>.
            </p>
          </div>

          <div className="footer-social">
            <FaInstagram />
            <FaTwitter />
            <FaDiscord />
          </div>
        </div>

        {/* MIDDLE COLUMNS */}
        <div className="footer-links">
          <div className="footer-col">
            <h4>Games</h4>
            <a href="#">Azeron.ai</a>
            <a href="#">Tavernia.io</a>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Pixelrepo.com</a>
            <a href="#">Cssbuttons.io</a>
            <a href="#">Neumorphism.io</a>
            <a href="#">Browsergames.gg</a>
          </div>

          <div className="footer-col">
            <h4>Information</h4>
            <a href="#">Blog</a>
            <a href="#">Post Guidelines</a>
            <a href="#">Give feedback</a>
            <a href="#">Report bug</a>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Terms and Conditions</a>
            <a href="#">Privacy policy</a>
            <a href="#">Cookie policy</a>
            <a href="#">Disclaimer</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>2025 Pixel Galaxies. All rights reserved. – UiCommons.io</p>
      </div>
    </footer>
  );
}
