import { Coach } from "./coach";
import { TrainingRecord } from "./training-record";

export interface TrainingTimeSlot {
  dayOfWeek: string;
  start: string;
  end: string;
}

export interface TrainingPlan {
  id: number;
  start: string;
  end: string;
  planType: string;
  trainingTimeSlot: TrainingTimeSlot[] | [];
  quota: number;
  coach?: Coach;
  editor: Coach;
  trainingRecord: TrainingRecord[];
}

export interface UpdateTrainingPlan {
  id: number;
  planType: string;
  trainee: number;
  coach: number;
  quota: number;
  editor: number;
  trainingTimeSlot: TrainingTimeSlot[];
}
