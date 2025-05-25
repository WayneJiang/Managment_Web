export interface ModifyTrainingPlan {
  id: number;
  planType: string;
  planQuota: number;
  trainee: number;
  coach: number;
  editor: number;
}
