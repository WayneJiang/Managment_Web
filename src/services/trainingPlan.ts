import { Coach } from "./coach";
import { Trainee } from "./trainee";
import { TrainingRecord } from "./trainingRecord";

export interface TrainingSlot {
  dayOfWeek: string;
  start: string;
  end: string;
}

export interface TrainingPlan {
  id: number;
  planStartedAt: string;
  planEndedAt: string;
  planType: string;
  trainingSlot: TrainingSlot[] | string;
  planQuota: number;
  usedQuota?: number;
  coach: Coach;
  editor: Coach;
  trainingRecord: TrainingRecord[];
}
