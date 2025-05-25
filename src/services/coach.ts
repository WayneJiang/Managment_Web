import { TrainingPlan } from "./trainingPlan";

export interface Coach {
  id: number;
  socialId: string;
  name: string;
  coachTrainingPlan: TrainingPlan[];
  editTrainingPlan: TrainingPlan[];
}
