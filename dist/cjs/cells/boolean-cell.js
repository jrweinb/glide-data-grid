"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.booleanCellRenderer = void 0;
const utils_js_1 = require("../common/utils.js");
const data_editor_fns_js_1 = require("../data-editor/data-editor-fns.js");
const data_grid_types_js_1 = require("../internal/data-grid/data-grid-types.js");
const draw_checkbox_js_1 = require("../internal/data-grid/render/draw-checkbox.js");
const defaultCellMaxSize = 20;
exports.booleanCellRenderer = {
    getAccessibilityString: c => c.data?.toString() ?? "false",
    kind: data_grid_types_js_1.GridCellKind.Boolean,
    needsHover: true,
    useLabel: false,
    needsHoverPosition: true,
    measure: () => 50,
    draw: a => drawBoolean(a, a.cell.data, (0, data_grid_types_js_1.booleanCellIsEditable)(a.cell), a.cell.maxSize ?? defaultCellMaxSize),
    onDelete: c => ({
        ...c,
        data: false,
    }),
    onClick: e => {
        const { cell, posX: pointerX, posY: pointerY, bounds, theme } = e;
        const { width, height, x: cellX, y: cellY } = bounds;
        const maxWidth = cell.maxSize ?? defaultCellMaxSize;
        const cellCenterY = Math.floor(bounds.y + height / 2);
        const checkBoxWidth = (0, utils_js_1.getSquareWidth)(maxWidth, height, theme.cellVerticalPadding);
        const posX = (0, utils_js_1.getSquareXPosFromAlign)(cell.contentAlign ?? "center", cellX, width, theme.cellHorizontalPadding, checkBoxWidth);
        const bb = (0, utils_js_1.getSquareBB)(posX, cellCenterY, checkBoxWidth);
        const checkBoxClicked = (0, utils_js_1.pointIsWithinBB)(cellX + pointerX, cellY + pointerY, bb);
        if ((0, data_grid_types_js_1.booleanCellIsEditable)(cell) && checkBoxClicked) {
            return {
                ...cell,
                data: (0, data_editor_fns_js_1.toggleBoolean)(cell.data),
            };
        }
        return undefined;
    },
    onPaste: (toPaste, cell) => {
        let newVal = data_grid_types_js_1.BooleanEmpty;
        if (toPaste.toLowerCase() === "true") {
            newVal = true;
        }
        else if (toPaste.toLowerCase() === "false") {
            newVal = false;
        }
        else if (toPaste.toLowerCase() === "indeterminate") {
            newVal = data_grid_types_js_1.BooleanIndeterminate;
        }
        return newVal === cell.data
            ? undefined
            : {
                ...cell,
                data: newVal,
            };
    },
};
function drawBoolean(args, data, canEdit, maxSize) {
    if (!canEdit && data === data_grid_types_js_1.BooleanEmpty) {
        return;
    }
    const { ctx, hoverAmount, theme, rect, highlighted, hoverX, hoverY, cell: { contentAlign }, } = args;
    const { x, y, width: w, height: h } = rect;
    const hoverEffect = 0.35;
    let alpha = canEdit ? 1 - hoverEffect + hoverEffect * hoverAmount : 0.4;
    if (data === data_grid_types_js_1.BooleanEmpty) {
        alpha *= hoverAmount;
    }
    if (alpha === 0) {
        return;
    }
    ctx.globalAlpha = alpha;
    (0, draw_checkbox_js_1.drawCheckbox)(ctx, theme, data, x, y, w, h, highlighted, hoverX, hoverY, maxSize, contentAlign);
    ctx.globalAlpha = 1;
}
//# sourceMappingURL=boolean-cell.js.map