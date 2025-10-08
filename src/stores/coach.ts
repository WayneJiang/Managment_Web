import { defineStore } from "pinia";
import { api } from "../services/api";
import { Trainee } from "../services/trainee";
import { Coach } from "../services/coach";
import {
  OpeningCourse,
  CreateOpeningCourse,
  UpdateOpeningCourse,
} from "../services/opening-course";

interface CoachState {
  trainees: Trainee[];
  coaches: Coach[];
  currentCoach: Coach | null;
  openingCourses: OpeningCourse[];
  loading: boolean;
  error: string | null;
}

export const useCoachStore = defineStore("coach", {
  state: (): CoachState => ({
    trainees: [],
    coaches: [],
    currentCoach: null,
    openingCourses: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCoachById(id: number): Promise<Coach | null> {
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
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchCoaches(): Promise<Coach[]> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getCoaches();
        this.coaches = response;
        return this.coaches;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法獲取教練列表";
        this.error = errorMessage;
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchOpeningCourses(): Promise<OpeningCourse[]> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getOpeningCourses();
        this.openingCourses = response;
        return this.openingCourses;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法獲取公開課程列表";
        this.error = errorMessage;
        return [];
      } finally {
        this.loading = false;
      }
    },

    async createOpeningCourse(
      createOpeningCourse: CreateOpeningCourse
    ): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.createOpeningCourse(createOpeningCourse);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法建立公開課程";
        this.error = errorMessage;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateOpeningCourses(
      updateOpeningCourse: UpdateOpeningCourse
    ): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.updateOpeningCourse(updateOpeningCourse);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法更新公開課程";
        this.error = errorMessage;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteOpeningCourse(id: number): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.deleteOpeningCourse(id);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "無法刪除公開課程";
        this.error = errorMessage;
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
