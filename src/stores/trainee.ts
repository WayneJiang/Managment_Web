import { defineStore } from "pinia";
import { api } from "../services/api";
import type { Trainee, UpdateTrainee } from "../services/trainee";
import type { Coach } from "../services/coach";
import {
  TrainingRecord,
  UpdateTrainingRecord,
} from "../services/trainingRecord";
import { UpdateTrainingPlan } from "../services/trainingPlan";

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
      updateTrainee: UpdateTrainee
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.createTrainee(socialId, updateTrainee);
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
      updateTrainee: UpdateTrainee
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.updateTrainee(id, updateTrainee);
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
      updateTrainingPlan: UpdateTrainingPlan
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.createTrainingPlan(updateTrainingPlan);
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
      updateTrainingPlan: UpdateTrainingPlan
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.updateTrainingPlan(updateTrainingPlan);
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

    async fetchTrainingRecord(
      id: number,
      yearMonth: string
    ): Promise<TrainingRecord[] | null> {
      try {
        const response = await api.getByTrainingRecord(id, yearMonth);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法獲取簽到記錄資料";
        console.error("Failed to get training record:", error);
        throw new Error(errorMessage);
      }
    },

    async updateTrainingRecord(
      updateTrainingRecord: UpdateTrainingRecord
    ): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.updateTrainingRecord(updateTrainingRecord);
        return Boolean(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法更新訓練記錄";
        this.error = errorMessage;
        console.error("Failed to update training record:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteTrainingRecord(id: number): Promise<boolean | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.deleteTrainingRecord(id);
        return Boolean(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法刪除訓練記錄";
        this.error = errorMessage;
        console.error("Failed to delete training record:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 清除載入狀態和錯誤訊息
     */
    clearLoadingState(): void {
      this.loading = false;
      this.error = null;
    },
  },
});
