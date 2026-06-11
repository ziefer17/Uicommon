// Dán đè toàn bộ nội dung file AdminPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ElementPreview from "../../components/ElementPreview";
import "./style.scss";
interface IAuthor {
  username?: string;
  fullName?: string;
  avatar?: string;
}

interface IElementReview {
  _id: string;
  title: string;
  htmlCode: string;
  cssCode: string;
  status: string;
  accountId?: IAuthor | null;
  viewsCount?: number;
  favouritesCount?: number;
}

const AdminPage = () => {
  const [reviewList, setReviewList] = useState<IElementReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewElements = async () => {
      try {
        const res = await fetch("http://localhost:3000/components/review", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setReviewList(data || []);
      } catch (error) {
        console.error("Fetch review elements failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewElements();
  }, []);

  const handleUpdate = async (id: string, status: "public" | "rejected") => {
    const endpoint =
      status === "public"
        ? `http://localhost:3000/components/${id}/approve`
        : `http://localhost:3000/components/${id}/reject`;

    await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    setReviewList((prev) => prev.filter((el) => el._id !== id));
  };

  if (loading)
    return <div className="review-dashboard__loading">Đang tải...</div>;

  return (
    <div className="review-dashboard">
      <h1 className="review-dashboard__title">Thành phân đang được đánh giá</h1>

      {reviewList.length === 0 ? (
        <p className="review-dashboard__empty-message">
          Không có thành phần đang đợi 
        </p>
      ) : (
        <div className="review-dashboard__list">
          {reviewList.map((el) => (
            <div key={el._id} className="review-card">
              <Link to={`/element/${el._id}`} className="review-card__preview">
                <ElementPreview htmlCode={el.htmlCode} cssCode={el.cssCode} />
              </Link>

              <div className="review-card__meta">
                <div className="review-card__author">
                  <img
                    src={el.accountId?.avatar || "/default-avatar.png"}
                    alt={el.accountId?.username || "user"}
                    className="review-card__avatar"
                  />
                  <strong>
                    {el.accountId?.fullName ||
                      el.accountId?.username ||
                      "Unknown"}
                  </strong>
                </div>

                <div className="review-card__stats">
                  <span>Status: {el.status}</span>
                </div>

                <div className="review-card__actions">
                  <button
                    className="review-card__action review-card__action--approve"
                    onClick={() => handleUpdate(el._id, "public")}
                  >
                    ✅ Đồng ý
                  </button>
                  <button
                    className="review-card__action review-card__action--reject"
                    onClick={() => handleUpdate(el._id, "rejected")}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
