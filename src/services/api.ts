/// <reference types="vite/client" />

import axios from "axios";
import { Coach } from "./coach";
import { SearchTrainee, Trainee, UpdateTrainee } from "./trainee";
import { Viewer } from "./viewer";
import { TrainingRecord, UpdateTrainingRecord } from "./trainingRecord";
import {
  OpeningCourse,
  CreateOpeningCourse,
  UpdateOpeningCourse,
} from "./openoingCourse";
import { UpdateTrainingPlan } from "./trainingPlan";

const API_BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

export const api = {
  async getBySocialId(socialId: string): Promise<Viewer> {
    try {
      return (await axios.get(`/view/${socialId}`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async getByCoachId(id: number): Promise<Coach> {
    try {
      return (await axios.get(`/coach/info/${id}`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async getTrainees(): Promise<Trainee[]> {
    try {
      return (await axios.get(`/trainees`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async getByTraineeId(id: number): Promise<Trainee> {
    try {
      return (await axios.get(`/trainee/info/${id}`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async getSearchTrainee(searchTrainee: SearchTrainee): Promise<Trainee[]> {
    try {
      return (await axios.get(`/trainee/search}`, { params: searchTrainee }))
        .data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async getCoaches(): Promise<Coach[]> {
    try {
      return (await axios.get(`/coaches`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async createTrainee(
    socialId: string,
    updateTrainee: UpdateTrainee
  ): Promise<boolean> {
    try {
      return (await axios.post(`/trainee/info/${socialId}`, updateTrainee))
        .data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async updateTrainee(
    id: number,
    updateTrainee: UpdateTrainee
  ): Promise<boolean> {
    try {
      return (await axios.patch(`/trainee/info/${id}`, updateTrainee)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async createTrainingPlan(
    updateTrainingPlan: UpdateTrainingPlan
  ): Promise<boolean> {
    try {
      return (await axios.post(`/trainingPlan`, updateTrainingPlan)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async updateTrainingPlan(
    updateTrainingPlan: UpdateTrainingPlan
  ): Promise<boolean> {
    try {
      return await axios.patch(
        `/trainingPlan/${updateTrainingPlan.id}`,
        updateTrainingPlan
      );
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async getByTrainingRecord(
    trainee: number,
    yearMonth: string
  ): Promise<TrainingRecord[]> {
    try {
      return (
        await axios.get(`/trainingRecord`, {
          params: {
            trainee,
            yearMonth,
          },
        })
      ).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async getOpeningCourses(): Promise<OpeningCourse[]> {
    try {
      return (await axios.get(`/openingCourses`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async createOpeningCourse(
    createOpeningCourse: CreateOpeningCourse
  ): Promise<boolean> {
    try {
      return (await axios.post(`/openingCourse`, createOpeningCourse)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法建立開課");
    }
  },

  async updateOpeningCourse(
    updateOpeningCourse: UpdateOpeningCourse
  ): Promise<boolean> {
    try {
      return (
        await axios.patch(
          `/openingCourse/${updateOpeningCourse.id}`,
          updateOpeningCourse
        )
      ).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法更新開課");
    }
  },

  async deleteOpeningCourse(id: number): Promise<boolean> {
    try {
      return (await axios.delete(`/openingCourse/${id}`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法刪除開課");
    }
  },

  async updateTrainingRecord(
    updateTrainingRecord: UpdateTrainingRecord
  ): Promise<boolean> {
    try {
      return (
        await axios.patch(
          `/trainingRecord/${updateTrainingRecord.id}`,
          updateTrainingRecord
        )
      ).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法更新訓練記錄");
    }
  },

  async deleteTrainingRecord(id: number): Promise<boolean> {
    try {
      return (await axios.delete(`/trainingRecord/${id}`)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法刪除訓練記錄");
    }
  },
};
