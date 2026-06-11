import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./style.scss";

import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { EditorView, lineNumbers } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";

import { generateFrameworkCode } from "../../utils/codeGenerator";
import { getTemplate } from "../../utils/templates";
import { FiRefreshCw, FiSave, FiSend } from "react-icons/fi";

type PageMode = "add" | "edit" | "view";

const COMPONENT_PRICE = 2;

const CATEGORY_LIST = [
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

const AddElement = ({ mode }: { mode: PageMode }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const [title, setTitle] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [showPopup, setShowPopup] = useState(isAdd);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const token = localStorage.getItem("authToken");
  const myAccountId = localStorage.getItem("accountId");

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3000/components/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    })
      .then(async (res) => {
        if (res.status === 403) throw new Error("Bạn không có quyền truy cập.");
        return res.json();
      })
      .then((data) => {
        if (data.status === "draft" && data.accountId === myAccountId) {
          setTitle(data.title);
          setHtmlCode(data.htmlCode);
          setCssCode(data.cssCode);
          setSelectedCategory(data.category || data.type);
          setShowPopup(false);
          return;
        }
        alert("Bạn không có quyền chỉnh sửa.");
        navigate("/elements");
      })
      .catch((err) => {
        alert(err.message);
        navigate("/elements");
      });
  }, [id, mode, token, myAccountId, navigate]);

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

  const handleSelectType = (type: string) => {
    const tpl = getTemplate(type);
    setSelectedCategory(type);
    if (tpl) {
      setTitle(tpl.title);
      setHtmlCode(tpl.html);
      setCssCode(tpl.css);
    }
    setShowPopup(false);
  };

  const handleChangeType = () => {
    if (isEdit) {
      alert("Draft đang chỉnh sửa không được đổi loại.");
      return;
    }
    setShowPopup(true);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: "draft" | "review" = "review"
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const reactCode = generateFrameworkCode(htmlCode, cssCode, "react");
      const vueCode = generateFrameworkCode(htmlCode, cssCode, "vue");
      const svelteCode = generateFrameworkCode(htmlCode, cssCode, "svelte");
      const litCode = generateFrameworkCode(htmlCode, cssCode, "lit");

      if (!selectedCategory) throw new Error("Vui lòng chọn loại component!");

      const url = isEdit
        ? `http://localhost:3000/components/${id}`
        : "http://localhost:3000/components";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title,
          htmlCode,
          cssCode,
          reactCode,
          vueCode,
          svelteCode,
          litCode,
          category: selectedCategory,
          status,
        }),
      });

      if (!res.ok) throw new Error("Không thể lưu element.");

      navigate("/elements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="detail add-element">
      <Link to="/elements">⬅ Quay lại danh sách</Link>
      <h1>
        {isEdit ? "Chỉnh sửa Draft" : isView ? "Xem Component" : "Tạo Component"}
      </h1>

      {/* POPUP CHỌN LOẠI */}
      {showPopup && isAdd && (
        <div className="popup-overlay">
          <div className="popup-modern">
            <div className="popup-header">
              <h2>Chọn loại component</h2>
            </div>
            <div className="popup-grid">
              {CATEGORY_LIST.map((item) => (
                <div
                  key={item}
                  className={`popup-item ${selectedCategory === item ? "selected" : ""}`}
                  onClick={() => setSelectedCategory(item)}
                >
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="popup-footer">
              <button
                className="continue-btn"
                disabled={!selectedCategory}
                onClick={() => handleSelectType(selectedCategory)}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT CHÍNH */}
      <div className="detail__row">
        <div className="detail__preview">
          <iframe
            title="Preview"
            className="preview-iframe"
            srcDoc={previewSrc}
          />
        </div>

        <div className="detail__code-viewer">
          <form id="element-form" onSubmit={(e) => handleSubmit(e)}>
            <div className="form-group">
              <label>Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Button Gradient"
                disabled={isView}
              />
            </div>

            <div className="form-group">
              <label>Giá bán</label>
              <div className="price-fixed-display">
                <span className="price-amount">
                  ${COMPONENT_PRICE.toFixed(2)}
                </span>
                <span className="price-note"> Giá cố định</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <div className="tabs__header">
                <button
                  type="button"
                  className={`tabs__button ${activeTab === "html" ? "tabs__button--active" : ""}`}
                  onClick={() => setActiveTab("html")}
                >
                  HTML
                </button>
                <button
                  type="button"
                  className={`tabs__button ${activeTab === "css" ? "tabs__button--active" : ""}`}
                  onClick={() => setActiveTab("css")}
                >
                  CSS
                </button>
              </div>

              <div className="tabs__content">
                {activeTab === "html" && (
                  <CodeMirror
                    value={htmlCode}
                    height="500px"
                    theme={vscodeDark}
                    extensions={[html(), lineNumbers(), EditorView.lineWrapping]}
                    onChange={setHtmlCode}
                    editable={!isView}
                  />
                )}
                {activeTab === "css" && (
                  <CodeMirror
                    value={cssCode}
                    height="500px"
                    theme={vscodeDark}
                    extensions={[css(), lineNumbers(), EditorView.lineWrapping]}
                    onChange={setCssCode}
                    editable={!isView}
                  />
                )}
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}
          </form>
        </div>
      </div>

      {/* SUBMIT BUTTONS */}
      {!isView && (
        <div className="form-actions">
          <button
            type="button"
            className="action-btn secondary"
            onClick={handleChangeType}
            disabled={isEdit}
          >
            <FiRefreshCw />
            <span>Thay đổi loại</span>
          </button>

          <button
            type="button"
            className="action-btn secondary"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
          >
            <FiSave />
            <span>Lưu lại nháp</span>
          </button>

          <button
            type="submit"
            form="element-form"
            className="action-btn primary"
            disabled={isSubmitting}
          >
            <FiSend />
            <span>{isSubmitting ? "Đang gửi..." : "Gửi cho đánh giá"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AddElement;
