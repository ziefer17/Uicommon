import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style.scss";

import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { EditorView, lineNumbers } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { generateFrameworkCode } from "../../utils/codeGenerator";
import { FiSave, FiSend } from "react-icons/fi";

interface IChallenge {
  _id: string;
  title: string;
  description: string;
  bannerImage: string;
  allowedCategories: string[];
  rules: string[];
  endDate: string;
  status: string;
}

const CreateChallengeEntry = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<IChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch(`http://localhost:3000/challenges/${challengeId}`);
      const data = await res.json();
      setChallenge(data);
      
      // Auto-select category if only one allowed
      if (data.allowedCategories.length === 1) {
        setSelectedCategory(data.allowedCategories[0]);
      }
    } catch (error) {
      console.error("Error fetching challenge:", error);
      setError("Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };

  // Update preview realtime
  useEffect(() => {
    const doc = `
      <style>
        html, body {
          height: 100%;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        ${cssCode}
      </style>
      ${htmlCode}
    `;
    setPreviewSrc(doc);
  }, [htmlCode, cssCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      setError("Please select a category");
      return;
    }

    if (!htmlCode.trim() || !cssCode.trim()) {
      setError("Please provide both HTML and CSS code");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // Generate framework code
      const reactCode = generateFrameworkCode(htmlCode, cssCode, "react");
      const vueCode = generateFrameworkCode(htmlCode, cssCode, "vue");
      const svelteCode = generateFrameworkCode(htmlCode, cssCode, "svelte");
      const litCode = generateFrameworkCode(htmlCode, cssCode, "lit");

      // Step 1: Create the component
      const componentRes = await fetch("http://localhost:3000/components", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title || `${challenge?.title} Entry`,
          htmlCode,
          cssCode,
          reactCode,
          vueCode,
          svelteCode,
          litCode,
          category: selectedCategory,
          status: "public", // Auto-approve challenge entries
          // Flag this as a challenge entry
          challengeId: challengeId,
        }),
      });

      if (!componentRes.ok) {
        throw new Error("Failed to create component");
      }

      const componentData = await componentRes.json();

      // Step 2: Submit to challenge
      const submissionRes = await fetch("http://localhost:3000/challenges/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId: challengeId,
          componentId: componentData._id,
        }),
      });

      if (!submissionRes.ok) {
        const errorData = await submissionRes.json();
        throw new Error(errorData.message || "Failed to submit to challenge");
      }

      alert("Successfully submitted to challenge!");
      navigate(`/challenges/${challengeId}`);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="challenge-entry-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="challenge-entry-error">
        <h2>Challenge not found</h2>
        <button onClick={() => navigate("/challenges")}>Quay lại trang Thử Thách</button>
      </div>
    );
  }

  if (challenge.status !== "active") {
    return (
      <div className="challenge-entry-error">
        <h2>Thử thách này hiện tại chưa chấp nhận thí sinh</h2>
        <p>Status: {challenge.status}</p>
        <button onClick={() => navigate(`/challenges/${challengeId}`)}>
          Xem Thử Thách
        </button>
      </div>
    );
  }

  return (
    <div className="challenge-entry">
      {/* Challenge Info Banner */}
      <div className="challenge-entry__banner">
        <div className="challenge-entry__info">
          <h1>Tạo tác phẩm: {challenge.title}</h1>
          <p>{challenge.description}</p>
          <div className="challenge-entry__meta">
            <span className="meta-item">
              ⏰ Deadline: {new Date(challenge.endDate).toLocaleDateString()}
            </span>
            <span className="meta-item">
              📋 Danh mục: {challenge.allowedCategories.join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      {challenge.rules && challenge.rules.length > 0 && (
        <div className="challenge-entry__rules">
          <h3>📋 Luật lệ</h3>
          <ul>
            {challenge.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Editor */}
      <div className="challenge-entry__editor">
        {/* Left: Preview */}
        <div className="challenge-entry__preview">
          <div className="preview-header">
            <h3>Xem trước</h3>
          </div>
          <iframe
            title="Preview"
            className="preview-iframe"
            srcDoc={previewSrc}
          />
        </div>

        {/* Right: Code Editor */}
        <div className="challenge-entry__code">
          <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <div className="form-group">
              <label>Tên thành phần</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`My ${challenge.title} Entry`}
              />
            </div>

            {/* Category Selection */}
            <div className="form-group">
              <label>Danh mục *</label>
              <div className="category-select">
                {challenge.allowedCategories.map((cat) => (
                  <label key={cat} className="category-option">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Code Tabs */}
            <div className="tabs">
              <div className="tabs__header">
                <button
                  type="button"
                  className={`tabs__button ${
                    activeTab === "html" ? "tabs__button--active" : ""
                  }`}
                  onClick={() => setActiveTab("html")}
                >
                  HTML
                </button>
                <button
                  type="button"
                  className={`tabs__button ${
                    activeTab === "css" ? "tabs__button--active" : ""
                  }`}
                  onClick={() => setActiveTab("css")}
                >
                  CSS
                </button>
              </div>

              <div className="tabs__content">
                {activeTab === "html" && (
                  <CodeMirror
                    value={htmlCode}
                    height="400px"
                    theme={vscodeDark}
                    extensions={[
                      html(),
                      lineNumbers(),
                      EditorView.lineWrapping,
                    ]}
                    onChange={setHtmlCode}
                  />
                )}
                {activeTab === "css" && (
                  <CodeMirror
                    value={cssCode}
                    height="400px"
                    theme={vscodeDark}
                    extensions={[css(), lineNumbers(), EditorView.lineWrapping]}
                    onChange={setCssCode}
                  />
                )}
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            {/* Submit Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => navigate(`/challenges/${challengeId}`)}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSubmitting || !selectedCategory}
              >
                <FiSend />
                <span>
                  {isSubmitting ? "Đang gửi..." : "Gửi tới Thử thách"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChallengeEntry;
