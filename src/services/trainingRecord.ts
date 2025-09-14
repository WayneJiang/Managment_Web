import { Trainee } from "./trainee";
import { TrainingPlan } from "./trainingPlan";

export interface TrainingRecord {
  id: number;
  trainee: Trainee;
  trainingPlan: TrainingPlan;
  createdDate: string;
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
