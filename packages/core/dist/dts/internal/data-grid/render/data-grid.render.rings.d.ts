import { type GridSelection, type InnerGridCell, type Item } from "../data-grid-types.js";
import { type MappedGridColumn } from "./data-grid-lib.js";
import { type FullTheme } from "../../../common/styles.js";
import { type Highlight } from "./data-grid-render.cells.js";
export declare function drawHighlightRings(ctx: CanvasRenderingContext2D, width: number, height: number, cellXOffset: number, cellYOffset: number, translateX: number, translateY: number, mappedColumns: readonly MappedGridColumn[], freezeColumns: number, headerHeight: number, groupHeaderHeight: number, rowHeight: number | ((index: number) => number), freezeTrailingRows: number, rows: number, allHighlightRegions: readonly Highlight[] | undefined, theme: FullTheme): (() => void) | undefined;
export declare function drawColumnResizeOutline(ctx: CanvasRenderingContext2D, yOffset: number, xOffset: number, height: number, style: string): void;
export declare function drawFocusRing(ctx: CanvasRenderingContext2D, width: number, height: number, cellYOffset: number, translateX: number, translateY: number, effectiveCols: readonly MappedGridColumn[], allColumns: readonly MappedGridColumn[], theme: FullTheme, totalHeaderHeight: number, selectedCell: GridSelection, getRowHeight: (row: number) => number, getCellContent: (cell: Item) => InnerGridCell, freezeTrailingRows: number, hasAppendRow: boolean, fillHandle: boolean, rows: number): (() => void) | undefined;
