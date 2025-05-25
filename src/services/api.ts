/// <reference types="vite/client" />

import axios from "axios";
import { Coach } from "./coach";
import { Trainee } from "./trainee";
import { Viewer } from "./viewer";
import { ModifyTrainingPlan } from "./modifyTrainingPlan";
import { ModifyTrainee } from "./modifyTrainee";

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
    modifyTrainee: ModifyTrainee
  ): Promise<Boolean> {
    try {
      return (await axios.post(`/trainee/info/${socialId}`, modifyTrainee))
        .data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async updateTrainee(
    id: number,
    modifyTrainee: ModifyTrainee
  ): Promise<Boolean> {
    try {
      return (await axios.patch(`/trainee/info/${id}`, modifyTrainee)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async createTrainingPlan(
    modifyTrainingPlan: ModifyTrainingPlan
  ): Promise<Boolean> {
    try {
      return (await axios.post(`/trainingPlan`, modifyTrainingPlan)).data;
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },

  async updateTrainingPlan(
    modifyTrainingPlan: ModifyTrainingPlan
  ): Promise<Boolean> {
    try {
      return await axios.patch(
        `/trainingPlan/${modifyTrainingPlan.id}`,
        modifyTrainingPlan
      );
    } catch (error) {
      console.error("API 請求失敗:", error);
      throw new Error(error.response?.data?.message || "無法獲取資訊");
    }
  },
};
