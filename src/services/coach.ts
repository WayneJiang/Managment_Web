import { TrainingPlan } from "./training-plan";

export interface Coach {
  id: number;
  socialId: string;
  name: string;
  coachTrainingPlan: TrainingPlan[];
  editTrainingPlan: TrainingPlan[];
}
