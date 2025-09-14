import { Coach } from "./coach";
import { TrainingRecord } from "./trainingRecord";

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
  planQuota: number;
  usedQuota?: number;
  coach?: Coach;
  editor: Coach;
  trainingRecord: TrainingRecord[];
}

export interface UpdateTrainingPlan {
  id: number;
  planType: string;
  planQuota: number;
  trainee: number;
  coach: number;
  editor: number;
  trainingTimeSlot: TrainingTimeSlot[];
}
