import { NavLink } from "react-router-dom";
// Import icons
import {
  FiGrid,
  FiMousePointer,
  FiToggleLeft,
  FiCheckSquare,
  FiLayout,
  FiLoader,
  FiType,
  FiFileText,
  FiLayers,
  FiDisc,
  FiMessageSquare,
  FiBookmark,
} from "react-icons/fi";
import "./style.scss";

// Danh sách danh mục
const categories = [
  { slug: "all", name: "All", icon: <FiGrid /> },
  { slug: "button", name: "Buttons", icon: <FiMousePointer /> },
  { slug: "toggle switch", name: "Toggle switches", icon: <FiToggleLeft /> },
  { slug: "checkbox", name: "Checkboxes", icon: <FiCheckSquare /> },
  { slug: "card", name: "Cards", icon: <FiLayout /> },
  { slug: "loader", name: "Loaders", icon: <FiLoader /> },
  { slug: "input", name: "Inputs", icon: <FiType /> },
  { slug: "form", name: "Forms", icon: <FiFileText /> },
  { slug: "pattern", name: "Patterns", icon: <FiLayers /> },
  { slug: "radio buttons", name: "Radio buttons", icon: <FiDisc /> },
  { slug: "tooltips", name: "Tooltips", icon: <FiMessageSquare /> },
  // Mục này dùng path riêng, không có slug
  { path: "/favourite", name: "My favorites", icon: <FiBookmark /> },
];

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        {categories.map((item, index) => {
          const linkTo = item.path ? item.path : `/elements/${item.slug}`;

          return (
            <NavLink
              to={linkTo}
              key={index}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              <span className="icon">{item.icon}</span>
              <span className="text">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
