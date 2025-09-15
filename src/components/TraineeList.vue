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

      <!-- 搜尋欄位 -->
      <div class="mt-4 mb-6">
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜尋學員姓名或手機號碼..."
            class="input input-bordered w-full pl-10 pr-4 py-2"
            :style="{
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text)',
              borderColor: 'var(--color-border)',
            }"
          />
        </div>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 mt-4"
      >
        <div
          v-for="trainee in filteredTrainees"
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
              <div class="flex items-center gap-2">
                <div class="text-lg sm:text-xl font-bold">
                  {{ trainee.name }}
                </div>
                <div
                  class="badge badge-sm"
                  :class="
                    getAgeTagClass(getAgeTag(calculateAge(trainee.birthday)))
                  "
                >
                  {{ getAgeTag(calculateAge(trainee.birthday)) }}
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                <span class="font-semibold text-sm opacity-80">訓練計畫</span>
              </div>
              <div v-if="trainee.trainingPlan.length > 0" class="space-y-2">
                <div
                  v-for="(plan, planIndex) in trainee.trainingPlan"
                  :key="plan.id"
                  class="p-2 rounded border"
                  :style="{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border)',
                  }"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div
                      class="badge badge-sm"
                      :class="getPlanTypeClass(plan.planType)"
                    >
                      {{ getPlanTypeLabel(plan.planType) }}
                    </div>
                    <span class="text-xs opacity-70"
                      >計畫 {{ planIndex + 1 }}</span
                    >
                  </div>

                  <!-- 教練資訊 -->
                  <div class="text-xs mb-1">
                    <span class="opacity-70">教練：</span>
                    <span :class="getCoachNameClass(plan.coach?.name)">
                      {{ plan.coach?.name || "未指定" }}
                    </span>
                  </div>

                  <!-- 訓練時段 -->
                  <div class="text-xs mb-1">
                    <span class="opacity-70">時段：</span>
                    <div
                      v-if="getTrainingSlots(plan).length > 0"
                      class="mt-1 space-y-1"
                    >
                      <div
                        v-for="(slot, slotIndex) in getTrainingSlots(plan)"
                        :key="slotIndex"
                        class="text-xs p-1 rounded bg-base-200"
                        :style="{ backgroundColor: 'var(--color-border)' }"
                      >
                        {{ formatTrainingSlotText(slot) }}
                      </div>
                    </div>
                    <span v-else class="text-error">未設定</span>
                  </div>

                  <!-- 剩餘額度 -->
                  <div class="text-xs">
                    <span class="opacity-70">剩餘：</span>
                    <span :class="getRemainingQuotaClass(plan)">
                      {{ getRemainingQuota(plan) }} 堂
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm italic text-error">
                尚未設定訓練計畫
              </div>
            </div>

            <div v-if="hasGroupPlan(trainee)" class="mb-4">
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
                  >團體課程夥伴</span
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

            <!-- 備註欄位 -->
            <div v-if="trainee.note && trainee.note.trim()" class="mb-4">
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
                <span class="font-semibold text-sm opacity-80">備註</span>
              </div>
              <div
                class="text-sm p-2 rounded border"
                :style="{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: 'var(--color-border)',
                }"
              >
                {{ trainee.note }}
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
                編輯資料
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
                管理計畫
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredTrainees.length === 0" class="text-center py-8">
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
        <p class="text-lg opacity-70">
          {{ searchQuery ? "找不到符合搜尋條件的學員" : "目前沒有學員記錄" }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { defineEmits } from "vue";
import dayjs from "dayjs";
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
 * 搜尋查詢字串
 */
const searchQuery = ref<string>("");

/**
 * 計算學員年紀
 */
const calculateAge = (birthday: string): number => {
  if (!birthday || birthday === "1900-01-01") {
    return 0;
  }
  return dayjs().diff(dayjs(birthday), "year");
};

/**
 * 根據年紀獲取年紀標籤
 */
const getAgeTag = (age: number): string => {
  if (age === 0) {
    return "未知";
  }

  if (age >= 6 && age <= 11) {
    return "兒童期";
  } else if (age >= 12 && age <= 17) {
    return "青少年";
  } else if (age >= 18 && age <= 29) {
    return "青年";
  } else if (age >= 30 && age <= 44) {
    return "青壯年";
  } else if (age >= 45 && age <= 59) {
    return "中年";
  } else if (age >= 60 && age <= 64) {
    return "中老年";
  } else if (age >= 65) {
    return "老年";
  } else {
    return "兒童";
  }
};

/**
 * 根據年紀標籤獲取對應的樣式類別
 */
const getAgeTagClass = (ageTag: string): string => {
  switch (ageTag) {
    case "兒童期":
    case "兒童":
      return "badge-primary";
    case "青少年":
      return "badge-secondary";
    case "青年":
      return "badge-accent";
    case "青壯年":
      return "badge-info";
    case "中年":
      return "badge-warning";
    case "中老年":
      return "badge-error";
    case "老年":
      return "badge-neutral";
    default:
      return "badge-ghost";
  }
};

/**
 * 過濾後的學員列表
 */
const filteredTrainees = computed<Trainee[]>(() => {
  if (!searchQuery.value.trim()) {
    return props.trainees;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return props.trainees.filter((trainee) => {
    const nameMatch = trainee.name.toLowerCase().includes(query);
    const phoneMatch = trainee.phone.toLowerCase().includes(query);
    return nameMatch || phoneMatch;
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
  if (!trainingPlan?.quota) {
    return "未設定";
  }

  const trainingRecordCount = trainingPlan.trainingRecord?.length || 0;
  const remainingQuota = Math.max(0, trainingPlan.quota - trainingRecordCount);
  return remainingQuota;
};

/**
 * 獲取剩餘額度的樣式類別
 */
const getRemainingQuotaClass = (
  trainingPlan: TrainingPlan | undefined
): string => {
  if (!trainingPlan?.quota) {
    return "text-error";
  }

  const trainingRecordCount = trainingPlan.trainingRecord?.length || 0;
  const remainingQuota = Math.max(0, trainingPlan.quota - trainingRecordCount);

  if (remainingQuota === 0) {
    return "text-error";
  } else if (remainingQuota <= 2) {
    return "text-warning";
  } else {
    return "text-info";
  }
};

/**
 * 檢查學員是否有團體訓練計畫
 */
const hasGroupPlan = (trainee: Trainee): boolean => {
  return trainee.trainingPlan.some((plan) => plan.planType === "Block");
};

/**
 * 比較兩個訓練時段陣列是否相同
 */
const compareTrainingSlots = (
  slots1: TrainingTimeSlot[],
  slots2: TrainingTimeSlot[]
): boolean => {
  if (slots1.length !== slots2.length) {
    return false;
  }

  // 排序後比較每個時段
  const sortedSlots1 = [...slots1].sort((a, b) =>
    a.dayOfWeek.localeCompare(b.dayOfWeek)
  );
  const sortedSlots2 = [...slots2].sort((a, b) =>
    a.dayOfWeek.localeCompare(b.dayOfWeek)
  );

  return sortedSlots1.every((slot1, index) => {
    const slot2 = sortedSlots2[index];
    return (
      slot1.dayOfWeek === slot2.dayOfWeek &&
      slot1.start === slot2.start &&
      slot1.end === slot2.end
    );
  });
};

/**
 * 檢查兩個訓練計畫是否為相同的團體課程
 */
const isSameGroupPlan = (plan1: TrainingPlan, plan2: TrainingPlan): boolean => {
  // 基本條件檢查
  if (
    plan1.planType !== "Block" ||
    plan2.planType !== "Block" ||
    plan1.coach?.id !== plan2.coach?.id
  ) {
    return false;
  }

  // 比較訓練時段
  const slots1 = getTrainingSlots(plan1);
  const slots2 = getTrainingSlots(plan2);

  return compareTrainingSlots(slots1, slots2);
};

/**
 * 獲取團體課程夥伴
 */
const getGroupMembers = (currentTrainee: Trainee): Trainee[] => {
  const groupPlans = currentTrainee.trainingPlan.filter(
    (plan) => plan.planType === "Block"
  );

  if (groupPlans.length === 0) {
    return [];
  }

  const groupMembers: Trainee[] = [];

  // 對每個團體計畫尋找夥伴
  groupPlans.forEach((currentPlan) => {
    const members = props.trainees.filter((trainee) => {
      if (trainee.id === currentTrainee.id) {
        return false;
      }

      // 檢查該學員是否有相同的團體計畫
      const matchingPlan = trainee.trainingPlan.find((plan) =>
        isSameGroupPlan(currentPlan, plan)
      );

      return !!matchingPlan;
    });

    // 避免重複添加相同的夥伴
    members.forEach((member) => {
      if (!groupMembers.find((existing) => existing.id === member.id)) {
        groupMembers.push(member);
      }
    });
  });

  return groupMembers;
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
