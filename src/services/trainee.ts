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
  note: string;
  trainingPlan: TrainingPlan[];
  trainingRecord: TrainingRecord[];
}

export interface UpdateTrainee {
  name: string;
  gender: string;
  birthday: string;
  phone: string;
  height: number;
  weight: number;
  note: string;
}
