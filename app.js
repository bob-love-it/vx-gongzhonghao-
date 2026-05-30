const THEMES = {
  emerald: { name: "青绿", accent: "#1f6f64", soft: "#e9f4f1" },
  ink: { name: "水墨", accent: "#3f4852", soft: "#f0f2f4" },
  coral: { name: "珊瑚", accent: "#d65f45", soft: "#fff1ed" },
  blue: { name: "科技", accent: "#246bce", soft: "#eef5ff" },
  gold: { name: "金色", accent: "#a66a16", soft: "#fff6e7" },
  rose: { name: "玫红", accent: "#b83968", soft: "#fff0f5" }
};

const editor = document.querySelector("#editor");
const preview = document.querySelector("#preview");
const themeList = document.querySelector("#themeList");
const accentColor = document.querySelector("#accentColor");
const wordCount = document.querySelector("#wordCount");
const toast = document.querySelector("#toast");
const importDialog = document.querySelector("#importDialog");
const plainText = document.querySelector("#plainText");

let currentTheme = THEMES.emerald;

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
};

const setTheme = (themeKey) => {
  currentTheme = { ...THEMES[themeKey] };
  document.documentElement.style.setProperty("--accent", currentTheme.accent);
  document.documentElement.style.setProperty("--accent-soft", currentTheme.soft);
  accentColor.value = currentTheme.accent;
  [...themeList.children].forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === themeKey);
  });
  syncPreview();
};

const renderThemes = () => {
  Object.entries(THEMES).forEach(([key, theme]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-card";
    button.dataset.theme = key;
    button.innerHTML = `<span class="swatch" style="--theme-color:${theme.accent}"></span><span>${theme.name}</span>`;
    button.addEventListener("click", () => setTheme(key));
    themeList.appendChild(button);
  });
  setTheme("emerald");
};

const focusEditor = () => {
  editor.focus();
  return editor;
};

const exec = (command, value = null) => {
  focusEditor();
  document.execCommand(command, false, value);
  syncPreview();
};

const selectionHtml = () => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount || !editor.contains(selection.anchorNode)) {
    return "";
  }
  const temp = document.createElement("div");
  temp.appendChild(selection.getRangeAt(0).cloneContents());
  return temp.innerHTML.trim();
};

const insertHtml = (html) => {
  exec("insertHTML", html);
};

const selectedOrDefault = () => selectionHtml() || "在这里输入内容";

const blocks = {
  quote: () => insertHtml(`<blockquote class="wla-quote">${selectedOrDefault()}</blockquote>`),
  callout: () => insertHtml(`<section class="wla-callout">${selectedOrDefault()}</section>`),
  divider: () => insertHtml(`<section class="wla-divider"><br></section>`),
  button: () => insertHtml(`<section class="wla-button-wrap"><span class="wla-button">${selectedOrDefault()}</span></section>`),
  numbered: () => insertHtml(`<section class="wla-numbered"><strong>1</strong><p>${selectedOrDefault()}</p></section>`),
  note: () => insertHtml(`<section class="wla-note"><p>${selectedOrDefault()}</p></section>`)
};

const cleanForExport = () => {
  const clone = editor.cloneNode(true);
  clone.querySelectorAll("[contenteditable], script, style").forEach((node) => node.removeAttribute("contenteditable"));
  clone.querySelectorAll("*").forEach((node) => {
    node.removeAttribute("data-mce-style");
    node.removeAttribute("spellcheck");
  });
  return clone.innerHTML.trim();
};

