export function generateFrameworkCode(
  html: string,
  css: string,
  framework: string
) {
  switch (framework) {
    case "react":
      return `export default function Component() {
  return (
    <>
      <style>{\`${css}\`}</style>
      ${html.replace(/class=/g, "className=").replace(/for=/g, "htmlFor=")}
    </>
  );
}`;
    case "vue":
      return `<template>
  ${html}
</template>

<style scoped>
${css}
</style>`;
    case "svelte":
      return `<style>
${css}
</style>

${html}`;
    case "lit":
      return `import { LitElement, html, css } from 'lit';
class MyComponent extends LitElement {
  static styles = css\`${css}\`;
  render() {
    return html\`${html}\`;
  }
}
customElements.define('my-component', MyComponent);`;
    default:
      return html;
  }
}
