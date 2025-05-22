import { defineStore } from "pinia";
import { api } from "../services/api";

export const useViewerStore = defineStore("viewer", {
  state: () => ({
    loading: false,
    error: null,
  }),

  getters: {
    isCoach: (state) => state.coach,
    isTrainee: (state) => state.trainee,
  },

  actions: {
    async fetchBySocialId(socialId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getBySocialId(socialId);
        this.coach = response.coach;
        this.trainee = response.trainee;
        return response.id;
      } catch (error) {
        this.error = error.message || "無法獲取使用者資料";
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
