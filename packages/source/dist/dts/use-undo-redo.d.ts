import type { EditableGridCell, GridCell, GridSelection, Item, DataEditorRef } from "@glideapps/glide-data-grid";
import { type RefObject } from "react";
export declare function useUndoRedo(gridRef: RefObject<DataEditorRef>, getCellContent: (cell: Item) => GridCell, onCellEdited: (cell: Item, newValue: EditableGridCell) => void, onGridSelectionChange?: (newVal: GridSelection) => void): {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onCellEdited: (cell: Item, newValue: EditableGridCell) => void;
    onGridSelectionChange: (newVal: GridSelection) => void;
    gridSelection: GridSelection | null;
};
