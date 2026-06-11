import { useState, useEffect } from "react";
import axios from "axios";
import "../../Setting/style.scss";
import "./style.scss";

const API_URL = "http://localhost:3000";

const Achievements = () => {
  const [selectedAchievements, setSelectedAchievements] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${API_URL}/profile/achievements`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSelectedAchievements(res.data.achievements || []);
      })
      .catch((err) => console.error("Failed to load achievements:", err));
  }, [token]);

  const handleSave = async () => {
    if (selectedAchievements.length > 4) {
      alert("You can only select up to 4 achievements.");
      return;
    }
    try {
      setIsSaving(true);
      await axios.put(
        `${API_URL}/profile/achievements`,
        { achievements: selectedAchievements },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Achievements saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => setSelectedAchievements([]);

  return (
    <>
      <div className="spgHeader">Achievements</div>
      <div className="spgHint">
        Select up to 4 achievements to display on your profile.
      </div>

      <div className="achievements-section">
        <div className="achievements-slots-label">
          Profile slots ({selectedAchievements.length}/4)
        </div>

        <div className="achievements-slots">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="achievement-slot">
              {selectedAchievements[index] ? (
                <div className="achievement-item">
                  <div className="achievement-content">
                    {selectedAchievements[index]}
                  </div>
                  <button
                    className="remove-achievement"
                    onClick={() => {
                      const x = [...selectedAchievements];
                      x.splice(index, 1);
                      setSelectedAchievements(x);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="empty-slot">
                  <div className="empty-slot-text">Empty Slot</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedAchievements.length === 0 && (
          <div className="no-achievements">
            You haven't earned any achievements yet.
          </div>
        )}
      </div>

      <div className="achievements-actions">
        <button className="achievements-btn-reset" onClick={handleReset}>
          Reset
        </button>

        <button
          className="achievements-btn-save"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </>
  );
};

export default Achievements;
