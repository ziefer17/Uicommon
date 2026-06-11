import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ElementPreview from "../../components/ElementPreview";
import RatingModal from "../ReviewerRating/RatingModal";
import "./style.scss";

interface IChallenge {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "rating" | "completed";
  rules: string[];
  submissionsCount: number;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  allowedCategories: string[];
}

interface ISubmission {
  _id: string;
  userId: {
    _id: string;
    userName: string;
    avatar: string;
  };
  componentId: {
    _id: string;
    title: string;
    htmlCode: string;
    cssCode: string;
  };
  totalScore: number;
  averageRating: number;
  ratingsCount: number;
  finalRank?: number;
  status: string;
  submittedAt: string;
}

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<IChallenge | null>(null);
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userComponents, setUserComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [fetchingRole, setFetchingRole] = useState(true);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setFetchingRole(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ User profile fetched:", data);
          setUserRole(data.role);
          localStorage.setItem("userRole", data.role);
        } else {
          console.error("❌ Failed to fetch user profile");
        }
      } catch (error) {
        console.error("❌ Error fetching user role:", error);
      } finally {
        setFetchingRole(false);
      }
    };

    fetchUserRole();
  }, []);

  const isLoggedIn = !!localStorage.getItem("authToken");

  const canRate = userRole !== null && ["reviewer", "moderator", "admin"].includes(userRole);

  const canRateSubmissions = useMemo(() => {
    if (!canRate || !challenge) return false;
    
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    const threeDaysAfterEnd = new Date(endDate);
    threeDaysAfterEnd.setDate(threeDaysAfterEnd.getDate() + 3);
    
    const withinRatingWindow = now <= threeDaysAfterEnd;
    const allowedStatus = ['active', 'rating'].includes(challenge.status);
    const notCompleted = challenge.status !== 'completed';
    
    return allowedStatus && withinRatingWindow && notCompleted;
  }, [canRate, challenge]);

  useEffect(() => {
    if (!fetchingRole) {
      fetchChallengeData();
    }
  }, [id, fetchingRole]);

  const fetchChallengeData = async () => {
    try {
      const [challengeRes, submissionsRes] = await Promise.all([
        fetch(`http://localhost:3000/challenges/${id}`),
        fetch(`http://localhost:3000/challenges/${id}/submissions`),
      ]);

      const challengeData = await challengeRes.json();
      const submissionsData = await submissionsRes.json();

      setChallenge(challengeData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error fetching challenge data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterChallenge = async () => {
    if (!isLoggedIn) {
      alert("Đăng nhập để tham gia thử thách");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/components/user/post", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await res.json();
      setUserComponents(data);
      setShowSubmitModal(true);
    } catch (error) {
      console.error("Error fetching user components:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedComponent) {
      alert("Chọn một thành phần");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/challenges/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          challengeId: id,
          componentId: selectedComponent,
        }),
      });

      if (res.ok) {
        alert("Gửi thành phần đến thử thách thành công!");
        setShowSubmitModal(false);
        fetchChallengeData();
      } else {
        const error = await res.json();
        alert(error.message || "Lỗi gửi thành phần");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Lỗi gửi thành phần");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetchingRole) {
    return (
      <div className="challenge-detail-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="challenge-detail-error">
        <h2>Thử thách không tìm thấy</h2>
        <button onClick={() => navigate("/challenges")}>
          Quay về danh sách thử thách
        </button>
      </div>
    );
  }

  return (
    <div className="challenge-detail">
      {/* Banner Section */}
      <div className="challenge-banner">
        <img 
          src={challenge.bannerImage} 
          alt={challenge.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/1400x400/7c3aed/ffffff?text=Challenge+Banner";
          }}
        />
        <div className="challenge-banner__overlay">
          <div className="challenge-banner__content">
            <div className={`badge badge--${challenge.status}`}>
              {challenge.status}
            </div>
            <h1>{challenge.title}</h1>
          </div>
        </div>
      </div>

      <div className="challenge-detail__container">
        {/* Main Info */}
        <section className="challenge-info">
          <div className="challenge-info__main">
            <div className="challenge-info__description">
              <h2>Về thử thách này</h2>
              <p>{challenge.description}</p>
            </div>

            {challenge.rules && challenge.rules.length > 0 && (
              <div className="challenge-info__rules">
                <h3>📋 Luật</h3>
                <ul>
                  {challenge.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="challenge-info__categories">
              <h3>Danh mục cho phép</h3>
              <div className="category-tags">
                {challenge.allowedCategories.map((cat) => (
                  <span key={cat} className="category-tag">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="challenge-info__sidebar">
            <div className="challenge-stats">
              <div className="stat">
                <span className="stat-label">Ngày bắt đầu</span>
                <span className="stat-value">
                  {new Date(challenge.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Ngày kết thúc</span>
                <span className="stat-value">
                  {new Date(challenge.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Người tham gia</span>
                <span className="stat-value">{challenge.submissionsCount}</span>
              </div>
            </div>

            <div className="challenge-prizes">
              <h3>🏆 Giải thưởng</h3>
              <div className="prize-list">
                <div className="prize-item prize-item--first">
                  <span className="prize-icon">🥇</span>
                  <span className="prize-amount">{challenge.firstPrize} pts</span>
                </div>
                <div className="prize-item prize-item--second">
                  <span className="prize-icon">🥈</span>
                  <span className="prize-amount">{challenge.secondPrize} pts</span>
                </div>
                <div className="prize-item prize-item--third">
                  <span className="prize-icon">🥉</span>
                  <span className="prize-amount">{challenge.thirdPrize} pts</span>
                </div>
              </div>
            </div>

            {challenge.status === "active" && (
              <div className="challenge-actions">
                <button
                  className="enter-challenge-btn enter-challenge-btn--primary"
                  onClick={() => navigate(`/challenges/${id}/create-entry`)}
                >
                  🎨 Tạo thành phần tham gia
                </button>
                <button
                  className="enter-challenge-btn enter-challenge-btn--secondary"
                  onClick={handleEnterChallenge}
                >
                  📦 Gửi thành phần đã có
                </button>
              </div>
            )}

            {canRateSubmissions && (
              <div className="reviewer-info">
                <p className="reviewer-info__text">
                  ⭐ Bạn có thể đánh giá thành phần dưới đây
                </p>
                {challenge.status === 'active' && (
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                    Đánh giá kết thúc vào {new Date(new Date(challenge.endDate).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="challenge-leaderboard">
          <h2>
            {challenge.status === "completed" ? "Winners" : "Leaderboard"}
          </h2>

          {submissions.length === 0 ? (
            <div className="empty-leaderboard">
              <p>Chưa có người tham gia. Hãy là người đầu tiên 🚀</p>
            </div>
          ) : (
            <div className="leaderboard-grid">
              {submissions.map((submission, index) => (
                <div
                  key={submission._id}
                  className={`submission-card ${
                    submission.finalRank ? "submission-card--winner" : ""
                  }`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) {
                      e.stopPropagation();
                    }
                  }}
                >
                  {submission.finalRank && (
                    <div className="submission-rank">
                      <span className="rank-icon">
                        {submission.finalRank === 1
                          ? "🥇"
                          : submission.finalRank === 2
                          ? "🥈"
                          : "🥉"}
                      </span>
                    </div>
                  )}

                  <div className="submission-preview">
                    <ElementPreview
                      htmlCode={submission.componentId.htmlCode}
                      cssCode={submission.componentId.cssCode}
                    />
                  </div>

                  <div className="submission-info">
                    <div className="submission-author">
                      <img
                        src={submission.userId.avatar}
                        alt={submission.userId.userName}
                      />
                      <span>{submission.userId.userName}</span>
                    </div>

                    {/* ✅ Always show score if there are ratings */}
                    {submission.ratingsCount > 0 && (
                      <div className="submission-score">
                        <div className="score-row">
                          <span className="score-label">Tổng số điểm:</span>
                          <span className="score-value">
                            {submission.totalScore.toFixed(1)}
                          </span>
                        </div>
                        <div className="score-row">
                          <span className="score-label">Điểm TB:</span>
                          <span className="score-average">
                            {submission.averageRating.toFixed(2)}/30
                          </span>
                        </div>
                        <div className="score-row">
                          <span className="score-ratings">
                            ({submission.ratingsCount} {submission.ratingsCount === 1 ? 'rating' : 'ratings'})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Show pending status if no ratings yet */}
                    {submission.ratingsCount === 0 && challenge.status !== 'active' && (
                      <div className="submission-score">
                        <span className="score-pending">
                          ⏳ Đang đợi đánh giá
                        </span>
                      </div>
                    )}

                    {canRateSubmissions && (
                      <button
                        className="rate-submission-btn"
                        onClick={() => {
                          setShowRatingModal(submission._id);
                        }}
                      >
                        ⭐ Đánh giá
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chọn thành phần</h2>
            <p>Chọn một trong những thành phần công khai của bạn</p>

            <div className="component-select-grid">
              {userComponents.length === 0 ? (
                <p className="no-components">
                  Bạn chưa có thành phần công khai nào cả. Hãy tạo cái đầu tiêm!
                </p>
              ) : (
                userComponents.map((comp) => (
                  <div
                    key={comp._id}
                    className={`component-select-card ${
                      selectedComponent === comp._id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedComponent(comp._id)}
                  >
                    <ElementPreview htmlCode={comp.htmlCode} cssCode={comp.cssCode} />
                    <span className="component-title">{comp.title}</span>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn--secondary"
                onClick={() => setShowSubmitModal(false)}
              >
                Quay lại
              </button>
              <button
                className="btn btn--primary"
                onClick={handleSubmit}
                disabled={!selectedComponent || submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 99999 
        }}>
          <RatingModal
            submissionId={showRatingModal}
            onClose={() => {
              setShowRatingModal(null);
            }}
            onSuccess={() => {
              fetchChallengeData();
              setShowRatingModal(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ChallengeDetail;
