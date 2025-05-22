import { defineStore } from 'pinia'
import { api } from '../services/api'

export const useTraineeStore = defineStore('trainee', {
    state: () => ({
        trainees: [],
        currentTrainee: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchById(id) {
            this.loading = true
            this.error = null

            try {
                const response = await api.getByTraineeId(id)
                this.currentTrainee = response
                return this.currentTrainee
            } catch (error) {
                this.error = error.message || '無法獲取學員資料'
                console.error('Failed to fetch student:', error)
                return null
            } finally {
                this.loading = false
            }
        },

        async fetchCoaches() {
            this.loading = true
            this.error = null

            try {
                const response = await api.getCoaches()
                return response
            } catch (error) {
                this.error = error.message || '無法獲取學員資料'
                console.error('Failed to fetch student:', error)
                return null
            } finally {
                this.loading = false
            }
        },

        async updateTrainee(trainee) {
            this.loading = true
            this.error = null

            try {
                const response = await api.updateTrainee(trainee)

                return response
            } catch (error) {
                this.error = error.message || '無法更新學員資料'
                console.error('Failed to update student:', error)
                return null
            } finally {
                this.loading = false
            }
        },

        async createTrainingPlan(trainingPlan) {
            this.loading = true
            this.error = null

            try {
                const response = await api.createTrainingPlan(trainingPlan)

                return response
            } catch (error) {
                this.error = error.message || '無法新增訓練計畫資料'
                console.error('Failed to update student:', error)
                return null
            } finally {
                this.loading = false
            }
        },

        async updateTrainingPlan(trainingPlan) {
            this.loading = true
            this.error = null

            try {
                const response = await api.updateTrainingPlan(trainingPlan)

                return response
            } catch (error) {
                this.error = error.message || '無法更新訓練計畫資料'
                console.error('Failed to update training plan:', error)
                return null
            } finally {
                this.loading = false
            }
        }
    }
}) 