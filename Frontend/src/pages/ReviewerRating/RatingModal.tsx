import { useState } from "react";
import "./rating-modal.scss";

interface RatingModalProps {
  submissionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const RatingModal = ({ submissionId, onClose, onSuccess }: RatingModalProps) => {
  console.log("🎬 RatingModal rendered with submissionId:", submissionId);

  const [rating, setRating] = useState({
    creativity: 5,
    execution: 5,
    adherence: 5,
    feedback: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/challenges/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          submissionId,
          ...rating,
        }),
      });

      if (res.ok) {
        alert("Rating submitted successfully!");
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const totalScore = rating.creativity + rating.execution + rating.adherence;

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal__header">
          <h2>Đánh Giá Thành Phần</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rating-criteria">
            {/* Creativity */}
            <div className="rating-item">
              <div className="rating-item__header">
                <label>🎨 Creativity</label>
                <span className="rating-value">{rating.creativity}/10</span>
              </div>
              <p className="rating-description">
                Thiết kế có sáng tạo và độc đáo?
              </p>
              <input
                type="range"
                min="1"
                max="10"
                value={rating.creativity}
                onChange={(e) =>
                  setRating({ ...rating, creativity: parseInt(e.target.value) })
                }
                className="rating-slider"
              />
              <div className="rating-labels">
                <span>Tệ</span>
                <span>Xuất xắc</span>
              </div>
            </div>

            {/* Execution */}
            <div className="rating-item">
              <div className="rating-item__header">
                <label>⚙️ Thực Hiện</label>
                <span className="rating-value">{rating.execution}/10</span>
              </div>
              <p className="rating-description">
                Độ tin cậy của code, có chi tiết cao?
              </p>
              <input
                type="range"
                min="1"
                max="10"
                value={rating.execution}
                onChange={(e) =>
                  setRating({ ...rating, execution: parseInt(e.target.value) })
                }
                className="rating-slider"
              />
              <div className="rating-labels">
                <span>Tệ</span>
                <span>Xuất xắc</span>
              </div>
            </div>

            {/* Adherence */}
            <div className="rating-item">
              <div className="rating-item__header">
                <label>📋 Tuân Thủ Luật</label>
                <span className="rating-value">{rating.adherence}/10</span>
              </div>
              <p className="rating-description">
                Có tuân thủ luật lệ tốt không?
              </p>
              <input
                type="range"
                min="1"
                max="10"
                value={rating.adherence}
                onChange={(e) =>
                  setRating({ ...rating, adherence: parseInt(e.target.value) })
                }
                className="rating-slider"
              />
              <div className="rating-labels">
                <span>Tệ</span>
                <span>Xuất xắc</span>
              </div>
            </div>
          </div>

          {/* Total Score Display */}
          <div className="total-score">
            <span className="total-score__label">Tổng Cộng Điểm</span>
            <span className="total-score__value">{totalScore}/30</span>
          </div>

          {/* Feedback */}
          <div className="feedback-section">
            <label>💬 Đưa ý kiến(tùy chọn)</label>
            <textarea
              value={rating.feedback}
              onChange={(e) => setRating({ ...rating, feedback: e.target.value })}
              placeholder="Đưa ý kiến của bạn về bài đăng này..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="rating-modal__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
