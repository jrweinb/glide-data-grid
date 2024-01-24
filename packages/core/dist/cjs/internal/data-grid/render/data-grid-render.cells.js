"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawCell = exports.drawCells = void 0;
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable unicorn/no-for-loop */
const data_grid_types_js_1 = require("../data-grid-types.js");
const data_grid_lib_js_1 = require("./data-grid-lib.js");
const styles_js_1 = require("../../../common/styles.js");
const color_parser_js_1 = require("../color-parser.js");
const math_js_1 = require("../../../common/math.js");
const data_grid_render_walk_js_1 = require("./data-grid-render.walk.js");
const loadingCell = {
    kind: data_grid_types_js_1.GridCellKind.Loading,
    allowOverlay: false,
};
// preppable items:
// - font
// - fillStyle
// Column draw loop prep cycle
// - Prep item
// - Prep sets props
// - Prep returns list of cared about props
// - Draw item
// - Loop may set some items, if present in args list, set undefined
// - Prep next item, giving previous result
// - If next item type is different, de-prep
// - Result per column
function drawCells(ctx, effectiveColumns, allColumns, height, totalHeaderHeight, translateX, translateY, cellYOffset, rows, getRowHeight, getCellContent, getGroupDetails, getRowThemeOverride, disabledRows, isFocused, drawFocus, freezeTrailingRows, hasAppendRow, drawRegions, damage, selection, prelightCells, highlightRegions, imageLoader, spriteManager, hoverValues, hoverInfo, drawCellCallback, hyperWrapping, outerTheme, enqueue, renderStateProvider, getCellRenderer, overrideCursor, minimumCellWidth) {
    let toDraw = damage?.size ?? Number.MAX_SAFE_INTEGER;
    const frameTime = performance.now();
    let font = outerTheme.baseFontFull;
    ctx.font = font;
    const deprepArg = { ctx };
    const cellIndex = [0, 0];
    const freezeTrailingRowsHeight = freezeTrailingRows > 0 ? (0, data_grid_lib_js_1.getFreezeTrailingHeight)(rows, freezeTrailingRows, getRowHeight) : 0;
    let result;
    let handledSpans = undefined;
    const skipPoint = (0, data_grid_render_walk_js_1.getSkipPoint)(drawRegions);
    (0, data_grid_render_walk_js_1.walkColumns)(effectiveColumns, cellYOffset, translateX, translateY, totalHeaderHeight, (c, drawX, colDrawStartY, clipX, startRow) => {
        const diff = Math.max(0, clipX - drawX);
        const colDrawX = drawX + diff;
        const colDrawY = totalHeaderHeight + 1;
        const colWidth = c.width - diff;
        const colHeight = height - totalHeaderHeight - 1;
        if (drawRegions.length > 0) {
            let found = false;
            for (let i = 0; i < drawRegions.length; i++) {
                const dr = drawRegions[i];
                if ((0, math_js_1.intersectRect)(colDrawX, colDrawY, colWidth, colHeight, dr.x, dr.y, dr.width, dr.height)) {
                    found = true;
                    break;
                }
            }
            if (!found)
                return;
        }
        const reclip = () => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(colDrawX, colDrawY, colWidth, colHeight);
            ctx.clip();
        };
        const colSelected = selection.columns.hasIndex(c.sourceIndex);
        const groupTheme = getGroupDetails(c.group ?? "").overrideTheme;
        const colTheme = c.themeOverride === undefined && groupTheme === undefined
            ? outerTheme
            : (0, styles_js_1.mergeAndRealizeTheme)(outerTheme, groupTheme, c.themeOverride);
        const colFont = colTheme.baseFontFull;
        if (colFont !== font) {
            font = colFont;
            ctx.font = colFont;
        }
        reclip();
        let prepResult = undefined;
        (0, data_grid_render_walk_js_1.walkRowsInCol)(startRow, colDrawStartY, height, rows, getRowHeight, freezeTrailingRows, hasAppendRow, skipPoint, (drawY, row, rh, isSticky, isTrailingRow) => {
            if (row < 0)
                return;
            cellIndex[0] = c.sourceIndex;
            cellIndex[1] = row;
            // if (damage !== undefined && !damage.some(d => d[0] === c.sourceIndex && d[1] === row)) {
            //     return;
            // }
            // if (
            //     drawRegions.length > 0 &&
            //     !drawRegions.some(dr => intersectRect(drawX, drawY, c.width, rh, dr.x, dr.y, dr.width, dr.height))
            // ) {
            //     return;
            // }
            // These are dumb versions of the above. I cannot for the life of believe that this matters but this is
            // the tightest part of the draw loop and the allocations above actually has a very measurable impact
            // on performance. For the love of all that is unholy please keep checking this again in the future.
            // As soon as this doesn't have any impact of note go back to the saner looking code. The smoke test
            // here is to scroll to the bottom of a test case first, then scroll back up while profiling and see
            // how many major GC collections you get. These allocate a lot of objects.
            if (damage !== undefined && !damage.has(cellIndex)) {
                return;
            }
            if (drawRegions.length > 0) {
                let found = false;
                for (let i = 0; i < drawRegions.length; i++) {
                    const dr = drawRegions[i];
                    if ((0, math_js_1.intersectRect)(drawX, drawY, c.width, rh, dr.x, dr.y, dr.width, dr.height)) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    return;
            }
            const rowSelected = selection.rows.hasIndex(row);
            const rowDisabled = disabledRows.hasIndex(row);
            const cell = row < rows ? getCellContent(cellIndex) : loadingCell;
            let cellX = drawX;
            let cellWidth = c.width;
            let drawingSpan = false;
            let skipContents = false;
            if (cell.span !== undefined) {
                const [startCol, endCol] = cell.span;
                const spanKey = `${row},${startCol},${endCol},${c.sticky}`; //alloc
                if (handledSpans === undefined)
                    handledSpans = new Set();
                if (!handledSpans.has(spanKey)) {
                    const areas = (0, data_grid_render_walk_js_1.getSpanBounds)(cell.span, drawX, drawY, c.width, rh, c, allColumns);
                    const area = c.sticky ? areas[0] : areas[1];
                    if (!c.sticky && areas[0] !== undefined) {
                        skipContents = true;
                    }
                    if (area !== undefined) {
                        cellX = area.x;
                        cellWidth = area.width;
                        handledSpans.add(spanKey);
                        ctx.restore();
                        prepResult = undefined;
                        ctx.save();
                        ctx.beginPath();
                        const d = Math.max(0, clipX - area.x);
                        ctx.rect(area.x + d, drawY, area.width - d, rh);
                        if (result === undefined) {
                            result = [];
                        }
                        result.push({
                            x: area.x + d,
                            y: drawY,
                            width: area.width - d,
                            height: rh,
                        });
                        ctx.clip();
                        drawingSpan = true;
                    }
                }
                else {
                    toDraw--;
                    return;
                }
            }
            const rowTheme = getRowThemeOverride?.(row);
            const trailingTheme = isTrailingRow && c.trailingRowOptions?.themeOverride !== undefined
                ? c.trailingRowOptions?.themeOverride
                : undefined;
            const theme = cell.themeOverride === undefined && rowTheme === undefined && trailingTheme === undefined
                ? colTheme
                : (0, styles_js_1.mergeAndRealizeTheme)(colTheme, rowTheme, trailingTheme, cell.themeOverride); //alloc
            ctx.beginPath();
            const isSelected = (0, data_grid_lib_js_1.cellIsSelected)(cellIndex, cell, selection);
            let accentCount = (0, data_grid_lib_js_1.cellIsInRange)(cellIndex, cell, selection);
            const spanIsHighlighted = cell.span !== undefined &&
                selection.columns.some(index => cell.span !== undefined && index >= cell.span[0] && index <= cell.span[1] //alloc
                );
            if (isSelected && !isFocused && drawFocus) {
                accentCount = 0;
            }
            else if (isSelected) {
                accentCount = Math.max(accentCount, 1);
            }
            if (spanIsHighlighted) {
                accentCount++;
            }
            if (!isSelected) {
                if (rowSelected)
                    accentCount++;
                if (colSelected && !isTrailingRow)
                    accentCount++;
            }
            const bgCell = cell.kind === data_grid_types_js_1.GridCellKind.Protected ? theme.bgCellMedium : theme.bgCell;
            let fill;
            if (isSticky || bgCell !== outerTheme.bgCell) {
                fill = (0, color_parser_js_1.blend)(bgCell, fill);
            }
            if (accentCount > 0 || rowDisabled) {
                if (rowDisabled) {
                    fill = (0, color_parser_js_1.blend)(theme.bgHeader, fill);
                }
                for (let i = 0; i < accentCount; i++) {
                    fill = (0, color_parser_js_1.blend)(theme.accentLight, fill);
                }
            }
            else if (prelightCells !== undefined) {
                for (const pre of prelightCells) {
                    if (pre[0] === c.sourceIndex && pre[1] === row) {
                        fill = (0, color_parser_js_1.blend)(theme.bgSearchResult, fill);
                        break;
                    }
                }
            }
            if (highlightRegions !== undefined) {
                for (let i = 0; i < highlightRegions.length; i++) {
                    const region = highlightRegions[i];
                    const r = region.range;
                    if (region.style !== "solid-outline" &&
                        r.x <= c.sourceIndex &&
                        c.sourceIndex < r.x + r.width &&
                        r.y <= row &&
                        row < r.y + r.height) {
                        fill = (0, color_parser_js_1.blend)(region.color, fill);
                    }
                }
            }
            let didDamageClip = false;
            if (damage !== undefined) {
                // we want to clip each cell individually rather than form a super clip region. The reason for
                // this is passing too many clip regions to the GPU at once can cause a performance hit. This
                // allows us to damage a large number of cells at once without issue.
                const top = drawY + 1;
                const bottom = isSticky
                    ? top + rh - 1
                    : Math.min(top + rh - 1, height - freezeTrailingRowsHeight);
                const h = bottom - top;
                // however, not clipping at all is even better. We want to clip if we are the left most col
                // or overlapping the bottom clip area.
                if (h !== rh - 1 || cellX + 1 <= clipX) {
                    didDamageClip = true;
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(cellX + 1, top, cellWidth - 1, h);
                    ctx.clip();
                }
                // we also need to make sure to wipe the contents. Since the fill can do that lets repurpose
                // that call to avoid an extra draw call.
                fill = fill === undefined ? theme.bgCell : (0, color_parser_js_1.blend)(fill, theme.bgCell);
            }
            const isLastColumn = c.sourceIndex === allColumns.length - 1;
            const isLastRow = row === rows - 1;
            if (fill !== undefined) {
                ctx.fillStyle = fill;
                if (prepResult !== undefined) {
                    prepResult.fillStyle = fill;
                }
                if (damage !== undefined) {
                    // this accounts for the fill handle outline being drawn inset on these cells. We do this
                    // because technically the bottom right corner of the outline are on other cells.
                    ctx.fillRect(cellX + 1, drawY + 1, cellWidth - (isLastColumn ? 2 : 1), rh - (isLastRow ? 2 : 1));
                }
                else {
                    ctx.fillRect(cellX, drawY, cellWidth, rh);
                }
            }
            if (cell.style === "faded") {
                ctx.globalAlpha = 0.6;
            }
            let hoverValue;
            for (let i = 0; i < hoverValues.length; i++) {
                const hv = hoverValues[i];
                if (hv.item[0] === c.sourceIndex && hv.item[1] === row) {
                    hoverValue = hv;
                    break;
                }
            }
            if (cellWidth > minimumCellWidth && !skipContents) {
                const cellFont = theme.baseFontFull;
                if (cellFont !== font) {
                    ctx.font = cellFont;
                    font = cellFont;
                }
                prepResult = drawCell(ctx, cell, c.sourceIndex, row, isLastColumn, isLastRow, cellX, drawY, cellWidth, rh, accentCount > 0, theme, fill ?? theme.bgCell, imageLoader, spriteManager, hoverValue?.hoverAmount ?? 0, hoverInfo, hyperWrapping, frameTime, drawCellCallback, prepResult, enqueue, renderStateProvider, getCellRenderer, overrideCursor);
            }
            if (didDamageClip) {
                ctx.restore();
            }
            if (cell.style === "faded") {
                ctx.globalAlpha = 1;
            }
            toDraw--;
            if (drawingSpan) {
                ctx.restore();
                prepResult?.deprep?.(deprepArg);
                prepResult = undefined;
                reclip();
                font = colFont;
                ctx.font = colFont;
            }
            return toDraw <= 0;
        });
        ctx.restore();
        return toDraw <= 0;
    });
    return result;
}
exports.drawCells = drawCells;
const allocatedItem = [0, 0];
const reusableRect = { x: 0, y: 0, width: 0, height: 0 };
const drawState = [undefined, () => undefined];
let animationFrameRequested = false;
function animRequest() {
    animationFrameRequested = true;
}
function drawCell(ctx, cell, col, row, isLastCol, isLastRow, x, y, w, h, highlighted, theme, finalCellFillColor, imageLoader, spriteManager, hoverAmount, hoverInfo, hyperWrapping, frameTime, drawCellCallback, lastPrep, enqueue, renderStateProvider, getCellRenderer, overrideCursor) {
    let hoverX;
    let hoverY;
    if (hoverInfo !== undefined && hoverInfo[0][0] === col && hoverInfo[0][1] === row) {
        hoverX = hoverInfo[1][0];
        hoverY = hoverInfo[1][1];
    }
    let result = undefined;
    allocatedItem[0] = col;
    allocatedItem[1] = row;
    reusableRect.x = x;
    reusableRect.y = y;
    reusableRect.width = w;
    reusableRect.height = h;
    drawState[0] = renderStateProvider.getValue(allocatedItem);
    drawState[1] = (val) => renderStateProvider.setValue(allocatedItem, val); //alloc
    animationFrameRequested = false;
    const args = {
        //alloc
        ctx,
        theme,
        col,
        row,
        cell,
        rect: reusableRect,
        highlighted,
        cellFillColor: finalCellFillColor,
        hoverAmount,
        frameTime,
        hoverX,
        drawState,
        hoverY,
        imageLoader,
        spriteManager,
        hyperWrapping,
        overrideCursor: hoverX !== undefined ? overrideCursor : undefined,
        requestAnimationFrame: animRequest,
    };
    const needsAnim = (0, data_grid_lib_js_1.drawLastUpdateUnderlay)(args, cell.lastUpdated, frameTime, lastPrep, isLastCol, isLastRow);
    const r = getCellRenderer(cell);
    if (r !== undefined) {
        if (lastPrep?.renderer !== r) {
            lastPrep?.deprep?.(args);
            lastPrep = undefined;
        }
        const partialPrepResult = r.drawPrep?.(args, lastPrep);
        if (drawCellCallback !== undefined && !(0, data_grid_types_js_1.isInnerOnlyCell)(args.cell)) {
            drawCellCallback(args, () => r.draw(args, cell));
        }
        else {
            r.draw(args, cell);
        }
        result =
            partialPrepResult === undefined
                ? undefined
                : {
                    deprep: partialPrepResult?.deprep,
                    fillStyle: partialPrepResult?.fillStyle,
                    font: partialPrepResult?.font,
                    renderer: r,
                };
    }
    if (needsAnim || animationFrameRequested)
        enqueue?.(allocatedItem);
    return result;
}
exports.drawCell = drawCell;
//# sourceMappingURL=data-grid-render.cells.js.map