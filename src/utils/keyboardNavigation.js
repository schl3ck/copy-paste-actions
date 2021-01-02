import router from "@/router";
import { isiPadiPhoneMac } from "@/utils/utils";

/**
 * Gets the modifiers of a KeyboardEvent and returns them as a bit mask
 * @param {KeyboardEvent} e
 */
function getModifiers(e) {
  return e
    ? (e.altKey && 0b1000) // option key on Mac
      | (e.ctrlKey && 0b0100)
      | (e.metaKey && 0b0010) // command key on Mac
        | (e.shiftKey && 0b0001)
    : 0;
}

export default function setup() {
  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const modifiers = getModifiers(e);

    const back = () => {
      e.preventDefault();
      router.back();
    };
    const forward = () => {
      e.preventDefault();
      router.forward();
    };
    const mainMenu = () => {
      e.preventDefault();
      router.push({ name: "MainMenu" });
    };

    switch (e.key) {
      // ============ back =============
      case "BrowserBack":
        back();
        break;
      case "ArrowLeft":
        // Mac/iOS: Command + Left
        // Windows: Alt + Left
        if (modifiers === (isiPadiPhoneMac ? 0b0010 : 0b1000)) {
          back();
        }
        break;
      case "j":
        // Mac/iOS: Command + j
        // Windows: Ctrl + j
        if (modifiers === (isiPadiPhoneMac ? 0b0010 : 0b0100)) {
          back();
        }
        break;
      case "Backspace":
        if (
          !(e.target instanceof HTMLInputElement)
          && !(e.target instanceof HTMLTextAreaElement)
        ) {
          back();
        }
        break;

      // ============ forward =============
      case "BrowserForward":
        forward();
        break;
      case "ArrowRight":
        // Mac/iOS: Command + Right
        // Windows: Alt + Right
        if (modifiers === (isiPadiPhoneMac ? 0b0010 : 0b1000)) {
          forward();
        }
        break;
      case "k":
        // Mac/iOS: Command + k
        // Windows: Ctrl + k
        if (modifiers === (isiPadiPhoneMac ? 0b0010 : 0b0100)) {
          forward();
        }
        break;

      // ============ main menu =============
      case "BrowserHome":
        mainMenu();
        break;
      case "h":
        // Mac/iOS: Command + h
        // Windows: Ctrl + h
        if (modifiers === (isiPadiPhoneMac ? 0b0100 : 0b0100)) {
          mainMenu();
        }
        break;
    }
  });
}
