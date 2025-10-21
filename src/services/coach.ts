import { TrainingPlan } from "./training-plan";

export type CoachType = "Founder" | "Partner" | "Team";

export interface Coach {
  id: number;
  socialId: string;
  name: string;
  coachType?: CoachType;
  coachTrainingPlan: TrainingPlan[];
  editTrainingPlan: TrainingPlan[];
}

export interface CreateCoach {
  name: string;
  coachType: CoachType;
}

export interface UpdateCoach {
  id: number;
  name: string;
  coachType: CoachType;
  socialId: string
}
