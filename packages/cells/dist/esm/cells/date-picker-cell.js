import React from "react";
import { styled } from "@linaria/react";
import { drawTextCell, GridCellKind, TextCellEntry } from "@glideapps/glide-data-grid";
export const StyledInputBox = /*#__PURE__*/styled('input')({
  name: "StyledInputBox",
  class: "gdg-s1wtovjx",
  propsAsIs: false
});
export const formatValueForHTMLInput = (dateKind, date) => {
  if (date === undefined || date === null) {
    return "";
  }
  const isoDate = date.toISOString();
  switch (dateKind) {
    case "date":
      return isoDate.split("T")[0];
    case "datetime-local":
      return isoDate.replace("Z", "");
    case "time":
      return isoDate.split("T")[1].replace("Z", "");
    default:
      throw new Error(`Unknown date kind ${dateKind}`);
  }
};
const Editor = cell => {
  const cellData = cell.value.data;
  const {
    format,
    displayDate
  } = cellData;
  const step = cellData.step !== undefined && !Number.isNaN(Number(cellData.step)) ? Number(cellData.step) : undefined;
  const minValue = cellData.min instanceof Date ? formatValueForHTMLInput(format, cellData.min) : cellData.min;
  const maxValue = cellData.max instanceof Date ? formatValueForHTMLInput(format, cellData.max) : cellData.max;
  let date = cellData.date;
  // Convert timezone offset to milliseconds
  const timezoneOffsetMs = cellData.timezoneOffset ? cellData.timezoneOffset * 60 * 1000 : 0;
  if (timezoneOffsetMs && date) {
    // Adjust based on the timezone offset
    date = new Date(date.getTime() + timezoneOffsetMs);
  }
  const value = formatValueForHTMLInput(format, date);
  if (cell.value.readonly) {
    return React.createElement(TextCellEntry, {
      highlight: true,
      autoFocus: false,
      disabled: true,
      value: displayDate ?? "",
      onChange: () => undefined
    });
  }
  return React.createElement(StyledInputBox, {
    "data-testid": "date-picker-cell",
    required: true,
    type: format,
    defaultValue: value,
    min: minValue,
    max: maxValue,
    step: step,
    autoFocus: true,
    onChange: event => {
      if (isNaN(event.target.valueAsNumber)) {
        // The user has cleared the date, contribute as undefined
        cell.onChange({
          ...cell.value,
          data: {
            ...cell.value.data,
            date: undefined
          }
        });
      } else {
        cell.onChange({
          ...cell.value,
          data: {
            ...cell.value.data,
            // use valueAsNumber because valueAsDate is null for "datetime-local"
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#technical_summary
            date: new Date(event.target.valueAsNumber - timezoneOffsetMs)
          }
        });
      }
    }
  });
};
const renderer = {
  kind: GridCellKind.Custom,
  isMatch: cell => cell.data.kind === "date-picker-cell",
  draw: (args, cell) => {
    const {
      displayDate
    } = cell.data;
    drawTextCell(args, displayDate, cell.contentAlign);
    return true;
  },
  measure: (ctx, cell, theme) => {
    const {
      displayDate
    } = cell.data;
    return ctx.measureText(displayDate).width + theme.cellHorizontalPadding * 2;
  },
  provideEditor: () => ({
    editor: Editor
  }),
  onPaste: (v, d) => {
    let parseDateTimestamp = NaN;
    // We only try to parse the value if it is not empty/undefined/null:
    if (v) {
      // Support for unix timestamps (milliseconds since 1970-01-01):
      parseDateTimestamp = Number(v).valueOf();
      if (Number.isNaN(parseDateTimestamp)) {
        // Support for parsing ISO 8601 date strings:
        parseDateTimestamp = Date.parse(v);
        if (d.format === "time" && Number.isNaN(parseDateTimestamp)) {
          // The pasted value was not a valid date string
          // Try to interpret value as time string instead (HH:mm:ss)
          parseDateTimestamp = Date.parse(`1970-01-01T${v}Z`);
        }
      }
    }
    return {
      ...d,
      date: Number.isNaN(parseDateTimestamp) ? undefined : new Date(parseDateTimestamp)
    };
  }
};
export default renderer;

