import { useEffect, useRef } from "react";

interface ElementPreviewProps {
  htmlCode?: string;
  cssCode?: string;
}

const ElementPreview = ({ htmlCode = "", cssCode }: ElementPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      let decodedHTML = htmlCode;
      let decodedCSS = cssCode;

      try {
        decodedHTML = decodeURIComponent(htmlCode || "");
        decodedCSS = decodeURIComponent(cssCode || "");
      } catch (err) {
        console.warn("⚠️ Decode error:", err);
      }
      let shadow = containerRef.current.shadowRoot;
      if (!shadow) {
        shadow = containerRef.current.attachShadow({ mode: "open" });
      }

      // Xóa nội dung cũ trước khi render mới
      shadow.innerHTML = "";

      // Tạo style riêng cho shadow DOM
      const style = document.createElement("style");
      style.textContent = `
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        ${decodedCSS}
      `;

      const wrapper = document.createElement("div");
      wrapper.innerHTML = decodedHTML;

      shadow.appendChild(style);
      shadow.appendChild(wrapper);
    }
  }, [htmlCode, cssCode]);

  return <div ref={containerRef} className="preview"></div>;
};

export default ElementPreview;
