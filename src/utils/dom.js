/* istanbul ignore next */
export const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  }
  return function (element, event, handler) {
    if (element && event && handler) {
      element.attachEvent(`on${event}`, handler);
    }
  };
}());

/* istanbul ignore next */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  }
  return function (element, event, handler) {
    if (element && event) {
      element.detachEvent(`on${event}`, handler);
    }
  };
}());

/**
 *
 * @param obj {HTMLElement}
 * @param cls {String}
 * @returns {*}
 */
export const hasClass = function (obj, cls) {
  return obj.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`));
};

/**
 * @param obj {HTMLElement}
 * @param cls {String}
 */
export const addClass = function (obj, cls) {
  if (!hasClass(obj, cls)) obj.className += ` ${cls}`;
};

/**
 * @param obj {HTMLElement}
 * @param cls {String}
 */
export const removeClass = function (obj, cls) {
  if (hasClass(obj, cls)) {
    const reg = new RegExp(`(\\s|^)${cls}(\\s|$)`);
    obj.className = obj.className.replace(reg, ' ');
  }
};

export const toggleClass = function (obj, cls) {
  if (hasClass(obj, cls)) {
    removeClass(obj, cls);
  } else {
    addClass(obj, cls);
  }
};


const cancelAnimFrame = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.webkitCancelRequestAnimationFrame
  || window.mozCancelRequestAnimationFrame
  || window.oCancelRequestAnimationFrame
  || window.msCancelRequestAnimationFrame;

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame()
 * where possible for better performance
 * @param {object} handle The callback function
 * @returns {void}
 */
export function clearRequestTimeout(handle) {
  if (handle) {
    // eslint-disable-next-line no-unused-expressions
    cancelAnimFrame ? cancelAnimFrame(handle.value) : clearTimeout(handle);
  }
}

const animFrame = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame;

// requestAnimationFrame() shim by Paul Irish
export const requestAnimFrame = (function () {
  return animFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}());


/**
 * Behaves the same as setTimeout except uses requestAnimationFrame()
 * where possible for better performance
 *
 * @param fn {Function}  The callback function
 * @param delay {int}  The delay in milliseconds
 * @returns {object} handle to the timeout object
 */
export function requestTimeout(fn, delay = 300) {
  if (!animFrame) return window.setTimeout(fn, delay);

  const start = new Date().getTime();
  const handle = {};

  const loop = function () {
    const current = new Date().getTime();
    const delta = current - start;
    if (delta >= delay) {
      clearRequestTimeout(handle);
      fn.call();
    } else {
      handle.value = requestAnimFrame(loop);
    }
  };
  handle.value = requestAnimFrame(loop);
  return handle;
}

/**
 * Get page scroll left
 * @returns {number}
 */
export function getPageScrollLeft() {
  const supportPageOffset = window.pageXOffset !== undefined;
  const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

  // eslint-disable-next-line no-nested-ternary
  return supportPageOffset ? window.pageXOffset
    : (isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft);
}

/**
 * Get page scroll top
 * @returns {number}
 */
export function getPageScrollTop() {
  const supportPageOffset = window.pageYOffset !== undefined;
  const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

  // eslint-disable-next-line no-nested-ternary
  return supportPageOffset ? window.pageYOffset
    : (isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop);
}

/**
 * Get element position (with support old browsers)
 * @param {Element} element
 * @returns {{top: number, left: number}}
 */
export function getElementPosition(element) {
  const box = element.getBoundingClientRect();

  const { body, documentElement } = document;

  const scrollTop = getPageScrollTop();
  const scrollLeft = getPageScrollLeft();

  const clientTop = documentElement.clientTop || body.clientTop || 0;
  const clientLeft = documentElement.clientLeft || body.clientLeft || 0;

  const top = box.top + scrollTop - clientTop;
  const left = box.left + scrollLeft - clientLeft;

  return { top, left };
}


/**
 * @returns {boolean}
 */
export function isTouch() {
  return 'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

/**
 * @param {Event} event
 * @returns {number}
 */
export function eventClientX(event) {
  return event.clientX || event.changedTouches[0].clientX;
}

/**
 * @param {Event} event
 * @returns {number}
 */
export function eventClientY(event) {
  return event.clientY || event.changedTouches[0].clientY;
}

/**
 * @param {HTMLElement} $element
 * @param {number} left
 * @param {number} top
 * @param {number} scale
 */
export function transform($element, left, top, scale) {
  $element.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
}

/**
 * @param {HTMLElement} $element
 * @param {number} time
 */
export function transition($element, time) {
  if (time) {
    $element.style.transition = `transform ${time}s`;
  } else {
    $element.style.removeProperty('transition');
  }
}
