import { Coach } from "./coach";

/**
 * 星期幾的枚舉類型
 */
export enum DayOfWeek {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

/**
 * 開課資料傳輸物件 (DTO)
 * 用於前端向後端傳送開課資料時的驗證
 */
export interface OpeningCourseDto {
  name: string;
  dayOfWeek: DayOfWeek;
  start: string;
  end: string;
  note?: string;
  coach: number;
}

/**
 * 開課實體介面
 * 用於從後端接收完整的開課資料
 */
export interface OpeningCourse {
  id: number;
  name: string;
  coach: Coach;
  dayOfWeek: DayOfWeek;
  start: string;
  end: string;
  note: string;
}

/**
 * 建立開課的請求資料
 */
export interface CreateOpeningCourse {
  name: string;
  dayOfWeek: DayOfWeek;
  start: string;
  end: string;
  note?: string;
  coach: number;
}

/**
 * 更新開課的請求資料
 */
export interface UpdateOpeningCourse {
  id: number;
  name: string;
  dayOfWeek: DayOfWeek;
  start: string;
  end: string;
  note?: string;
  coach: number;
}
