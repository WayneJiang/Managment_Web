import { defineStore } from "pinia";
import { api } from "../services/api";

export const useCoachStore = defineStore("coach", {
  state: () => ({
    trainees: [],
    currentCoach: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getByCoachId(id);
        this.currentCoach = response;
        return this.currentCoach;
      } catch (error) {
        this.error = error.message || "無法獲取教練資料";
        console.error("Failed to fetch student:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchAll() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getTrainees();
        this.trainee = response;
        return this.trainee;
      } catch (error) {
        this.error = error.message || "無法獲取學員列表";
        console.error("Failed to fetch students:", error);
        return [];
      } finally {
        this.loading = false;
      }
    },
  },
});
