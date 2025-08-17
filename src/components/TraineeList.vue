<template>
  <div
    class="card shadow-xl mt-4 w-full"
    :style="{
      backgroundColor: 'var(--color-card-bg)',
      color: 'var(--color-text)',
    }"
  >
    <div class="card-body">
      <h2 class="card-title text-2xl">學員列表</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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
          <div class="card-body p-4">
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
              <div class="text-xl font-bold">
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
                :class="{
                  'badge-primary':
                    trainee.trainingPlan[0]?.planType === 'private',
                  'badge-secondary':
                    trainee.trainingPlan[0]?.planType === 'group',
                }"
              >
                {{ plan(trainee.trainingPlan[0]?.planType) }}
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
                {{ trainee.trainingPlan[0]?.coach.name || "未指定" }}
              </div>
            </div>

            <!-- 本期訓練時段 -->
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
                v-if="
                  trainee.trainingPlan[0]?.trainingSlot &&
                  trainee.trainingPlan[0].trainingSlot.length > 0
                "
                class="space-y-1"
              >
                <div
                  v-for="(slot, slotIndex) in trainee.trainingPlan[0]
                    .trainingSlot"
                  :key="slotIndex"
                  class="text-sm p-2 rounded bg-base-200"
                  :style="{ backgroundColor: 'var(--color-border)' }"
                >
                  {{ formatTrainingSlotText(slot) }}
                </div>
              </div>
              <div v-else class="text-sm opacity-70 italic">
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
              <div class="text-lg font-bold text-info">
                {{
                  Math.max(
                    0,
                    trainee.trainingPlan[0]?.planQuota -
                      trainee.trainingPlan[0]?.usedQuota
                  )
                }}
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
              class="flex gap-2 pt-3 border-t"
              :style="{ borderColor: 'var(--color-border)' }"
            >
              <button
                class="btn btn-sm flex-1"
                :style="{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderColor: 'var(--color-primary)',
                }"
                @click="onUpdate(trainee)"
              >
                更新資料
              </button>
              <button
                class="btn btn-sm flex-1"
                :style="{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderColor: 'var(--color-primary)',
                }"
                @click="onAdjust(trainee)"
              >
                調整計畫
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
import { defineProps, defineEmits } from "vue";
import { Trainee } from "../services/trainee";
import { TrainingPlan } from "../services/trainingPlan";

interface Props {
  trainees: Trainee[];
}

const props = defineProps<Props>();

const plan = (planType: TrainingPlan["planType"]): string => {
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
    default:
      return "";
  }
};

const formatTrainingSlotText = (slot: any): string => {
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

const emit = defineEmits<{
  (e: "update", trainee: Trainee): void;
  (e: "adjust", trainee: Trainee): void;
}>();

const onUpdate = (trainee: Trainee): void => {
  emit("update", trainee);
};

const onAdjust = (trainee: Trainee): void => {
  emit("adjust", trainee);
};

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

    if (traineePlan.coach.id !== currentPlan.coach.id) {
      return false;
    }

    const currentSlots = JSON.stringify(
      currentPlan.trainingSlot?.sort((a, b) =>
        a.dayOfWeek.localeCompare(b.dayOfWeek)
      )
    );

    const traineeSlots = JSON.stringify(
      traineePlan.trainingSlot?.sort((a, b) =>
        a.dayOfWeek.localeCompare(b.dayOfWeek)
      )
    );

    if (currentSlots !== traineeSlots) {
      return false;
    }

    return true;
  });
};
</script>
