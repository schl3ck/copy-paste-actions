import router from "@/router";
import store from "@/store/index";

const gestureMargin = 25;
const minDistForGesture = 10;
const minSpeedForSuccessfulGesture = 0.3;

/** @type { {pageX: number, pageY: number} } */
let initialTouch = null;
/** @type { {pageX: number, pageY: number} } */
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
/** @type {HTMLDivElement} */
let appEl = null;

function setElement() {
  appEl = document.getElementById("app");
}

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
  setElement();
  appEl.classList.add("touch-gesture");
  // perform any actions that are still waiting for the animation end
  while (successfulCallbackQueue.length) {
    successfulCallbackQueue.shift()();
  }
}
/** @param {number} offset */
function setOffset(offset) {
  appEl.style[offset > 0 ? "left" : "right"] = Math.abs(offset) + "px";
}
/** @param {Function} callback */
function successfulGesture(callback) {
  if (callback) successfulCallbackQueue.push(callback);
  const side = backGesture === 2 ? "left" : "right";
  appEl.classList.add("touch-gesture-transition");
  appEl.addEventListener(
    "transitionend",
    () => {
      appEl.classList.remove("touch-gesture", "touch-gesture-transition");
      appEl.style[side] = null;
      let i;
      if (callback && (i = successfulCallbackQueue.indexOf(callback)) >= 0) {
        successfulCallbackQueue.splice(i, 1);
        callback();
      }
    },
    { once: true },
  );
  appEl.style[side] = "100%";
}
function cancelGesture() {
  const side = backGesture === 2 ? "left" : "right";
  appEl.classList.add("touch-gesture-transition");
  appEl.addEventListener(
    "transitionend",
    () => {
      appEl.classList.remove("touch-gesture", "touch-gesture-transition");
      appEl.style[side] = null;
    },
    { once: true },
  );
  appEl.style[side] = "0px";
}

// ============= touch handlers & helpers ================
/**
 * @param {object} options
 * @param {number} options.pageX
 * @param {number} options.pageY
 */
function copyTouch({ pageX, pageY }) {
  return { pageX, pageY };
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
    setElement();

    /** @type {Touch} */
    const touch = evt.touches[0];
    // gesture has to start at the edges
    if (touch.pageX - appEl.offsetLeft <= gestureMargin) {
      backGesture = 1;
    } else if (
      touch.pageX + appEl.offsetLeft
      >= windowWidth() - gestureMargin
    ) {
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
  const initialDiffX = touch.pageX - initialTouch.pageX;
  const initialDiffY = touch.pageY - initialTouch.pageY;

  lastSpeed =
    (touch.pageX - lastTouch.pageX) / (Date.now() - lastTouchTimestamp);
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
          || (touch.pageX >= windowWidth() / 2 && lastSpeed >= 0))
        && canGoBack()
      ) {
        successfulGesture(back);
      } else {
        cancelGesture();
      }
    } else {
      if (
        (-lastSpeed >= minSpeedForSuccessfulGesture
          || (touch.pageX <= windowWidth() / 2 && -lastSpeed >= 0))
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
