import { Trainee } from "./trainee";
import { TrainingPlan } from "./training-plan";
import { Coach } from "./coach";
import { OpeningCourse } from "./opening-course";

export interface TrainingRecord {
  id: number;
  trainee: Trainee;
  trainingPlan: TrainingPlan;
  createdDate: string;
  editor?: Coach;
  openingCourse?: OpeningCourse;
}

/**
 * 更新訓練紀錄的請求資料
 */
export interface UpdateTrainingRecord {
  id: number;
  trainee: number;
  trainingPlan: number;
  date: string;
  editor: number;
  openingCourse?: number;
}

/**
 * 建立訓練紀錄的請求資料
 */
export interface CreateTrainingRecord {
  trainee: number;
  trainingPlan: number;
  date?: Date;
  editor: number;
  openingCourse?: number;
}

/**
 * 訓練紀錄分頁回傳資料
 */
export interface PageTrainingRecord {
  data: TrainingRecord[];
  totalPages: number;
  currentPage: number;
}
