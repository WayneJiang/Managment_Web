<template>
  <div
    class="card shadow-xl mt-2 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <h2 class="card-title text-2xl">學員列表</h2>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 mt-4"
      >
        <div
          v-for="trainee in trainees"
          :key="trainee.id"
          class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow duration-300"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }"
        >
          <div class="card-body p-2 sm:p-3">
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <svg
                  class="w-5 h-5 opacity-70"
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
                <span class="font-semibold text-sm opacity-80">學員姓名</span>
              </div>
              <div class="text-lg sm:text-xl font-bold">
                {{ trainee.name }}
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                <span class="font-semibold text-sm opacity-80"
                  >本期訓練計畫</span
                >
              </div>
              <div
                class="badge badge-lg"
                :class="getPlanTypeClass(trainee.trainingPlan[0]?.planType)"
              >
                {{ getPlanTypeLabel(trainee.trainingPlan[0]?.planType) }}
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
                <span class="font-semibold text-sm opacity-80"
                  >本期負責教練</span
                >
              </div>
              <div class="text-base font-medium">
                <span
                  :class="
                    getCoachNameClass(trainee.trainingPlan[0]?.coach?.name)
                  "
                >
                  {{ trainee.trainingPlan[0]?.coach?.name || "未指定" }}
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
                <span class="font-semibold text-sm opacity-80"
                  >本期訓練時段</span
                >
              </div>
              <div
                v-if="getTrainingSlots(trainee.trainingPlan[0]).length > 0"
                class="space-y-1"
              >
                <div
                  v-for="(slot, slotIndex) in getTrainingSlots(
                    trainee.trainingPlan[0]
                  )"
                  :key="slotIndex"
                  class="text-sm p-2 rounded bg-base-200"
                  :style="{ backgroundColor: 'var(--color-border)' }"
                >
                  {{ formatTrainingSlotText(slot) }}
                </div>
              </div>
              <div v-else class="text-base italic text-error">
                尚未設定訓練時段
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
                <span class="font-semibold text-sm opacity-80"
                  >本期剩餘額度</span
                >
              </div>
              <div class="text-lg font-bold">
                <span :class="getRemainingQuotaClass(trainee.trainingPlan[0])">
                  {{ getRemainingQuota(trainee.trainingPlan[0]) }}
                </span>
              </div>
            </div>

            <div
              v-if="trainee.trainingPlan[0]?.planType === 'group'"
              class="mb-4"
            >
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
                  >團體訓練夥伴</span
                >
              </div>
              <div class="space-y-1">
                <div
                  v-for="member in getGroupMembers(trainee)"
                  :key="member.id"
                  class="text-sm p-2 rounded bg-base-200"
                  :style="{ backgroundColor: 'var(--color-border)' }"
                >
                  {{ member.name }}
                </div>
              </div>
            </div>

            <div
              class="flex flex-col sm:flex-row gap-2 pt-3 border-t"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <button
                class="btn btn-sm flex-1"
                :style="{
                  backgroundColor: '#f97316',
                  color: '#fff',
                  borderColor: '#f97316',
                }"
                @click="handleUpdate(trainee)"
              >
                資料
              </button>
              <button
                class="btn btn-sm flex-1"
                :style="{
                  backgroundColor: '#f97316',
                  color: '#fff',
                  borderColor: '#f97316',
                }"
                @click="handleAdjust(trainee)"
              >
                計畫
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="trainees.length === 0" class="text-center py-8">
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          ></path>
        </svg>
        <p class="text-lg opacity-70">目前沒有學員記錄</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from "vue";
import type { Trainee } from "../services/trainee";
import type { TrainingPlan, TrainingTimeSlot } from "../services/trainingPlan";

interface Props {
  trainees: Trainee[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update", trainee: Trainee): void;
  (e: "adjust", trainee: Trainee): void;
}>();

/**
 * 獲取計畫類型標籤
 */
const getPlanTypeLabel = (planType: string | undefined): string => {
  if (!planType) return "未設定";

  const planTypeMap: Record<string, string> = {
    personal: "個人教練",
    block: "團體課程",
    sequential: "開放團課",
    group: "團體課程",
  };

  return planTypeMap[planType] || planType;
};

/**
 * 獲取計畫類型的樣式類別
 */
const getPlanTypeClass = (planType: string | undefined): string => {
  if (!planType || planType === "") {
    return "badge-error";
  }

  if (planType === "personal") {
    return "badge-primary";
  }

  return "badge-secondary";
};

/**
 * 獲取教練姓名的樣式類別
 */
const getCoachNameClass = (coachName: string | undefined): string => {
  return coachName ? "" : "text-error";
};

/**
 * 獲取訓練時段列表
 */
const getTrainingSlots = (
  trainingPlan: TrainingPlan | undefined
): TrainingTimeSlot[] => {
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
const getRemainingQuota = (
  trainingPlan: TrainingPlan | undefined
): string | number => {
  if (!trainingPlan?.planQuota || trainingPlan.usedQuota === undefined) {
    return "未設定";
  }

  const remainingQuota = Math.max(
    0,
    trainingPlan.planQuota - trainingPlan.usedQuota
  );
  return remainingQuota;
};

/**
 * 獲取剩餘額度的樣式類別
 */
const getRemainingQuotaClass = (
  trainingPlan: TrainingPlan | undefined
): string => {
  if (!trainingPlan?.planQuota || trainingPlan.usedQuota === undefined) {
    return "text-error";
  }

  const remainingQuota = Math.max(
    0,
    trainingPlan.planQuota - trainingPlan.usedQuota
  );

  if (remainingQuota === 0) {
    return "text-error";
  } else if (remainingQuota <= 2) {
    return "text-warning";
  } else {
    return "text-info";
  }
};

/**
 * 獲取團體訓練夥伴
 */
const getGroupMembers = (currentTrainee: Trainee): Trainee[] => {
  if (
    !currentTrainee.trainingPlan[0] ||
    currentTrainee.trainingPlan[0].planType !== "group"
  ) {
    return [];
  }

  const currentPlan = currentTrainee.trainingPlan[0];

  return props.trainees.filter((trainee) => {
    if (trainee.id === currentTrainee.id) {
      return false;
    }

    if (!trainee.trainingPlan[0]) {
      return false;
    }

    const traineePlan = trainee.trainingPlan[0];

    if (traineePlan.planType !== "group") {
      return false;
    }

    if (traineePlan.coach?.id !== currentPlan.coach?.id) {
      return false;
    }

    const currentSlots = JSON.stringify(
      getTrainingSlots(currentPlan).sort((a, b) =>
        a.dayOfWeek.localeCompare(b.dayOfWeek)
      )
    );

    const traineeSlots = JSON.stringify(
      getTrainingSlots(traineePlan).sort((a, b) =>
        a.dayOfWeek.localeCompare(b.dayOfWeek)
      )
    );

    return currentSlots === traineeSlots;
  });
};

/**
 * 處理更新按鈕點擊
 */
const handleUpdate = (trainee: Trainee): void => {
  emit("update", trainee);
};

/**
 * 處理調整按鈕點擊
 */
const handleAdjust = (trainee: Trainee): void => {
  emit("adjust", trainee);
};
</script>
