import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
    async getBySocialId(socialId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/view/${socialId}`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getByCoachId(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/coach/info/${id}`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getTrainees() {
        try {
            const response = await axios.get(`${API_BASE_URL}/trainees`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getByTraineeId(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/trainee/info/${id}`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async getCoaches() {
        try {
            const response = await axios.get(`${API_BASE_URL}/coaches`);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法獲取資訊');
        }
    },

    async updateTrainee(trainee) {
        try {
            const response = await axios.put(`${API_BASE_URL}/trainee/info/${trainee.id}`, trainee);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法更新資訊');
        }
    },

    async createTrainingPlan(trainingPlan) {
        try {
            const response = await axios.post(`${API_BASE_URL}/trainingPlan`, trainingPlan);
            return response.data;
        } catch (error) {
            console.error('API 請求失敗:', error);
            throw new Error(error.response?.data?.message || '無法更新資訊');
        }
    }
}; 