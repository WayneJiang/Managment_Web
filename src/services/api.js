import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = 'ALLOWED_ORIGIN'

export const api = {
    async getBySocialId(socialId) {
        try {
            const response = await axios.get(`/view/${socialId}`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getByCoachId(id) {
        try {
            const response = await axios.get(`/coach/info/${id}`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getTrainees() {
        try {
            const response = await axios.get(`/trainees`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getByTraineeId(id) {
        try {
            const response = await axios.get(`/trainee/info/${id}`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getCoaches() {
        try {
            const response = await axios.get(`/coaches`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async updateTrainee(trainee) {
        try {
            const response = await axios.patch(`/trainee/info/${trainee.id}`, trainee);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法更新資訊');
        }
    },

    async createTrainingPlan(trainingPlan) {
        try {
            const response = await axios.post(`/trainingPlan`, trainingPlan);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法更新資訊');
        }
    },

    async updateTrainingPlan(trainingPlan) {
        try {
            const response = await axios.patch(`/trainingPlan/${trainingPlan.id}`, trainingPlan);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法更新資訊');
        }
    }
}; 