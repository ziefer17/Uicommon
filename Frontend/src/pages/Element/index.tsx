import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiSearch, FiChevronDown, FiBookmark } from "react-icons/fi";
import ElementPreview from "../../components/ElementPreview";
import "../Element/style.scss";

export interface IElement {
  _id: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  reactCode?: string;
  vueCode?: string;
  litCode?: string;
  svelteCode?: string;
  accountId: IAuthor | null;
  category?: string;
  status?: "draft" | "public";
  viewsCount?: number;
  favouritesCount?: number;
}

interface IAuthor {
  userName: string;
  fullName: string;
  avatar: string;
}

const Elements = () => {
  const { category } = useParams<{ category: string }>();
  const [elements, setElements] = useState<IElement[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/components");
        const data = await res.json();

        const publicElements = data.filter(
          (el: IElement) => el.status === "public"
        );
        setElements(publicElements);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filtered = elements.filter((el) => {
    const currentCategory = category || "all";
    const matchSearch = el.title?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      currentCategory === "all" ||
      el.category?.toLowerCase() === currentCategory.toLowerCase();

    return matchSearch && matchCategory;
  });

  return (
    <div className="elements-page">
      <div className="toolbar-header">
        <div className="theme-dropdown">
          <span className="current-theme">Đen</span>
          <FiChevronDown className="dropdown-icon" />
        </div>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm tags, người dùng, bài đăng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FiSearch className="search-icon" />
        </div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {filtered.length > 0 ? (
          filtered.map((el) => (
            <div key={el._id} className="card-wrapper">
              <Link to={`/element/${el._id}`} className="card">
                <ElementPreview htmlCode={el.htmlCode} cssCode={el.cssCode} />
              </Link>

              <div className="meta">
                <div className="author">
                  <strong>{el.accountId?.userName || "Unknown"}</strong>
                </div>
                <div className="stats">
                  <span>{el.viewsCount?.toLocaleString() || 0} lượt xem</span>
                  <span>
                    <FiBookmark /> {el.favouritesCount || 0}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#888", padding: "20px" }}>
            Không tìm thấy thành phần cho danh mục "{category}".
          </div>
        )}
      </div>
    </div>
  );
};

export default Elements;
