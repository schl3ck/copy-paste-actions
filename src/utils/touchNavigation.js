import router from "@/router";
import store from "@/store/index";

const gestureMargin = 25;
const minDistForGesture = 10;
const minSpeedForSuccessfulGesture = 0.3;

/** @type { {clientX: number, clientY: number} } */
let initialTouch = null;
/** @type { {clientX: number, clientY: number} } */
let lastTouch = null;
let lastSpeed = 0;
/** @type {number} */
let lastTouchTimestamp = null;
/**
 * @type { 0 | 1 | 2}
 *
 * `0`: inactive
 * `1`: maybe
 * `2`: active
 */
let backGesture = 0;
/**
 * @type { 0 | 1 | 2}
 *
 * `0`: inactive
 * `1`: maybe
 * `2`: active
 */
let forwardGesture = 0;
const successfulCallbackQueue = [];

const elements = [
  document.body,
  document.querySelector("body > div.navigation-overlay"),
];

// ============= router methods ================
function back() {
  router.back();
  hideHistoryOverview();
}
function forward() {
  router.forward();
  hideHistoryOverview();
}
function hideHistoryOverview() {
  if (store.state.showHistoryOverview) {
    store.commit("showHistoryOverview", false);
  }
}
function canGoBack() {
  return router.history.index > 0;
}
function canGoForward() {
  return router.history.index < router.history.stack.length - 1;
}

// ============= methods for styling (w/ callback queue) ================
function startGesture() {
  elements.forEach((e) => e.classList.add("touch-gesture"));
  while (successfulCallbackQueue.length) {
    successfulCallbackQueue.shift()();
  }
}
/** @param {number} offset */
function setOffset(offset) {
  console.log("setOffset:", offset);
  elements.forEach((e) => {
    e.style[offset > 0 ? "left" : "right"] = Math.abs(offset) + "px";
    e.style[offset > 0 ? "right" : "left"] = null;
  });
}
/** @param {Function} callback */
function successfulGesture(callback) {
  if (callback) successfulCallbackQueue.push(callback);
  const side = backGesture === 2 ? "left" : "right";
  elements.forEach((e) => e.classList.add("touch-gesture-transition"));
  document.body.addEventListener(
    "transitionend",
    () => {
      elements.forEach((e) => {
        e.classList.remove("touch-gesture", "touch-gesture-transition");
        e.style.left = null;
        e.style.right = null;
      });
      let i;
      if (callback && (i = successfulCallbackQueue.indexOf(callback)) >= 0) {
        successfulCallbackQueue.splice(i, 1);
        callback();
      }
    },
    { once: true },
  );
  elements.forEach((e) => (e.style[side] = "100%"));
}
function cancelGesture() {
  const side = backGesture === 2 ? "left" : "right";
  elements.forEach((e) => e.classList.add("touch-gesture-transition"));
  document.body.addEventListener(
    "transitionend",
    () => {
      elements.forEach((e) => {
        e.classList.remove("touch-gesture", "touch-gesture-transition");
        e.style.left = null;
        e.style.right = null;
      });
    },
    { once: true },
  );
  elements.forEach((e) => (e.style[side] = "0px"));
}

// ============= touch handlers & helpers ================
/**
 * @param {object} options
 * @param {number} options.clientX
 * @param {number} options.clientY
 */
function copyTouch({ clientX, clientY }) {
  return { clientX, clientY };
}

function windowWidth() {
  return (
    window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth
  );
}

/**
 * @param {TouchEvent} evt
 */
function handleStart(evt) {
  if (evt.touches.length === 1) {
    forwardGesture = 0;
    backGesture = 0;

    /** @type {Touch} */
    const touch = evt.touches[0];
    // gesture has to start at the edges
    if (touch.clientX <= gestureMargin) {
      backGesture = 1;
    } else if (touch.clientX >= windowWidth() - gestureMargin) {
      forwardGesture = 1;
    }
    if (backGesture || forwardGesture) {
      initialTouch = copyTouch(touch);
      lastTouch = copyTouch(touch);
      lastTouchTimestamp = Date.now();
    }
  } else {
    cancelGesture();
    backGesture = forwardGesture = 0;
  }
}

/**
 * @param {TouchEvent} evt
 */
function handleMove(evt) {
  if (backGesture === 0 && forwardGesture === 0) return;

  const touch = evt.touches[0];
  const initialDiffX = touch.clientX - initialTouch.clientX;
  const initialDiffY = touch.clientY - initialTouch.clientY;

  lastSpeed =
    (touch.clientX - lastTouch.clientX) / (Date.now() - lastTouchTimestamp);
  lastTouch = copyTouch(touch);
  lastTouchTimestamp = Date.now();

  if (backGesture === 1 || forwardGesture === 1) {
    if (Math.abs(initialDiffX) >= minDistForGesture) {
      if (backGesture === 1) {
        backGesture++;
      } else {
        forwardGesture++;
      }
      startGesture();
    } else if (Math.abs(initialDiffY >= minDistForGesture)) {
      backGesture = forwardGesture = 0;
    }
  }
  if (backGesture === 2 || forwardGesture === 2) {
    evt.preventDefault();
    setOffset(initialDiffX);
  }
}

/**
 * @param {TouchEvent} evt
 */
function handleEnd(evt) {
  if (backGesture === 2 || forwardGesture === 2) {
    evt.preventDefault();

    const touch = evt.changedTouches[0];

    if (backGesture === 2) {
      if (
        (lastSpeed >= minSpeedForSuccessfulGesture
          || (touch.clientX >= windowWidth() / 2 && lastSpeed >= 0))
        && canGoBack()
      ) {
        successfulGesture(back);
      } else {
        cancelGesture();
      }
    } else {
      if (
        (-lastSpeed >= minSpeedForSuccessfulGesture
          || (touch.clientX <= windowWidth() / 2 && -lastSpeed >= 0))
        && canGoForward()
      ) {
        successfulGesture(forward);
      } else {
        cancelGesture();
      }
    }
    backGesture = forwardGesture = 0;
  }
}

/**
 * @param {TouchEvent} evt
 */
function handleCancel(evt) {
  if (backGesture === 2 || forwardGesture === 2) {
    evt.preventDefault();
    cancelGesture();
    backGesture = forwardGesture = 0;
  }
}

export default function setupTouchNavigation() {
  window.addEventListener("touchstart", handleStart, { passive: false });
  window.addEventListener("touchend", handleEnd, { passive: false });
  window.addEventListener("touchcancel", handleCancel, { passive: false });
  window.addEventListener("touchmove", handleMove, { passive: false });
}
