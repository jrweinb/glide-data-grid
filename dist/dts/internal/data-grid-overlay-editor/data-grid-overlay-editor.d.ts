import * as React from "react";
import { type Theme } from "../../common/styles.js";
import type { GetCellRendererCallback } from "../../cells/cell-types.js";
import { type EditableGridCell, type GridCell, type Item, type ProvideEditorCallback, type Rectangle, type ValidatedGridCell } from "../data-grid/data-grid-types.js";
import type { OverlayImageEditorProps } from "./private/image-overlay-editor.js";
type ImageEditorType = React.ComponentType<OverlayImageEditorProps>;
interface DataGridOverlayEditorProps {
    readonly target: Rectangle;
    readonly cell: Item;
    readonly content: GridCell;
    readonly className?: string;
    readonly id: string;
    readonly initialValue?: string;
    readonly theme: Theme;
    readonly onFinishEditing: (newCell: GridCell | undefined, movement: readonly [-1 | 0 | 1, -1 | 0 | 1]) => void;
    readonly forceEditMode: boolean;
    readonly highlight: boolean;
    readonly imageEditorOverride?: ImageEditorType;
    readonly getCellRenderer: GetCellRendererCallback;
    readonly markdownDivCreateNode?: (content: string) => DocumentFragment;
    readonly provideEditor?: ProvideEditorCallback<GridCell>;
    readonly validateCell?: (cell: Item, newValue: EditableGridCell, prevValue: GridCell) => boolean | ValidatedGridCell;
    readonly isOutsideClick?: (e: MouseEvent | TouchEvent) => boolean;
}
declare const DataGridOverlayEditor: React.FunctionComponent<DataGridOverlayEditorProps>;
export default DataGridOverlayEditor;
