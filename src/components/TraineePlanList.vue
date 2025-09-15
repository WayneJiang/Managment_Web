<template>
  <div
    class="card shadow-xl mt-2 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <div class="flex justify-between items-center">
        <h2 class="card-title text-2xl">個人訓練計畫</h2>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 mt-4"
      >
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
          <div class="card-body p-2 sm:p-3">
            <div class="flex justify-between items-start mb-3">
              <div
                class="badge badge-lg"
                :class="{
                  'badge-primary': trainingPlan.planType === 'Personal',
                  'badge-success': trainingPlan.planType === 'Block',
                  'badge-warning': trainingPlan.planType === 'Sequential',
                  'badge-secondary':
                    trainingPlan.planType !== 'Personal' &&
                    trainingPlan.planType !== 'Block' &&
                    trainingPlan.planType !== 'Sequential',
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
                  {{ formatDateTime(trainingPlan.start) }}
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
                  {{ formatDateTime(trainingPlan.end) }}
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
                <span class="text-sm opacity-80">負責教練</span>
              </div>
              <div class="text-base font-medium">
                {{ trainingPlan.coach?.name || "未指定" }}
              </div>
            </div>

            <!-- 團隊課程夥伴欄位 -->
            <div v-if="trainingPlan.planType === 'Block'" class="mb-4">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                <span class="font-semibold text-sm opacity-80"
                  >團隊課程夥伴</span
                >
              </div>
              <div class="space-y-1">
                <div
                  v-if="getGroupMembers(trainingPlan).length > 0"
                  v-for="member in getGroupMembers(trainingPlan)"
                  :key="member.id"
                  class="text-sm p-2 rounded bg-base-200"
                  :style="{ backgroundColor: 'var(--color-border)' }"
                >
                  {{ member.name }}
                </div>
                <div v-else class="text-sm italic text-error">
                  目前沒有其他夥伴
                </div>
              </div>
            </div>

            <div
              class="flex justify-between items-center pt-3 border-t"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <div class="text-center">
                <div class="font-semibold text-sm opacity-80">總額度</div>
                <div class="font-bold text-lg">
                  {{ trainingPlan.quota }}
                </div>
              </div>
              <div class="text-center">
                <div class="font-semibold text-sm opacity-80">剩餘</div>
                <div
                  class="font-bold text-lg"
                  :class="getRemainingQuotaClass(trainingPlan)"
                >
                  {{ getRemainingQuota(trainingPlan) }}
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
import type { TrainingPlan, TrainingTimeSlot } from "../services/trainingPlan";
import type { Trainee } from "../services/trainee";

dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps<{
  trainingPlans: TrainingPlan[];
  trainees?: Trainee[];
  currentTrainee?: Trainee;
}>();

/**
 * 格式化日期時間
 */
const formatDateTime = (timestamp: string | undefined): string => {
  if (!timestamp) return "";

  try {
    return dayjs(timestamp).tz("Asia/Taipei").format("YYYY/MM/DD HH:mm");
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
    Personal: "個人教練",
    Block: "團體課程",
    Sequential: "開放團課",
  };

  return planTypeMap[planType] || planType;
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
 * 計算剩餘額度
 */
const getRemainingQuota = (trainingPlan: TrainingPlan): number => {
  const trainingRecordCount = trainingPlan.trainingRecord?.length || 0;
  const planQuota = trainingPlan.quota;

  return Math.max(0, planQuota - trainingRecordCount);
};

/**
 * 獲取剩餘額度的樣式類別
 */
const getRemainingQuotaClass = (trainingPlan: TrainingPlan): string => {
  const remainingQuota = getRemainingQuota(trainingPlan);

  if (remainingQuota === 0) {
    return "text-error";
  } else if (remainingQuota <= 2) {
    return "text-warning";
  } else {
    return "text-info";
  }
};

/**
 * 獲取團體課程夥伴
 */
const getGroupMembers = (currentPlan: TrainingPlan): Trainee[] => {
  if (
    !props.trainees ||
    !props.currentTrainee ||
    currentPlan.planType !== "Block"
  ) {
    return [];
  }

  const groupMembers: Trainee[] = [];

  // 尋找有相同團體計畫的夥伴
  const members = props.trainees.filter((trainee) => {
    if (trainee.id === props.currentTrainee?.id) {
      return false;
    }

    // 檢查該學員是否有相同的團體計畫
    const matchingPlan = trainee.trainingPlan.find(
      (plan) =>
        plan.planType === "Block" && plan.coach?.id === currentPlan.coach?.id
    );

    if (!matchingPlan) {
      return false;
    }

    const currentSlots = JSON.stringify(
      getTrainingSlots(currentPlan).sort((a, b) =>
        a.dayOfWeek.localeCompare(b.dayOfWeek)
      )
    );

    const traineeSlots = JSON.stringify(
      getTrainingSlots(matchingPlan).sort((a, b) =>
        a.dayOfWeek.localeCompare(b.dayOfWeek)
      )
    );

    return currentSlots === traineeSlots;
  });

  // 避免重複添加相同的夥伴
  members.forEach((member) => {
    if (!groupMembers.find((existing) => existing.id === member.id)) {
      groupMembers.push(member);
    }
  });

  return groupMembers;
};
</script>
