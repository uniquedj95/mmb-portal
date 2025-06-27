import dayjs, { ConfigType } from "dayjs";
import { TableColumnCtx } from "element-plus";

export const STANDARD_DATE = "YYYY-MM-DD";
export const STANDARD_DATETIME = "YYYY-MM-DD HH:mm:ss";
export const DISPLAY_DATE = "DD/MMM/YYYY"
export const DISPLAY_DATETIME = "DD/MMM/YYYY HH:mm:ss"

export function toDisplayDate (date?: ConfigType) {
  return dayjs(date).format(DISPLAY_DATE);
}

export function toDisplayDatetime (datetime?: ConfigType) {
  return dayjs(datetime).format(DISPLAY_DATETIME);
}

export function toStandardDate (date?: ConfigType) {
  return dayjs(date).format(STANDARD_DATE);
}

export function toStandardDatetime (datetime: ConfigType) {
  return dayjs(datetime).format(STANDARD_DATETIME);
}

export function DatatableDateFormatter(_row: any, _column: TableColumnCtx<any>, cellValue: string) {
  return toDisplayDatetime(cellValue);
}

export function isToday(date: ConfigType) {
  return dayjs().isSame(date);
}

/**
 * Check if the current date and time is within the specified range
 * @param {string} day - The day of the week (e.g., "Monday", "Tuesday", etc.)
 * @param {string} startTime - The start time in "HH:mm" format
 * @param {string} endTime - The end time in "HH:mm" format
 * @returns {boolean} - Returns true if the current date and time is within the range, false otherwise
 */
export function isCurrentDatetimeWithinRange(day: string, startTime: string, endTime: string): boolean {
  const currentDate = dayjs();
  const currentDay = currentDate.format("dddd"); // Get the current day of the week (e.g., "Monday")
  const currentTime = currentDate.format("HH:mm"); // Get the current time in "HH:mm" format

  // Check if the current day matches the specified day
  if (currentDay === day) {
    // Check if the current time is within the specified range
    return currentTime >= startTime && currentTime <= endTime;
  }

  return false; // Return false if the current day does not match
}