function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LINK_CLASS =
  "font-medium text-pink-600 underline decoration-pink-300 underline-offset-2 hover:text-pink-700";

const NAV_LINK_CLASS =
  "inline-flex align-middle ml-1.5 rounded-full p-0.5 text-pink-600 hover:bg-pink-50 hover:text-pink-700";

const NAV_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`;

function linkHtml(label: string, url: string) {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);
  return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="${LINK_CLASS}">${safeLabel}</a>`;
}

function navigateLinkHtml(url: string) {
  const safeUrl = escapeHtml(url);
  return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="${NAV_LINK_CLASS}" aria-label="Get directions" title="Get directions">${NAV_ICON_SVG}</a>`;
}

function protectLinks(text: string): { text: string; links: string[] } {
  const links: string[] = [];
  let working = text;

  working = working.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_match, label, url) => {
    const token = `@@LINK${links.length}@@`;
    const labelText = String(label);
    if (labelText === "Navigate") {
      links.push(navigateLinkHtml(String(url)));
    } else {
      links.push(linkHtml(labelText, String(url)));
    }
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
