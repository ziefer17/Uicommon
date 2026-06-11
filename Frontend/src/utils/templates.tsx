// src/pages/templates.ts

export interface TemplateData {
  title: string;
  html: string;
  css: string;
}

export const templates: Record<string, TemplateData> = {
  button: {
    title: "Button",
    html: `<button class="button">Button</button>`,
    css: `.button {
  cursor: pointer;
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  transition: background 0.3s;
}
.button:hover {
  background-color: #4338ca;
}`,
  },

  "toggle switch": {
    title: "Toggle Switch",
    html: `<label class="switch">
  <input type="checkbox">
  <span class="slider"></span>
</label>`,
    css: `.switch {
  position: relative;
  display: inline-block;
  width: 3.5em;
  height: 2em;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 30px;
}
.slider:before {
  content: "";
  position: absolute;
  height: 1.4em;
  width: 1.4em;
  left: 0.3em;
  bottom: 0.3em;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}
.switch input:checked + .slider {
  background-color: #2196F3;
}
.switch input:checked + .slider:before {
  transform: translateX(1.5em);
}`,
  },

  checkbox: {
    title: "Checkbox",
    html: `<label class="checkbox">
  <input type="checkbox">
  <span class="checkmark"></span> Check me
</label>`,
    css: `.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox input {
  display: none;
}
.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #4f46e5;
  border-radius: 4px;
  display: inline-block;
  position: relative;
}
.checkbox input:checked + .checkmark::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 6px;
  width: 5px;
  height: 10px;
  border: solid #4f46e5;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}`,
  },

  card: {
    title: "Card",
    html: `<div class="card">
  <h3>Card Title</h3>
  <p>This is a simple card example.</p>
</div>`,
    css: `.card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
  max-width: 240px;
  text-align: center;
}`,
  },

  loader: {
    title: "Loader",
    html: `<div class="loader"></div>`,
    css: `.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
  },

  input: {
    title: "Input",
    html: `<input class="input" placeholder="Type something..." />`,
    css: `.input {
  border: 1px solid #ccc;
  padding: 8px 12px;
  border-radius: 6px;
  outline: none;
  transition: border 0.3s;
}
.input:focus {
  border-color: #4f46e5;
}`,
  },

  form: {
    title: "Form",
    html: `<form class="form">
  <input type="text" placeholder="Name" />
  <button type="submit">Submit</button>
</form>`,
    css: `.form {
  display: flex;
  gap: 8px;
}
.form input {
  flex: 1;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 6px;
}
.form button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
}`,
  },

  pattern: {
    title: "Pattern",
    html: `<div class="pattern"></div>`,
    css: `.pattern {
  width: 100px;
  height: 100px;
  background: repeating-linear-gradient(
    45deg,
    #4f46e5,
    #4f46e5 10px,
    #a5b4fc 10px,
    #a5b4fc 20px
  );
  border-radius: 6px;
}`,
  },

  "radio buttons": {
    title: "Radio Buttons",
    html: `<div class="radio-group">
  <label><input type="radio" name="opt" checked /> Option 1</label>
  <label><input type="radio" name="opt" /> Option 2</label>
</div>`,
    css: `.radio-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.radio-group input {
  accent-color: #4f46e5;
}`,
  },

  tooltips: {
    title: "Tooltips",
    html: `<div class="tooltip">
  Hover me
  <span class="tooltiptext">Tooltip text</span>
</div>`,
    css: `.tooltip {
  position: relative;
  display: inline-block;
}
.tooltiptext {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  border-radius: 6px;
  padding: 5px 8px;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}`,
  },
};

export const getTemplate = (type: string): TemplateData | null =>
  templates[type.toLowerCase()] || null;
