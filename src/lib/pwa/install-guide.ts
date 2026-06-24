import { APP_TITLE } from "@/lib/jj-branding";

export const INSTALL_GUIDE_STORAGE_KEY = "wedding-install-guide-dismissed";

export type InstallGuideVariant =
  | "ios-safari"
  | "ios-chrome"
  | "ios-other"
  | "android-chrome"
  | "android-samsung"
  | "android-firefox"
  | "android-edge"
  | "android-other"
  | "desktop-chrome"
  | "desktop-edge"
  | "desktop-safari"
  | "generic";

export type InstallGuideContent = {
  variant: InstallGuideVariant;
  platformLabel: string;
  browserLabel: string;
  title: string;
  subtitle: string;
  steps: string[];
  tip?: string;
};

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

export function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const fullscreenMedia = window.matchMedia("(display-mode: fullscreen)").matches;
  const minimalUiMedia = window.matchMedia("(display-mode: minimal-ui)").matches;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standaloneMedia || fullscreenMedia || minimalUiMedia || iosStandalone;
}

export function hasSeenInstallGuide(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(INSTALL_GUIDE_STORAGE_KEY) === "1";
}

export function markInstallGuideSeen(): void {
  localStorage.setItem(INSTALL_GUIDE_STORAGE_KEY, "1");
}

export function shouldShowInstallGuide(): boolean {
  return !isAppInstalled() && !hasSeenInstallGuide();
}

export function detectInstallGuideVariant(): InstallGuideVariant {
  if (typeof navigator === "undefined") return "generic";

  const ua = navigator.userAgent;

  if (isIosDevice()) {
    if (/CriOS/.test(ua)) return "ios-chrome";
    if (/FxiOS|EdgiOS|OPiOS/.test(ua)) return "ios-other";
    if (/Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(ua)) return "ios-safari";
    return "ios-other";
  }

  if (isAndroidDevice()) {
    if (/SamsungBrowser/.test(ua)) return "android-samsung";
    if (/Firefox/.test(ua)) return "android-firefox";
    if (/EdgA/.test(ua)) return "android-edge";
    if (/Chrome/.test(ua)) return "android-chrome";
    return "android-other";
  }

  if (/Edg\//.test(ua)) return "desktop-edge";
  if (/Chrome/.test(ua) && !/Edg|OPR/.test(ua)) return "desktop-chrome";
  if (/Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua)) return "desktop-safari";

  return "generic";
}

