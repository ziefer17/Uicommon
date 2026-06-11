import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../Home/style.scss";
import ElementPreview from "../../components/ElementPreview";

export interface IElement {
  _id: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  reactCode?: string;
  vueCode?: string;
  litCode?: string;
  svelteCode?: string;
  accountId: { _id: string; userName: string; avatar: string } | string; // object from aggregation
  status?: "draft" | "public" | "review" | "rejected";
}

const Home = () => {
  const [search, setSearch] = useState("");
  const [elements, setElements] = useState<IElement[]>([]);

  // ── Commerce: IDs of components the current user has purchased ──
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const currentUserId = localStorage.getItem("userId");

  // Returns true if the user already owns this component (creator OR purchased)
  const isOwned = (el: IElement): boolean => {
    const creatorId =
      typeof el.accountId === "object" ? el.accountId?._id : el.accountId;
    return (
      purchasedIds.includes(el._id) ||
      (!!currentUserId && creatorId === currentUserId)
    );
  };

  // Fetch purchased IDs whenever the user is logged in or buys something
  const fetchPurchasedIds = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) { setPurchasedIds([]); return; }
    try {
      const res = await fetch("http://localhost:3000/shop/purchases/ids", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPurchasedIds(await res.json());
    } catch {
      // silent
    }
  };

  // Fetch components
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/components");
        const data = await res.json();
        setElements(data.filter((el: IElement) => el.status === "public"));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch purchased IDs on mount + when auth changes + when checkout succeeds
  useEffect(() => {
    fetchPurchasedIds();
    window.addEventListener("auth-changed", fetchPurchasedIds);
    window.addEventListener("purchases-updated", fetchPurchasedIds);
    return () => {
      window.removeEventListener("auth-changed", fetchPurchasedIds);
      window.removeEventListener("purchases-updated", fetchPurchasedIds);
    };
  }, []);

  const filtered = elements.filter((el) =>
    el.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      <section className="hero">
        <p className="hero-badge">🚀 3 THÀNH PHẦN MỚI TUẦN NÀY!</p>
        <h1 className="hero-title">
          Thư Viện Mã Nguồn Mở Lớn Nhất
          <br /> Cho UI
        </h1>
        <p className="hero-subtitle">
          Thư viện UI được tạo bởi cộng đồng
          <br />
          Lưu lại HTML/CSS, Tailwind, React và Figma.
        </p>

        <div className="hero-search">
          <input
            type="text"
            placeholder="Tìm kiếm thành phần, người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button>Tìm kiếm</button>
        </div>
      </section>

      <div className="grid">
        {filtered.map((el) => (
          <Link to={`/element/${el._id}`} key={el._id} className="card">
            <ElementPreview htmlCode={el.htmlCode} cssCode={el.cssCode} />
            <span className="card-copy">{"</>"} Lấy code</span>

            {/* Crown badge — hidden once the user owns the component */}
            {!isOwned(el) && (
              <span className="crown-badge" title="Premium">
                👑
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
