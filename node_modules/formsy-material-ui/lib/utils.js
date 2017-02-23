'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setMuiComponentAndMaybeFocus = setMuiComponentAndMaybeFocus;
exports.debounce = debounce;
function setMuiComponentAndMaybeFocus(c) {
  if (c === this.muiComponent) return;

  this.muiComponent = c;

  if (c && typeof c.focus === 'function') {
    this.focus = function () {
      return c.focus();
    };
  } else if (this.hasOwnProperty('focus')) {
    delete this.focus;
  }
}

function debounce(fn, delay) {
  var timeout = void 0;
  return function () {
    var _this = this;

    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(_this, args);
    }, delay);
  };
}