import { Trainee } from "./trainee";
import { TrainingPlan } from "./trainingPlan";

export interface TrainingRecord {
  id: number;
  trainee: Trainee;
  trainingPlan: TrainingPlan;
  createdDate: string;
}
