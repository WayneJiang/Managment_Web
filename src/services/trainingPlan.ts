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
  trainingSlot: TrainingSlot[];
  planQuota: number;
  usedQuota: number;
  trainee: Trainee;
  coach: Coach;
  editor: Coach;
  traininRecord: TrainingRecord[];
}