const inlineWechatStyles = (html) => {
  const container = document.createElement("article");
  container.innerHTML = html;
  container.querySelectorAll("h2").forEach((node) => {
    node.setAttribute("style", `margin:26px 0 16px;padding-left:12px;border-left:4px solid ${currentTheme.accent};color:#20242a;font-size:21px;line-height:1.45;font-weight:700;`);
  });
  container.querySelectorAll("h3").forEach((node) => {
    node.setAttribute("style", `margin:22px 0 13px;color:${currentTheme.accent};font-size:18px;line-height:1.55;font-weight:700;`);
  });
  container.querySelectorAll("p,li").forEach((node) => {
    node.setAttribute("style", "margin:0 0 16px;color:#20242a;font-size:16px;line-height:1.9;letter-spacing:0;");
  });
  container.querySelectorAll("img").forEach((node) => {
    node.setAttribute("style", "display:block;max-width:100%;height:auto;margin:18px auto;border-radius:6px;");
  });
  container.querySelectorAll(".wla-quote").forEach((node) => {
    node.setAttribute("style", `margin:18px 0;padding:14px 16px;border-left:4px solid ${currentTheme.accent};background:${currentTheme.soft};color:#20242a;font-size:15px;line-height:1.85;`);
    node.removeAttribute("class");
  });
  container.querySelectorAll(".wla-callout").forEach((node) => {
    node.setAttribute("style", `margin:18px 0;padding:16px;border:1px solid ${currentTheme.accent};border-radius:6px;background:${currentTheme.soft};color:#20242a;font-size:15px;line-height:1.85;`);
    node.removeAttribute("class");
  });
  container.querySelectorAll(".wla-divider").forEach((node) => {
    node.setAttribute("style", `width:48px;margin:28px auto;border-top:3px solid ${currentTheme.accent};`);
    node.removeAttribute("class");
  });
  container.querySelectorAll(".wla-button-wrap").forEach((node) => {
    node.setAttribute("style", "margin:22px 0;text-align:center;");
    node.removeAttribute("class");
  });
  container.querySelectorAll(".wla-button").forEach((node) => {
    node.setAttribute("style", `display:inline-block;padding:8px 18px;color:#fff;background:${currentTheme.accent};border-radius:4px;font-size:15px;line-height:1.5;`);
    node.removeAttribute("class");
  });
  container.querySelectorAll(".wla-numbered strong").forEach((node) => {
    node.setAttribute("style", `display:grid;place-items:center;width:34px;height:34px;color:#fff;background:${currentTheme.accent};border-radius:6px;`);
  });
  container.querySelectorAll(".wla-numbered").forEach((node) => {
    node.setAttribute("style", "display:grid;grid-template-columns:34px 1fr;gap:10px;margin:18px 0;align-items:start;");
    node.removeAttribute("class");
  });
  container.querySelectorAll(".wla-note").forEach((node) => {
    node.setAttribute("style", "margin:18px 0;padding:12px 0 12px 14px;border-left:2px solid #dfe4ea;color:#66717d;");
    node.removeAttribute("class");
  });
  return container.innerHTML.trim();
};

const copyText = async (text, successMessage) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch (error) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showToast(successMessage);
  }
};

const copyRich = async () => {
  const html = inlineWechatStyles(cleanForExport());
  if (window.ClipboardItem && navigator.clipboard?.write) {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([preview.innerText], { type: "text/plain" })
    });
    await navigator.clipboard.write([item]);
    showToast("富文本已复制");
    return;
  }
  await copyText(html, "HTML 已复制");
};

const syncPreview = () => {
  preview.innerHTML = editor.innerHTML;
  wordCount.textContent = editor.innerText.replace(/\s/g, "").length;
};

const beautifyArticle = () => {
  editor.querySelectorAll("p").forEach((p) => {
    if (!p.textContent.trim()) p.remove();
  });
  editor.querySelectorAll("b").forEach((b) => {
    const strong = document.createElement("strong");
    strong.innerHTML = b.innerHTML;
    b.replaceWith(strong);
  });
  syncPreview();
  showToast("已整理基础排版");
};

const importPlainText = () => {
  const html = plainText.value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
  editor.innerHTML = html || editor.innerHTML;
  plainText.value = "";
  importDialog.close();
  syncPreview();
  showToast("文本已导入");
};

const downloadHtml = () => {
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>wechat-article</title></head><body>${inlineWechatStyles(cleanForExport())}</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wechat-article.html";
  link.click();
  URL.revokeObjectURL(url);
  showToast("HTML 文件已生成");
};

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => exec(button.dataset.command, button.dataset.value || null));
});

document.querySelectorAll("[data-block]").forEach((button) => {
  button.addEventListener("click", () => blocks[button.dataset.block]());
});

accentColor.addEventListener("input", () => {
  currentTheme.accent = accentColor.value;
  document.documentElement.style.setProperty("--accent", currentTheme.accent);
  syncPreview();
});

editor.addEventListener("input", syncPreview);
document.querySelector("#syncPreviewBtn").addEventListener("click", syncPreview);
document.querySelector("#beautifyBtn").addEventListener("click", beautifyArticle);
document.querySelector("#copyHtmlBtn").addEventListener("click", () => copyText(inlineWechatStyles(cleanForExport()), "HTML 已复制"));
document.querySelector("#copyRichBtn").addEventListener("click", copyRich);
document.querySelector("#downloadBtn").addEventListener("click", downloadHtml);
document.querySelector("#clearBtn").addEventListener("click", () => {
  editor.innerHTML = "<p><br></p>";
  syncPreview();
});
document.querySelector("#importTextBtn").addEventListener("click", () => importDialog.showModal());
document.querySelector("#confirmImportBtn").addEventListener("click", importPlainText);

renderThemes();
syncPreview();