const GUIDE_CONTENT: Record<InstallGuideVariant, Omit<InstallGuideContent, "variant">> = {
  "ios-safari": {
    platformLabel: "iPhone / iPad",
    browserLabel: "Safari",
    title: "Add to Home Screen",
    subtitle: `Install ${APP_TITLE} like an app for quick access on wedding weekend.`,
    steps: [
      "Make sure you're on jarodandjamiewedding.com in Safari (not another browser).",
      "Tap the Share button — the square with an arrow pointing up (bottom centre on iPhone, top bar on iPad).",
      "Scroll the share menu and tap Add to Home Screen.",
      "Tap Add in the top corner, then open the new icon from your home screen.",
    ],
    tip: "Safari gives the cleanest install on iPhone. If you don't see Add to Home Screen, scroll down in the share menu.",
  },
  "ios-chrome": {
    platformLabel: "iPhone / iPad",
    browserLabel: "Chrome",
    title: "Add to Home Screen",
    subtitle: `Install ${APP_TITLE} for one-tap access — Safari steps work in Chrome too.`,
    steps: [
      "Tap the Share button in Chrome (to the right of the address bar, or via the ⋮ menu).",
      "Tap Add to Home Screen (you may need to scroll the menu).",
      "Confirm the name and tap Add.",
      "Launch the app from your home screen icon — not from the browser tab.",
    ],
    tip: "If Add to Home Screen is missing, open jarodandjamiewedding.com in Safari and use Share → Add to Home Screen there.",
  },
  "ios-other": {
    platformLabel: "iPhone / iPad",
    browserLabel: "your browser",
    title: "Add to Home Screen",
    subtitle: `For the best ${APP_TITLE} install on iPhone, use Safari.`,
    steps: [
      "Copy the link or open jarodandjamiewedding.com in Safari.",
      "In Safari, tap Share (square with arrow up).",
      "Choose Add to Home Screen, then tap Add.",
      "Open the home screen icon to use the wedding app full-screen.",
    ],
    tip: "Most iPhone browsers can add to home screen via Share → Add to Home Screen.",
  },
  "android-chrome": {
    platformLabel: "Android",
    browserLabel: "Chrome",
    title: "Install the app",
    subtitle: `Add ${APP_TITLE} to your home screen in a few taps.`,
    steps: [
      "Open jarodandjamiewedding.com in Chrome.",
      "Tap the menu (⋮) in the top-right, or look for Install app / Add to Home screen in the address bar.",
      "Tap Install app or Add to Home screen, then confirm.",
      "Open it from your home screen or app drawer — it runs like a native app.",
    ],
    tip: "Some phones show a banner at the bottom saying Install — tap that if you see it.",
  },
  "android-samsung": {
    platformLabel: "Android (Samsung)",
    browserLabel: "Samsung Internet",
    title: "Add page to",
    subtitle: `Save ${APP_TITLE} on your Samsung phone for quick access.`,
    steps: [
      "Open jarodandjamiewedding.com in Samsung Internet.",
      "Tap the menu (☰ or ⋮) at the bottom or top of the screen.",
      "Tap Add page to → Home screen (wording may say Add to Home screen).",
      "Confirm, then open the icon from your home screen.",
    ],
    tip: "You can also try Chrome on Samsung — menu → Install app or Add to Home screen.",
  },
  "android-firefox": {
    platformLabel: "Android",
    browserLabel: "Firefox",
    title: "Add to Home screen",
    subtitle: `Pin ${APP_TITLE} to your home screen.`,
    steps: [
      "Open jarodandjamiewedding.com in Firefox.",
      "Tap the menu (⋮) in the top-right.",
      "Tap Add to Home screen (or Install).",
      "Confirm, then launch from your home screen icon.",
    ],
  },
  "android-edge": {
    platformLabel: "Android",
    browserLabel: "Edge",
    title: "Install the app",
    subtitle: `Add ${APP_TITLE} from Microsoft Edge.`,
    steps: [
      "Open jarodandjamiewedding.com in Edge.",
      "Tap the menu (⋯) at the bottom centre or top-right.",
      "Tap Add to phone or Install app / Add to Home screen.",
      "Open from your home screen when you're done.",
    ],
  },
  "android-other": {
    platformLabel: "Android",
    browserLabel: "your browser",
    title: "Add to Home screen",
    subtitle: `Install ${APP_TITLE} for full-screen wedding access.`,
    steps: [
      "Open jarodandjamiewedding.com in Chrome if you can — it's the easiest on Android.",
      "Open the browser menu (usually ⋮).",
      "Look for Install app, Add to Home screen, or Add page to.",
      "Confirm, then open the new home screen icon.",
    ],
    tip: "Chrome on Android is the most reliable — try that if your browser doesn't show an install option.",
  },
  "desktop-chrome": {
    platformLabel: "Computer",
    browserLabel: "Chrome",
    title: "Install the app",
    subtitle: `Install ${APP_TITLE} on your computer (great for planning on a laptop).`,
    steps: [
      "Open jarodandjamiewedding.com in Chrome.",
      "Click the install icon in the address bar (⊕ or computer-with-arrow), or use menu ⋮ → Install J&J's wedding.",
      "Click Install in the prompt.",
      "Launch it from your apps menu or desktop shortcut.",
    ],
  },
  "desktop-edge": {
    platformLabel: "Computer",
    browserLabel: "Edge",
    title: "Install the app",
    subtitle: `Install ${APP_TITLE} from Edge.`,
    steps: [
      "Open jarodandjamiewedding.com in Edge.",
      "Click the App available icon in the address bar, or menu ⋯ → Apps → Install this site as an app.",
      "Confirm Install.",
      "Open from your Start menu or taskbar.",
    ],
  },
  "desktop-safari": {
    platformLabel: "Mac",
    browserLabel: "Safari",
    title: "Add to Dock",
    subtitle: `On Mac, add ${APP_TITLE} as a web app.`,
    steps: [
      "Open jarodandjamiewedding.com in Safari.",
      "Click File in the menu bar → Add to Dock (macOS Sonoma or later).",
      "Or use Share → Add to Dock if you see it.",
      "Launch from your Dock like any other app.",
    ],
    tip: "On iPhone, use Safari on the phone itself — Mac steps won't install to your phone.",
  },
  generic: {
    platformLabel: "Your device",
    browserLabel: "your browser",
    title: "Install the wedding app",
    subtitle: `Save ${APP_TITLE} for quick, full-screen access.`,
    steps: [
      "Visit jarodandjamiewedding.com in your browser.",
      "On iPhone/iPad (Safari): Share → Add to Home Screen.",
      "On Android (Chrome): Menu → Install app or Add to Home screen.",
      "Open the home screen icon — not a browser bookmark tab.",
    ],
    tip: "Ask Annita Help in the app if you get stuck — she knows the steps for your phone.",
  },
};

export function getInstallGuideContent(variant?: InstallGuideVariant): InstallGuideContent {
  const resolved = variant ?? detectInstallGuideVariant();
  return { variant: resolved, ...GUIDE_CONTENT[resolved] };
}

export function buildInstallGuideKnowledgeForAnnita(): string {
  const sections = (Object.keys(GUIDE_CONTENT) as InstallGuideVariant[])
    .filter((key) => !key.startsWith("desktop"))
    .map((key) => {
      const guide = getInstallGuideContent(key);
      return `### ${guide.platformLabel} — ${guide.browserLabel}
${guide.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}${guide.tip ? `\nTip: ${guide.tip}` : ""}`;
    });

  return `
## Installing the wedding app on your phone
- Official site: jarodandjamiewedding.com
- The app is a **web app** — no App Store or Play Store download. Guests add it to their **home screen** for full-screen access like a native app.
- If they're already opening from a home screen icon with no browser bar, they're installed — no steps needed.
- The login screen shows a one-time install guide; after dismissing it, they won't see it again unless they clear site data.
- Always ask what phone and browser they use (iPhone Safari, iPhone Chrome, Android Chrome, Samsung Internet, etc.) then give the matching steps below — don't guess.

${sections.join("\n\n")}
`;
}
