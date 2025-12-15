import { Trainee } from "./trainee";
import { TrainingPlan } from "./training-plan";
import { Coach } from "./coach";

export interface TrainingRecord {
  id: number;
  trainee: Trainee;
  trainingPlan: TrainingPlan;
  createdDate: string;
  editor?: Coach;
}

/**
 * 更新訓練記錄的請求資料
 */
export interface UpdateTrainingRecord {
  id: number;
  trainee: number;
  trainingPlan: number;
  date: string;
  editor: number;
}

/**
 * 建立訓練記錄的請求資料
 */
export interface CreateTrainingRecord {
  trainee: number;
  trainingPlan: number;
  date?: Date;
  editor: number;
}

/**
 * 訓練記錄分頁回傳資料
 */
export interface PageTrainingRecord {
  data: TrainingRecord[];
  totalPages: number;
  currentPage: number;
}
