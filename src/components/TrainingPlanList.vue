<template>
  <div class="w-full">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div
        v-for="trainingPlan in trainingPlans"
        :key="trainingPlan.id"
        class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        }"
      >
        <div class="card-body p-3 sm:p-4">
          <div class="flex justify-between items-start mb-3">
            <div
              class="badge badge-lg"
              :class="{
                'badge-primary': trainingPlan.planType === 'personal',
                'badge-secondary': trainingPlan.planType !== 'personal',
              }"
            >
              {{ getPlanTypeLabel(trainingPlan.planType) }}
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span class="text-sm opacity-80">計畫開始</span>
              <span class="text-sm font-medium">
                {{ formatDateTime(trainingPlan.planStartedAt) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <svg
                class="w-4 h-4 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="text-sm opacity-80">計畫結束</span>
              <span class="text-sm font-medium">
                {{ formatDateTime(trainingPlan.planEndedAt) }}
              </span>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <svg
                class="w-4 h-4 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <span class="font-semibold text-sm opacity-80">指導教練</span>
            </div>
            <div class="text-base font-medium">
              {{ trainingPlan.coach?.name || "未指定" }}
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <svg
                class="w-4 h-4 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span class="font-semibold text-sm opacity-80">訓練時段</span>
            </div>
            <div class="space-y-1">
              <div
                v-if="getTrainingSlots(trainingPlan).length > 0"
                v-for="(slot, slotIndex) in getTrainingSlots(trainingPlan)"
                :key="slotIndex"
                class="text-xs p-2 rounded bg-base-200"
                :style="{ backgroundColor: 'var(--color-border)' }"
              >
                {{ formatTrainingSlotText(slot) }}
              </div>
              <div v-else class="text-base italic text-error">
                尚未設定訓練時段
              </div>
            </div>
          </div>

          <div
            class="flex justify-between items-center pt-3 border-t mb-4"
            :style="{ borderColor: 'var(--color-border)' }"
          >
            <div class="text-center">
              <div class="font-semibold text-sm opacity-80">總額度</div>
              <div class="font-bold text-lg">
                {{ trainingPlan.planQuota }}
              </div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-sm opacity-80">已使用</div>
              <div
                class="font-bold text-lg"
                :class="getUsedQuotaClass(trainingPlan)"
              >
                {{ trainingPlan.usedQuota || 0 }}
              </div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-sm opacity-80">剩餘</div>
              <div class="font-bold text-lg text-info">
                {{ getRemainingQuota(trainingPlan) }}
              </div>
            </div>
          </div>

          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <svg
                class="w-4 h-4 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              <span class="font-semibold text-sm opacity-80">編輯者</span>
            </div>
            <div class="text-base font-medium">
              {{ trainingPlan.editor?.name || "" }}
            </div>
          </div>

          <div
            class="card-actions justify-end pt-3 border-t"
            :style="{ borderColor: 'var(--color-border)' }"
          >
            <button
              class="btn btn-sm"
              :style="{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                borderColor: 'var(--color-primary)',
              }"
              @click="handleEdit(trainingPlan)"
            >
              編輯
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="trainingPlans.length === 0" class="text-center py-8">
      <svg
        class="w-16 h-16 mx-auto opacity-50 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        ></path>
      </svg>
      <p class="text-lg opacity-70">尚無訓練計畫</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { TrainingPlan, TrainingTimeSlot } from "../services/trainingPlan";

dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps<{
  trainingPlans: TrainingPlan[];
}>();

const emit = defineEmits<{
  (e: "edit", trainingPlan: TrainingPlan): void;
}>();

/**
 * 格式化日期時間
 */
const formatDateTime = (timestamp: string | undefined): string => {
  if (!timestamp) return "未設定";

  try {
    return dayjs(timestamp).tz("Asia/Taipei").format("MM/DD HH:mm");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "日期錯誤";
  }
};

/**
 * 獲取計畫類型標籤
 */
const getPlanTypeLabel = (planType: string): string => {
  if (!planType) return "未知類型";

  const planTypeMap: Record<string, string> = {
    personal: "個人教練",
    block: "團體課程",
    sequential: "開放團課",
  };

  return planTypeMap[planType] || planType;
};

/**
 * 獲取已使用額度的樣式類別
 */
const getUsedQuotaClass = (trainingPlan: TrainingPlan): string => {
  const usedQuota = trainingPlan.usedQuota || 0;
  const planQuota = trainingPlan.planQuota;

  if (usedQuota < planQuota) {
    return "text-success";
  } else if (usedQuota === planQuota) {
    return "text-warning";
  } else {
    return "text-error";
  }
};

/**
 * 計算剩餘額度
 */
const getRemainingQuota = (trainingPlan: TrainingPlan): number => {
  const usedQuota = trainingPlan.usedQuota || 0;
  const planQuota = trainingPlan.planQuota;

  return Math.max(0, planQuota - usedQuota);
};

/**
 * 獲取訓練時段列表
 */
const getTrainingSlots = (trainingPlan: TrainingPlan): TrainingTimeSlot[] => {
  if (!trainingPlan?.trainingTimeSlot) {
    return [];
  }

  if (Array.isArray(trainingPlan.trainingTimeSlot)) {
    return trainingPlan.trainingTimeSlot;
  }

  return [];
};

/**
 * 格式化訓練時段文字
 */
const formatTrainingSlotText = (slot: TrainingTimeSlot): string => {
  if (!slot || typeof slot !== "object") {
    return "無效的時段資料";
  }

  if (!slot.dayOfWeek || !slot.start || !slot.end) {
    return "時段資料不完整";
  }

  const dayOfWeekMap: Record<string, string> = {
    Monday: "星期一",
    Tuesday: "星期二",
    Wednesday: "星期三",
    Thursday: "星期四",
    Friday: "星期五",
    Saturday: "星期六",
    Sunday: "星期日",
  };

  const dayName = dayOfWeekMap[slot.dayOfWeek] || slot.dayOfWeek;
  return `${dayName} ${slot.start}~${slot.end}`;
};

/**
 * 處理編輯按鈕點擊
 */
const handleEdit = (trainingPlan: TrainingPlan): void => {
  emit("edit", trainingPlan);
};
</script>

<style scoped>
.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--bc) / 0.2) transparent;
}

.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background-color: hsl(var(--bc) / 0.2);
  border-radius: 4px;
}
</style>
