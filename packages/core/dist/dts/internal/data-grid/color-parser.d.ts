/** @category Drawing */
export declare function parseToRgba(color: string): readonly [number, number, number, number];
/** @category Drawing */
export declare function withAlpha(color: string, alpha: number): string;
export declare function blendCache(color: string, background: string | undefined): string;
/** @category Drawing */
export declare function blend(color: string, background: string | undefined): string;
/** @category Drawing */
export declare function interpolateColors(leftColor: string, rightColor: string, val: number): string;
