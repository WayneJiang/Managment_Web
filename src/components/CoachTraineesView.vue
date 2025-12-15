<template>
  <div
    v-if="isOpen"
    class="modal modal-open"
    @click.self="closeModal"
  >
    <div
      class="modal-box max-w-4xl"
      :style="{
        backgroundColor: 'var(--color-card-bg)',
        color: 'var(--color-text)',
      }"
    >
      <h3 class="font-bold text-2xl mb-4">
        {{ coach?.name }} - 負責學員列表
      </h3>

      <!-- 月份選擇器 -->
      <div class="mb-6">
        <label class="label">
          <span class="label-text font-semibold">選擇月份</span>
        </label>
        <input
          v-model="selectedMonth"
          type="month"
          class="input input-bordered w-full"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
          }"
        />
      </div>

      <!-- 學員列表 -->
      <div
        v-if="coachTrainees.length > 0"
        class="space-y-3 max-h-96 overflow-y-auto"
      >
        <div
          v-for="trainee in coachTrainees"
          :key="trainee.id"
          class="card bg-base-100 shadow-md"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }"
        >
          <div class="card-body p-3">
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
              <span class="text-lg font-bold">{{ trainee.name }}</span>
            </div>

            <div class="text-sm opacity-70">
              <div v-if="getPlansWithRecords(trainee).length > 0">
                <span class="font-semibold mb-2 block">{{ selectedMonth }} 簽到統計：</span>
                <div class="space-y-2">
                  <div
                    v-for="plan in getPlansWithRecords(trainee)"
                    :key="plan.id"
                    class="flex items-center justify-between"
                  >
                    <div class="flex items-center gap-2">
                      <div
                        class="badge badge-lg"
                        :class="getPlanTypeClass(plan.planType)"
                      >
                        {{ getPlanTypeLabel(plan.planType) }}
                      </div>
                      <span class="text-sm opacity-70">
                        {{ plan.coach?.name || '未指定' }}
                      </span>
                    </div>
                    <span class="text-lg font-bold text-success">
                      {{ getPlanCheckInCount(trainee, plan.id) }} 次
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 無學員提示 -->
      <div v-else class="text-center py-8">
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
        <p class="text-lg opacity-70">本月還沒有統計資料</p>
      </div>

      <!-- 關閉按鈕 -->
      <div class="modal-action">
        <button
          class="btn"
          :style="{
            backgroundColor: '#f97316',
            color: '#fff',
            borderColor: '#f97316',
          }"
          @click="closeModal"
        >
          關閉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import dayjs from "dayjs";
import type { Coach } from "../services/coach";
import type { Trainee } from "../services/trainee";
import type { TrainingPlan } from "../services/training-plan";

interface Props {
  isOpen: boolean;
  coach: Coach | null;
  trainees: Trainee[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

/**
 * 選擇的月份 (格式: YYYY-MM)
 */
const selectedMonth = ref<string>(dayjs().format("YYYY-MM"));

/**
 * 過濾出該教練負責的學員（且在選定月份有簽到紀錄）
 */
const coachTrainees = computed<Trainee[]>(() => {
  if (!props.coach) return [];

  return props.trainees.filter((trainee) => {
    // 檢查是否為該教練負責的學員
    const isCoachTrainee = trainee.trainingPlan.some(
      (plan) => plan.coach?.id === props.coach?.id
    );

    if (!isCoachTrainee) return false;

    // 檢查該學員在選定月份是否有任何簽到紀錄
    const hasRecords = getPlansWithRecords(trainee).length > 0;

    return hasRecords;
  });
});

/**
 * 獲取計畫類型標籤
 */
const getPlanTypeLabel = (planType: string | undefined): string => {
  if (!planType) return "未設定";

  const planTypeMap: Record<string, string> = {
    Personal: "個人教練",
    Block: "團體課程",
    Sequential: "開放團課",
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

  if (planType === "Personal") {
    return "badge-primary";
  }

  if (planType === "Block") {
    return "badge-success";
  }

  if (planType === "Sequential") {
    return "badge-warning";
  }

  return "badge-secondary";
};

/**
 * 獲取該學員在選定月份有簽到紀錄的訓練計畫
 */
const getPlansWithRecords = (trainee: Trainee): TrainingPlan[] => {
  if (!trainee.trainingPlan || !selectedMonth.value) {
    return [];
  }

  return trainee.trainingPlan.filter(plan => {
    const count = getPlanCheckInCount(trainee, plan.id);
    return count > 0;
  });
};

/**
 * 計算特定訓練計畫在選定月份的簽到次數
 */
const getPlanCheckInCount = (trainee: Trainee, planId: number): number => {
  if (!selectedMonth.value || !trainee.trainingPlan) {
    return 0;
  }

  // 找到對應的訓練計畫
  const plan = trainee.trainingPlan.find(p => p.id === planId);

  if (!plan || !plan.trainingRecord || !Array.isArray(plan.trainingRecord)) {
    return 0;
  }

  // 過濾出該月份的訓練紀錄
  const monthlyRecords = plan.trainingRecord.filter((record) => {
    if (!record || !record.createdDate) {
      return false;
    }

    // 檢查是否在選定月份
    const recordMonth = dayjs(record.createdDate).format("YYYY-MM");
    return recordMonth === selectedMonth.value;
  });

  return monthlyRecords.length;
};

/**
 * 關閉 Modal
 */
const closeModal = (): void => {
  emit("close");
};
</script>
