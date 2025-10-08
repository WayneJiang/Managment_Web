/// <reference types="vite/client" />

import axios from "axios";
import { Coach } from "./coach";
import { Trainee, UpdateTrainee } from "./trainee";
import { Viewer } from "./viewer";
import {
  TrainingRecord,
  UpdateTrainingRecord,
  CreateTrainingRecord,
} from "./training-record";
import {
  OpeningCourse,
  CreateOpeningCourse,
  UpdateOpeningCourse,
} from "./opening-course";
import { UpdateTrainingPlan } from "./training-plan";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export const api = {
  async getBySocialId(socialId: string): Promise<Viewer> {
    try {
      return (await apiClient.get(`/view/${socialId}`)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async getByCoachId(id: number): Promise<Coach> {
    try {
      return (await apiClient.get(`/coach/info/${id}`)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async getTrainees(): Promise<Trainee[]> {
    try {
      return (await apiClient.get(`/trainees`)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async getByTraineeId(id: number): Promise<Trainee> {
    try {
      return (await apiClient.get(`/trainee/info/${id}`)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async getCoaches(): Promise<Coach[]> {
    try {
      return (await apiClient.get(`/coaches`)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async createTrainee(
    socialId: string,
    updateTrainee: UpdateTrainee
  ): Promise<boolean> {
    try {
      return (await apiClient.post(`/trainee/info/${socialId}`, updateTrainee))
        .data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async updateTrainee(
    id: number,
    updateTrainee: UpdateTrainee
  ): Promise<boolean> {
    try {
      return (await apiClient.patch(`/trainee/info/${id}`, updateTrainee)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async createTrainingPlan(
    updateTrainingPlan: UpdateTrainingPlan
  ): Promise<boolean> {
    try {
      return (await apiClient.post(`/trainingPlan`, updateTrainingPlan)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async updateTrainingPlan(
    updateTrainingPlan: UpdateTrainingPlan
  ): Promise<boolean> {
    try {
      return await apiClient.patch(
        `/trainingPlan/${updateTrainingPlan.id}`,
        updateTrainingPlan
      );
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async getByTrainingRecord(
    trainee: number,
    yearMonth: string
  ): Promise<TrainingRecord[]> {
    try {
      return (
        await apiClient.get(`/trainingRecord`, {
          params: {
            trainee,
            yearMonth,
          },
        })
      ).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async getOpeningCourses(): Promise<OpeningCourse[]> {
    try {
      return (await apiClient.get(`/openingCourses`)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法獲取資訊");
    }
  },

  async createOpeningCourse(
    createOpeningCourse: CreateOpeningCourse
  ): Promise<boolean> {
    try {
      return (await apiClient.post(`/openingCourse`, createOpeningCourse)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法建立開課");
    }
  },

  async updateOpeningCourse(
    updateOpeningCourse: UpdateOpeningCourse
  ): Promise<boolean> {
    try {
      return (
        await apiClient.patch(
          `/openingCourse/${updateOpeningCourse.id}`,
          updateOpeningCourse
        )
      ).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法更新開課");
    }
  },

  async deleteOpeningCourse(id: number): Promise<boolean> {
    try {
      return (await apiClient.delete(`/openingCourse/${id}`)).data;
    } catch (error) {
      throw new Error((error as any).response?.data?.message || "無法刪除開課");
    }
  },

  async updateTrainingRecord(
    updateTrainingRecord: UpdateTrainingRecord
  ): Promise<boolean> {
    try {
      return (
        await apiClient.patch(
          `/trainingRecord/${updateTrainingRecord.id}`,
          updateTrainingRecord
        )
      ).data;
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "無法更新訓練記錄"
      );
    }
  },

  async deleteTrainingRecord(id: number): Promise<boolean> {
    try {
      return (await apiClient.delete(`/trainingRecord/${id}`)).data;
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "無法刪除訓練記錄"
      );
    }
  },

  async createTrainingRecord(
    createTrainingRecord: CreateTrainingRecord
  ): Promise<boolean> {
    try {
      return (await apiClient.post(`/trainingRecord`, createTrainingRecord))
        .data;
    } catch (error) {
      throw new Error(
        (error as any).response?.data?.message || "無法建立訓練記錄"
      );
    }
  },
};
