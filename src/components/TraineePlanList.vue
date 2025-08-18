<template>
  <div
    class="card shadow-xl mt-4 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <div class="flex justify-between items-center">
        <h2 class="card-title text-2xl">個人訓練計畫</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div
          v-for="(trainingPlan, index) in trainingPlans"
          :key="index"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }"
        >
          <div class="card-body p-4">
            <div class="flex justify-between items-start mb-3">
              <div
                class="badge badge-lg"
                :class="{
                  'badge-primary': trainingPlan.planType === 'private',
                  'badge-secondary': trainingPlan.planType === 'group',
                }"
              >
                {{ plan(trainingPlan.planType) }}
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
                <span class="text-sm opacity-80">指導教練</span>
              </div>
              <div class="text-base font-medium">
                {{ trainingPlan.coach.name }}
              </div>
            </div>

            <div
              class="flex justify-between items-center pt-3 border-t"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <div class="text-center">
                <div class="font-semibold text-sm opacity-80">總額度</div>
                <div class="font-bold text-lg">
                  {{ trainingPlan.planQuota }}
                </div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-sm opacity-80">剩餘</div>
                <div class="font-bold text-lg text-warning">
                  {{
                    Math.max(
                      0,
                      trainingPlan.planQuota - (trainingPlan.usedQuota || 0)
                    )
                  }}
                </div>
              </div>
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
        <p class="text-lg opacity-70">目前沒有訓練計畫</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TrainingPlan, TrainingSlot } from "../services/trainingPlan";

defineProps<{
  trainingPlans: TrainingPlan[];
}>();

dayjs.extend(utc);
dayjs.extend(timezone);

const plan = (planType: TrainingPlan["planType"]): string => {
  if (!planType) return "";
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
    default:
      return "";
  }
};

const formatDateTime = (timestamp: string | undefined): string => {
  return timestamp
    ? dayjs(timestamp).tz("Asia/Taipei").format("MM/DD HH:mm")
    : "";
};

const getTrainingSlots = (trainingPlan: TrainingPlan): TrainingSlot[] => {
  if (!trainingPlan?.trainingSlot) {
    return [];
  }

  if (Array.isArray(trainingPlan.trainingSlot)) {
    return trainingPlan.trainingSlot;
  }

  if (typeof trainingPlan.trainingSlot === "string") {
    try {
      const parsedSlots = JSON.parse(trainingPlan.trainingSlot);
      if (Array.isArray(parsedSlots)) {
        return parsedSlots;
      }
    } catch (error) {
      console.error("解析 trainingSlot JSON 字串失敗:", error);
    }
  }

  return [];
};

const formatTrainingSlotText = (slot: TrainingSlot): string => {
  // 防護措施：確保 slot 物件存在且包含必要屬性
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
    Sunday: "星期天",
  };

  const dayName = dayOfWeekMap[slot.dayOfWeek] || slot.dayOfWeek;
  return `${dayName} ${slot.start}~${slot.end}`;
};
</script>
