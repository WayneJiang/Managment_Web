import { TrainingPlan } from "./trainingPlan";
import { TrainingRecord } from "./trainingRecord";

export interface Trainee {
  id: number;
  socialId: string;
  name: string;
  gender: string;
  birthday: string;
  phone: string;
  height: number;
  weight: number;
  trainingPlan: TrainingPlan[];
  trainingRecord: TrainingRecord[];
}
