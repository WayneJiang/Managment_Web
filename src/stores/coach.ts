import { defineStore } from "pinia";
import { api } from "../services/api";
import { Trainee } from "../services/trainee";
import { Coach } from "../services/coach";

interface CoachState {
  trainees: Trainee[];
  currentCoach: Coach | null;
  loading: boolean;
  error: string | null;
}

export const useCoachStore = defineStore("coach", {
  state: (): CoachState => ({
    trainees: [],
    currentCoach: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchById(id: number): Promise<Coach | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getByCoachId(id);
        this.currentCoach = response;
        return this.currentCoach;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法獲取教練資料";
        this.error = errorMessage;
        console.error("Failed to fetch coach:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchAll(): Promise<Trainee[]> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getTrainees();
        this.trainees = response;
        return this.trainees;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法獲取學員列表";
        this.error = errorMessage;
        console.error("Failed to fetch trainees:", error);
        return [];
      } finally {
        this.loading = false;
      }
    },
  },
});
