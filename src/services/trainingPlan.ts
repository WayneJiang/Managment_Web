import { Coach } from "./coach";
import { Trainee } from "./trainee";
import { TrainingRecord } from "./trainingRecord";

export interface TrainingPlan {
  id: number;
  planStartedAt: string;
  planEndedAt: string;
  planType: string;
  planQuota: number;
  usedQuota: number;
  trainee: Trainee;
  coach: Coach;
  editor: Coach;
  traininRecord: TrainingRecord[];
}
