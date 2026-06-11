import { useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView, lineNumbers } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import "./style.scss";

interface ExportPopupProps {
  visible: boolean;
  language: string;
  code: string;
  onClose: () => void;
}

const ExportPopup: React.FC<ExportPopupProps> = ({
  visible,
  language,
  code,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("❌ Lỗi khi copy:", err);
    }
  };

  return (
    <div className="export-popup-overlay">
      <div className="export-popup">
        <div className="export-popup__header">
          <h3>Export – {language.toUpperCase()} Code</h3>
          <button className="export-popup__close" onClick={onClose}>
            ✖
          </button>
        </div>

        <CodeMirror
          value={code}
          height="400px"
          theme={vscodeDark}
          extensions={[
            javascript({ jsx: true }),
            lineNumbers(),
            EditorView.lineWrapping,
          ]}
          editable={false}
        />

        <div className="export-popup__footer">
          <button
            className={`export-popup__btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? "✅ Đã copy!" : "📋 Copy code"}
          </button>

          <button className="export-popup__btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPopup;
