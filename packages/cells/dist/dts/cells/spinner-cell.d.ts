import { type CustomCell, type CustomRenderer } from "@glideapps/glide-data-grid";
interface SpinnerCellProps {
    readonly kind: "spinner-cell";
}
export type SpinnerCell = CustomCell<SpinnerCellProps>;
declare const renderer: CustomRenderer<SpinnerCell>;
export default renderer;
