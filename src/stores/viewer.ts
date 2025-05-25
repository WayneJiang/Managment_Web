import { defineStore } from "pinia";
import { api } from "../services/api";

interface ViewerState {
  loading: boolean;
  error: string | null;
  coach: boolean;
  trainee: boolean;
}

export const useViewerStore = defineStore("viewer", {
  state: (): ViewerState => ({
    loading: false,
    error: null,
    coach: false,
    trainee: false,
  }),

  getters: {
    isCoach: (state: ViewerState): boolean => state.coach,
    isTrainee: (state: ViewerState): boolean => state.trainee,
  },

  actions: {
    async fetchBySocialId(socialId: string): Promise<number | null> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getBySocialId(socialId);
        this.coach = response.coach;
        this.trainee = response.trainee;
        return response.id;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "無法獲取使用者資料";
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
