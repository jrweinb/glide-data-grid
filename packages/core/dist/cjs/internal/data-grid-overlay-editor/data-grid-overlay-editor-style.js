"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataGridOverlayEditorStyle = void 0;
const react_1 = require("@linaria/react");
const _exp = /*#__PURE__*/() => p => p.targetY;
const _exp2 = /*#__PURE__*/() => p => p.targetX - 1;
const _exp3 = /*#__PURE__*/() => p => p.targetY - 1;
const _exp4 = /*#__PURE__*/() => p => p.targetWidth + 2;
const _exp5 = /*#__PURE__*/() => p => p.targetHeight + 2;
const _exp6 = /*#__PURE__*/() => p => p.targetY + 10;
const _exp7 = /*#__PURE__*/() => p => Math.max(0, (p.targetHeight - 28) / 2);
exports.DataGridOverlayEditorStyle = /*#__PURE__*/react_1.styled('div')({
  name: "data-grid-overlay-editor-style0",
  class: "gdg-d19meir1",
  propsAsIs: false,
  vars: {
    "d19meir1-0": [_exp(), "px"],
    "d19meir1-1": [_exp2(), "px"],
    "d19meir1-2": [_exp3(), "px"],
    "d19meir1-3": [_exp4(), "px"],
    "d19meir1-4": [_exp5(), "px"],
    "d19meir1-5": [_exp6(), "px"],
    "d19meir1-6": [_exp7(), "px"]
  }
});

