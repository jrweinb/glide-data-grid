/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable unicorn/no-for-loop */
import {} from "../data-grid-types.js";
import { getStickyWidth, computeBounds, getFreezeTrailingHeight } from "./data-grid-lib.js";
import {} from "../../../common/styles.js";
import { blend, withAlpha } from "../color-parser.js";
import { hugRectToTarget, intersectRect, rectContains, splitRectIntoRegions } from "../../../common/math.js";
import { getSpanBounds, walkColumns, walkRowsInCol } from "./data-grid-render.walk.js";
import {} from "./data-grid-render.cells.js";
export function drawHighlightRings(ctx, width, height, cellXOffset, cellYOffset, translateX, translateY, mappedColumns, freezeColumns, headerHeight, groupHeaderHeight, rowHeight, freezeTrailingRows, rows, allHighlightRegions, theme) {
    const highlightRegions = allHighlightRegions?.filter(x => x.style !== "no-outline");
    if (highlightRegions === undefined || highlightRegions.length === 0)
        return undefined;
    const freezeLeft = getStickyWidth(mappedColumns);
    const freezeBottom = getFreezeTrailingHeight(rows, freezeTrailingRows, rowHeight);
    const splitIndicies = [freezeColumns, 0, mappedColumns.length, rows - freezeTrailingRows];
    const splitLocations = [freezeLeft, 0, width, height - freezeBottom];
    const drawRects = highlightRegions.map(h => {
        const r = h.range;
        const style = h.style ?? "dashed";
        return splitRectIntoRegions(r, splitIndicies, width, height, splitLocations).map(arg => {
            const rect = arg.rect;
            const topLeftBounds = computeBounds(rect.x, rect.y, width, height, groupHeaderHeight, headerHeight + groupHeaderHeight, cellXOffset, cellYOffset, translateX, translateY, rows, freezeColumns, freezeTrailingRows, mappedColumns, rowHeight);
            const bottomRightBounds = rect.width === 1 && rect.height === 1
                ? topLeftBounds
                : computeBounds(rect.x + rect.width - 1, rect.y + rect.height - 1, width, height, groupHeaderHeight, headerHeight + groupHeaderHeight, cellXOffset, cellYOffset, translateX, translateY, rows, freezeColumns, freezeTrailingRows, mappedColumns, rowHeight);
            if (rect.x + rect.width >= mappedColumns.length) {
                bottomRightBounds.width -= 1;
            }
            if (rect.y + rect.height >= rows) {
                bottomRightBounds.height -= 1;
            }
            return {
                color: h.color,
                style,
                clip: arg.clip,
                rect: hugRectToTarget({
                    x: topLeftBounds.x,
                    y: topLeftBounds.y,
                    width: bottomRightBounds.x + bottomRightBounds.width - topLeftBounds.x,
                    height: bottomRightBounds.y + bottomRightBounds.height - topLeftBounds.y,
                }, width, height, 8),
            };
        });
    });
    const drawCb = () => {
        ctx.lineWidth = 1;
        let dashed = false;
        for (const dr of drawRects) {
            for (const s of dr) {
                if (s?.rect !== undefined &&
                    intersectRect(0, 0, width, height, s.rect.x, s.rect.y, s.rect.width, s.rect.height)) {
                    const wasDashed = dashed;
                    const needsClip = !rectContains(s.clip, s.rect);
                    if (needsClip) {
                        ctx.save();
                        ctx.rect(s.clip.x, s.clip.y, s.clip.width, s.clip.height);
                        ctx.clip();
                    }
                    if (s.style === "dashed" && !dashed) {
                        ctx.setLineDash([5, 3]);
                        dashed = true;
                    }
                    else if ((s.style === "solid" || s.style === "solid-outline") && dashed) {
                        ctx.setLineDash([]);
                        dashed = false;
                    }
                    ctx.strokeStyle =
                        s.style === "solid-outline"
                            ? blend(blend(s.color, theme.borderColor), theme.bgCell)
                            : withAlpha(s.color, 1);
                    ctx.strokeRect(s.rect.x + 0.5, s.rect.y + 0.5, s.rect.width - 1, s.rect.height - 1);
                    if (needsClip) {
                        ctx.restore();
                        dashed = wasDashed;
                    }
                }
            }
        }
        if (dashed) {
            ctx.setLineDash([]);
        }
    };
    drawCb();
    return drawCb;
}
export function drawColumnResizeOutline(ctx, yOffset, xOffset, height, style) {
    ctx.beginPath();
    ctx.moveTo(yOffset, xOffset);
    ctx.lineTo(yOffset, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = style;
    ctx.stroke();
    ctx.globalAlpha = 1;
}
export function drawFocusRing(ctx, width, height, cellYOffset, translateX, translateY, effectiveCols, allColumns, theme, totalHeaderHeight, selectedCell, getRowHeight, getCellContent, freezeTrailingRows, hasAppendRow, fillHandle, rows) {
    if (selectedCell.current === undefined)
        return undefined;
    const range = selectedCell.current.range;
    const currentItem = selectedCell.current.cell;
    const fillHandleTarget = [range.x + range.width - 1, range.y + range.height - 1];
    // if the currentItem row greater than rows and the fill handle row is greater than rows, we dont need to draw
    if (currentItem[1] >= rows && fillHandleTarget[1] >= rows)
        return undefined;
    const mustDraw = effectiveCols.some(c => c.sourceIndex === currentItem[0] || c.sourceIndex === fillHandleTarget[0]);
    if (!mustDraw)
        return undefined;
    const [targetCol, targetRow] = selectedCell.current.cell;
    const cell = getCellContent(selectedCell.current.cell);
    const targetColSpan = cell.span ?? [targetCol, targetCol];
    const isStickyRow = targetRow >= rows - freezeTrailingRows;
    const stickRowHeight = freezeTrailingRows > 0 && !isStickyRow
        ? getFreezeTrailingHeight(rows, freezeTrailingRows, getRowHeight) - 1
        : 0;
    const fillHandleRow = fillHandleTarget[1];
    let drawCb = undefined;
    let drawHandleCb = undefined;
    walkColumns(effectiveCols, cellYOffset, translateX, translateY, totalHeaderHeight, (col, drawX, colDrawY, clipX, startRow) => {
        if (col.sticky && targetCol > col.sourceIndex)
            return;
        const isBeforeTarget = col.sourceIndex < targetColSpan[0];
        const isAfterTarget = col.sourceIndex > targetColSpan[1];
        const isFillHandleCol = col.sourceIndex === fillHandleTarget[0];
        if (!isFillHandleCol && (isBeforeTarget || isAfterTarget)) {
            // we dont need to do any drawing on this column but may yet need to draw
            return;
        }
        walkRowsInCol(startRow, colDrawY, height, rows, getRowHeight, freezeTrailingRows, hasAppendRow, undefined, (drawY, row, rh) => {
            if (row !== targetRow && row !== fillHandleRow)
                return;
            let cellX = drawX;
            let cellWidth = col.width;
            const isLastColumn = col.sourceIndex === allColumns.length - 1;
            const isLastRow = row === rows - 1;
            if (cell.span !== undefined) {
                const areas = getSpanBounds(cell.span, drawX, drawY, col.width, rh, col, allColumns);
                const area = col.sticky ? areas[0] : areas[1];
                if (area !== undefined) {
                    cellX = area.x;
                    cellWidth = area.width;
                }
            }
            const doHandle = row === fillHandleRow && isFillHandleCol && fillHandle;
            const doRing = row === targetRow && !isBeforeTarget && !isAfterTarget && drawCb === undefined;
            if (doHandle) {
                drawHandleCb = () => {
                    if (clipX > cellX && !col.sticky && !doRing) {
                        ctx.beginPath();
                        ctx.rect(clipX, 0, width - clipX, height);
                        ctx.clip();
                    }
                    ctx.beginPath();
                    ctx.rect(cellX + cellWidth - 4, drawY + rh - 4, 4, 4);
                    ctx.fillStyle = col.themeOverride?.accentColor ?? theme.accentColor;
                    ctx.fill();
                };
            }
            if (doRing) {
                drawCb = () => {
                    if (clipX > cellX && !col.sticky) {
                        ctx.beginPath();
                        ctx.rect(clipX, 0, width - clipX, height);
                        ctx.clip();
                    }
                    ctx.beginPath();
                    ctx.rect(cellX + 0.5, drawY + 0.5, cellWidth - (isLastColumn ? 1 : 0), rh - (isLastRow ? 1 : 0));
                    ctx.strokeStyle = col.themeOverride?.accentColor ?? theme.accentColor;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                };
            }
            return drawCb !== undefined && (fillHandle ? drawHandleCb !== undefined : true);
        });
        return drawCb !== undefined && (fillHandle ? drawHandleCb !== undefined : true);
    });
    if (drawCb === undefined && drawHandleCb === undefined)
        return undefined;
    const result = () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, totalHeaderHeight, width, height - totalHeaderHeight - stickRowHeight);
        ctx.clip();
        drawCb?.();
        drawHandleCb?.();
        ctx.restore();
    };
    result();
    return result;
}
//# sourceMappingURL=data-grid.render.rings.js.map