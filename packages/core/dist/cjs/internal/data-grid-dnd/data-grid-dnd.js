"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable unicorn/consistent-destructuring */
const clamp_js_1 = __importDefault(require("lodash/clamp.js"));
const React = __importStar(require("react"));
const data_grid_js_1 = __importDefault(require("../data-grid/data-grid.js"));
// Dear Past Jason,
// Wtf does this function do? If you remember in the future come back and add a comment
// -- Future-Past Jason
function offsetColumnSize(column, width, min, max) {
    return (0, clamp_js_1.default)(Math.round(width - (column.growOffset ?? 0)), Math.ceil(min), Math.floor(max));
}
const DataGridDnd = p => {
    const [resizeColStartX, setResizeColStartX] = React.useState();
    const [resizeCol, setResizeCol] = React.useState();
    const [dragCol, setDragCol] = React.useState();
    const [dropCol, setDropCol] = React.useState();
    const [dragColActive, setDragColActive] = React.useState(false);
    const [dragStartX, setDragStartX] = React.useState();
    const [dragRow, setDragRow] = React.useState();
    const [dropRow, setDropRow] = React.useState();
    const [dragRowActive, setDragRowActive] = React.useState(false);
    const [dragStartY, setDragStartY] = React.useState();
    const { onHeaderMenuClick, getCellContent, onColumnMoved, onColumnResize, onColumnResizeStart, onColumnResizeEnd, gridRef, maxColumnWidth, minColumnWidth, onRowMoved, lockColumns, onColumnProposeMove, onMouseDown, onMouseUp, onItemHovered, onDragStart, canvasRef, } = p;
    const canResize = (onColumnResize ?? onColumnResizeEnd ?? onColumnResizeStart) !== undefined;
    const { columns, selection } = p;
    const selectedColumns = selection.columns;
    const onItemHoveredImpl = React.useCallback((args) => {
        const [col, row] = args.location;
        if (dragCol !== undefined && dropCol !== col && col >= lockColumns) {
            setDragColActive(true);
            setDropCol(col);
        }
        else if (dragRow !== undefined && row !== undefined) {
            setDragRowActive(true);
            setDropRow(Math.max(0, row));
        }
        else {
            onItemHovered?.(args);
        }
    }, [dragCol, dragRow, dropCol, onItemHovered, lockColumns]);
    const canDragCol = onColumnMoved !== undefined;
    const onMouseDownImpl = React.useCallback((args) => {
        if (args.button === 0) {
            const [col, row] = args.location;
            if (args.kind === "out-of-bounds" && args.isEdge && canResize) {
                const bounds = gridRef?.current?.getBounds(columns.length - 1, -1);
                if (bounds !== undefined) {
                    setResizeColStartX(bounds.x);
                    setResizeCol(columns.length - 1);
                }
            }
            else if (args.kind === "header" && col >= lockColumns) {
                const canvas = canvasRef?.current;
                if (args.isEdge && canResize && canvas) {
                    setResizeColStartX(args.bounds.x);
                    setResizeCol(col);
                    const rect = canvas.getBoundingClientRect();
                    const scale = rect.width / canvas.offsetWidth;
                    const width = args.bounds.width / scale;
                    onColumnResizeStart?.(columns[col], width, col, width + (columns[col].growOffset ?? 0));
                }
                else if (args.kind === "header" && canDragCol) {
                    setDragStartX(args.bounds.x);
                    setDragCol(col);
                }
            }
            else if (args.kind === "cell" &&
                lockColumns > 0 &&
                col === 0 &&
                row !== undefined &&
                onRowMoved !== undefined) {
                setDragStartY(args.bounds.y);
                setDragRow(row);
            }
        }
        onMouseDown?.(args);
    }, [onMouseDown, canResize, lockColumns, onRowMoved, gridRef, columns, canDragCol, onColumnResizeStart, canvasRef]);
    const onHeaderMenuClickMangled = React.useCallback((col, screenPosition) => {
        if (dragColActive || dragRowActive)
            return;
        onHeaderMenuClick?.(col, screenPosition);
    }, [dragColActive, dragRowActive, onHeaderMenuClick]);
    const lastResizeWidthRef = React.useRef(-1);
    const clearAll = React.useCallback(() => {
        lastResizeWidthRef.current = -1;
        setDragRow(undefined);
        setDropRow(undefined);
        setDragStartY(undefined);
        setDragRowActive(false);
        setDragCol(undefined);
        setDropCol(undefined);
        setDragStartX(undefined);
        setDragColActive(false);
        setResizeCol(undefined);
        setResizeColStartX(undefined);
    }, []);
    const onMouseUpImpl = React.useCallback((args, isOutside) => {
        if (args.button === 0) {
            if (resizeCol !== undefined) {
                // if the column is in selection, the selection may contain extra cols, so lets just re-send the last
                // resize event to all those columns.
                if (selectedColumns?.hasIndex(resizeCol) === true) {
                    for (const c of selectedColumns) {
                        if (c === resizeCol)
                            continue;
                        const col = columns[c];
                        const newSize = offsetColumnSize(col, lastResizeWidthRef.current, minColumnWidth, maxColumnWidth);
                        onColumnResize?.(col, newSize, c, newSize + (col.growOffset ?? 0));
                    }
                }
                const ns = offsetColumnSize(columns[resizeCol], lastResizeWidthRef.current, minColumnWidth, maxColumnWidth);
                onColumnResizeEnd?.(columns[resizeCol], ns, resizeCol, ns + (columns[resizeCol].growOffset ?? 0));
                if (selectedColumns.hasIndex(resizeCol)) {
                    for (const c of selectedColumns) {
                        if (c === resizeCol)
                            continue;
                        const col = columns[c];
                        const s = offsetColumnSize(col, lastResizeWidthRef.current, minColumnWidth, maxColumnWidth);
                        onColumnResizeEnd?.(col, s, c, s + (col.growOffset ?? 0));
                    }
                }
            }
            clearAll();
            if (dragCol !== undefined && dropCol !== undefined) {
                onColumnMoved?.(dragCol, dropCol);
            }
            if (dragRow !== undefined && dropRow !== undefined) {
                onRowMoved?.(dragRow, dropRow);
            }
        }
        onMouseUp?.(args, isOutside);
    }, [
        onMouseUp,
        resizeCol,
        dragCol,
        dropCol,
        dragRow,
        dropRow,
        selectedColumns,
        onColumnResizeEnd,
        columns,
        minColumnWidth,
        maxColumnWidth,
        onColumnResize,
        onColumnMoved,
        onRowMoved,
        clearAll,
    ]);
    const dragOffset = React.useMemo(() => {
        if (dragCol === undefined || dropCol === undefined)
            return undefined;
        if (dragCol === dropCol)
            return undefined;
        if (onColumnProposeMove?.(dragCol, dropCol) === false)
            return undefined;
        return {
            src: dragCol,
            dest: dropCol,
        };
    }, [dragCol, dropCol, onColumnProposeMove]);
    const onMouseMove = React.useCallback((event) => {
        const canvas = canvasRef?.current;
        if (dragCol !== undefined && dragStartX !== undefined) {
            const diff = Math.abs(event.clientX - dragStartX);
            if (diff > 20) {
                setDragColActive(true);
            }
        }
        else if (dragRow !== undefined && dragStartY !== undefined) {
            const diff = Math.abs(event.clientY - dragStartY);
            if (diff > 20) {
                setDragRowActive(true);
            }
        }
        else if (resizeCol !== undefined && resizeColStartX !== undefined && canvas) {
            const rect = canvas.getBoundingClientRect();
            const scale = rect.width / canvas.offsetWidth;
            const newWidth = (event.clientX - resizeColStartX) / scale;
            const column = columns[resizeCol];
            const ns = offsetColumnSize(column, newWidth, minColumnWidth, maxColumnWidth);
            onColumnResize?.(column, ns, resizeCol, ns + (column.growOffset ?? 0));
            lastResizeWidthRef.current = newWidth;
            if (selectedColumns?.first() === resizeCol) {
                for (const c of selectedColumns) {
                    if (c === resizeCol)
                        continue;
                    const col = columns[c];
                    const s = offsetColumnSize(col, lastResizeWidthRef.current, minColumnWidth, maxColumnWidth);
                    onColumnResize?.(col, s, c, s + (col.growOffset ?? 0));
                }
            }
        }
    }, [
        dragCol,
        dragStartX,
        dragRow,
        dragStartY,
        resizeCol,
        resizeColStartX,
        columns,
        minColumnWidth,
        maxColumnWidth,
        onColumnResize,
        selectedColumns,
        canvasRef,
    ]);
    const getMangledCellContent = React.useCallback((cell, forceStrict) => {
        if (dragRow === undefined || dropRow === undefined)
            return getCellContent(cell, forceStrict);
        // eslint-disable-next-line prefer-const
        let [col, row] = cell;
        if (row === dropRow) {
            row = dragRow;
        }
        else {
            if (row > dropRow)
                row -= 1;
            if (row >= dragRow)
                row += 1;
        }
        return getCellContent([col, row], forceStrict);
    }, [dragRow, dropRow, getCellContent]);
    const onDragStartImpl = React.useCallback(args => {
        onDragStart?.(args);
        if (!args.defaultPrevented()) {
            clearAll();
        }
    }, [clearAll, onDragStart]);
    return (React.createElement(data_grid_js_1.default, { accessibilityHeight: p.accessibilityHeight, canvasRef: p.canvasRef, cellXOffset: p.cellXOffset, cellYOffset: p.cellYOffset, columns: p.columns, disabledRows: p.disabledRows, drawFocusRing: p.drawFocusRing, drawHeader: p.drawHeader, drawCell: p.drawCell, enableGroups: p.enableGroups, eventTargetRef: p.eventTargetRef, experimental: p.experimental, fillHandle: p.fillHandle, firstColAccessible: p.firstColAccessible, fixedShadowX: p.fixedShadowX, fixedShadowY: p.fixedShadowY, freezeColumns: p.freezeColumns, getCellRenderer: p.getCellRenderer, getGroupDetails: p.getGroupDetails, getRowThemeOverride: p.getRowThemeOverride, groupHeaderHeight: p.groupHeaderHeight, headerHeight: p.headerHeight, headerIcons: p.headerIcons, height: p.height, highlightRegions: p.highlightRegions, imageWindowLoader: p.imageWindowLoader, resizeColumn: resizeCol, isDraggable: p.isDraggable, isFilling: p.isFilling, isFocused: p.isFocused, onCanvasBlur: p.onCanvasBlur, onCanvasFocused: p.onCanvasFocused, onCellFocused: p.onCellFocused, onContextMenu: p.onContextMenu, onDragEnd: p.onDragEnd, onDragLeave: p.onDragLeave, onDragOverCell: p.onDragOverCell, onDrop: p.onDrop, onKeyDown: p.onKeyDown, onKeyUp: p.onKeyUp, onMouseMove: p.onMouseMove, prelightCells: p.prelightCells, rowHeight: p.rowHeight, rows: p.rows, selection: p.selection, smoothScrollX: p.smoothScrollX, smoothScrollY: p.smoothScrollY, theme: p.theme, freezeTrailingRows: p.freezeTrailingRows, hasAppendRow: p.hasAppendRow, translateX: p.translateX, translateY: p.translateY, verticalBorder: p.verticalBorder, width: p.width, getCellContent: getMangledCellContent, isResizing: resizeCol !== undefined, onHeaderMenuClick: onHeaderMenuClickMangled, isDragging: dragColActive, onItemHovered: onItemHoveredImpl, onDragStart: onDragStartImpl, onMouseDown: onMouseDownImpl, allowResize: canResize, onMouseUp: onMouseUpImpl, dragAndDropState: dragOffset, onMouseMoveRaw: onMouseMove, ref: gridRef }));
};
exports.default = DataGridDnd;
//# sourceMappingURL=data-grid-dnd.js.map