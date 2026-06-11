import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.scss";

interface IChallenge {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "rating" | "completed";
  submissionsCount: number;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
}

const AdminChallenges = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<IChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerImage: "",
    startDate: "",
    endDate: "",
    rules: [""],
    allowedCategories: [] as string[],
    firstPrize: 2000,
    secondPrize: 1000,
    thirdPrize: 500,
  });

  const categoryOptions = [
    "button",
    "toggle switch",
    "checkbox",
    "card",
    "loader",
    "input",
    "form",
    "pattern",
    "radio buttons",
    "tooltips",
  ];

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await fetch("http://localhost:3000/challenges", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await res.json();
      setChallenges(data);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          ...formData,
          rules: formData.rules.filter((r) => r.trim() !== ""),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
        }),
      });

      if (res.ok) {
        alert("Thử thách tạo thành công!");
        setShowCreateModal(false);
        fetchChallenges();
        resetForm();
      } else {
        alert("Thất bại tạo thử thách");
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      alert("Thất bại tạo thử thách");
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa thử thách này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/challenges/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (res.ok) {
        alert("Thử thách được xóa thành công!");
        fetchChallenges();
      }
    } catch (error) {
      console.error("Error deleting challenge:", error);
    }
  };

  const handleFinalizeChallenge = async (id: string) => {
    if (!confirm("Kết thúc thử thách này và chọn người chiến thắng?")) return;

    try {
      const res = await fetch(`http://localhost:3000/challenges/${id}/finalize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Winners selected! ${data.winners.length} winners announced.`);
        fetchChallenges();
      }
    } catch (error) {
      console.error("Error finalizing challenge:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      bannerImage: "",
      startDate: "",
      endDate: "",
      rules: [""],
      allowedCategories: [],
      firstPrize: 2000,
      secondPrize: 1000,
      thirdPrize: 500,
    });
  };

  const addRule = () => {
    setFormData({ ...formData, rules: [...formData.rules, ""] });
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData({ ...formData, rules: newRules });
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    });
  };

  const toggleCategory = (category: string) => {
    const categories = formData.allowedCategories.includes(category)
      ? formData.allowedCategories.filter((c) => c !== category)
      : [...formData.allowedCategories, category];
    setFormData({ ...formData, allowedCategories: categories });
  };

  if (loading) {
    return (
      <div className="admin-challenges-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-challenges">
      <div className="admin-challenges__header">
        <h1>🏆 Quản Lý Thử Thách</h1>
        <button
          className="btn-create"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Challenge
        </button>
      </div>

      <div className="challenges-list">
        {challenges.map((challenge) => (
          <div key={challenge._id} className="admin-challenge-card">
            <div className="admin-challenge-card__banner">
              <img src={challenge.bannerImage} alt={challenge.title} />
              <span className={`status-badge status-badge--${challenge.status}`}>
                {challenge.status}
              </span>
            </div>

            <div className="admin-challenge-card__content">
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>

              <div className="admin-challenge-card__meta">
                <span>📅 {new Date(challenge.startDate).toLocaleDateString()}</span>
                <span>👥 {challenge.submissionsCount} entries</span>
              </div>

              <div className="admin-challenge-card__actions">
                <button
                  className="btn-view"
                  onClick={() => navigate(`/challenges/${challenge._id}`)}
                >
                  View
                </button>

                {challenge.status === "rating" && (
                  <button
                    className="btn-finalize"
                    onClick={() => handleFinalizeChallenge(challenge._id)}
                  >
                    Finalize
                  </button>
                )}

                <button
                  className="btn-delete"
                  onClick={() => handleDeleteChallenge(challenge._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Challenge</h2>

            <form onSubmit={handleCreateChallenge}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Futuristic Button Challenge"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the challenge..."
                />
              </div>

              <div className="form-group">
                <label>Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.bannerImage}
                  onChange={(e) =>
                    setFormData({ ...formData, bannerImage: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rules</label>
                {formData.rules.map((rule, index) => (
                  <div key={index} className="rule-input">
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      placeholder="Enter a rule..."
                    />
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="btn-remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addRule} className="btn-add-rule">
                  + Add Rule
                </button>
              </div>

              <div className="form-group">
                <label>Allowed Categories *</label>
                <div className="category-checkboxes">
                  {categoryOptions.map((cat) => (
                    <label key={cat} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.allowedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>1st Prize (points)</label>
                  <input
                    type="number"
                    value={formData.firstPrize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstPrize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>2nd Prize (points)</label>
                  <input
                    type="number"
                    value={formData.secondPrize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondPrize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>3rd Prize (points)</label>
                  <input
                    type="number"
                    value={formData.thirdPrize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thirdPrize: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Create Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChallenges;
