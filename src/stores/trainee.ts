import { defineStore } from "pinia";
import { api } from "../services/api";
import type { Trainee } from "../services/trainee";
import type { Coach } from "../services/coach";
import { ModifyTrainingPlan } from "../services/modifyTrainingPlan";
import { ModifyTrainee } from "../services/modifyTrainee";

interface TraineeState {
  trainees: Trainee[];
  currentTrainee: Trainee | null;
  loading: boolean;
  error: string | null;
}

export const useTraineeStore = defineStore("trainee", {
  state: (): TraineeState => ({
    trainees: [],
    currentTrainee: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchById(id: number): Promise<Trainee | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getByTraineeId(id);
        this.currentTrainee = response;
        return this.currentTrainee;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法獲取學員資料";
        this.error = errorMessage;
        console.error("Failed to fetch student:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchCoaches(): Promise<Coach[] | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getCoaches();
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法獲取教練資料";
        this.error = errorMessage;
        console.error("Failed to fetch coaches:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createTrainee(
      socialId: string,
      modifyTrainee: ModifyTrainee
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.createTrainee(socialId, modifyTrainee);
        return Boolean(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法新增學員資料";
        this.error = errorMessage;
        console.error("Failed to create trainee:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateTrainee(
      id: number,
      modifyTrainee: ModifyTrainee
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.updateTrainee(id, modifyTrainee);
        return Boolean(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法更新學員資料";
        this.error = errorMessage;
        console.error("Failed to update trainee:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createTrainingPlan(
      modifyTrainingPlan: ModifyTrainingPlan
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.createTrainingPlan(modifyTrainingPlan);
        return Boolean(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法新增訓練計畫資料";
        this.error = errorMessage;
        console.error("Failed to create training plan:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateTrainingPlan(
      modifyTrainingPlan: ModifyTrainingPlan
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.updateTrainingPlan(modifyTrainingPlan);
        return Boolean(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法更新訓練計畫資料";
        this.error = errorMessage;
        console.error("Failed to update training plan:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
