function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LINK_CLASS =
  "font-medium text-pink-600 underline decoration-pink-300 underline-offset-2 hover:text-pink-700";

function linkHtml(label: string, url: string) {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);
  return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="${LINK_CLASS}">${safeLabel}</a>`;
}

function protectLinks(text: string): { text: string; links: string[] } {
  const links: string[] = [];
  let working = text;

  working = working.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_match, label, url) => {
    const token = `@@LINK${links.length}@@`;
    links.push(linkHtml(String(label), String(url)));
    return token;
  });

  working = working.replace(/(^|[\s(])(https?:\/\/[^\s<>,;]+[^\s<>,;.!?])/g, (_match, prefix, url) => {
    const token = `@@LINK${links.length}@@`;
    const display = String(url)
      .replace(/^https?:\/\/(www\.)?/i, "")
      .replace(/\/$/, "");
    links.push(linkHtml(display.length > 42 ? `${display.slice(0, 39)}…` : display, String(url)));
    return `${prefix}${token}`;
  });

  return { text: working, links };
}

function restoreLinks(html: string, links: string[]) {
  return html.replace(/@@LINK(\d+)@@/g, (_match, index) => links[Number(index)] ?? "");
}

/** Renders basic inline markdown from Annita: **bold**, *italic*, [links](url), and line breaks. */
export function formatChatMarkdown(text: string): string {
  const { text: withTokens, links } = protectLinks(text);
  let html = escapeHtml(withTokens);

  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  html = html.replace(/\n/g, "<br />");
  html = restoreLinks(html, links);

  return html;
}
