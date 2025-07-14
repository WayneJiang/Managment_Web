<template>
  <div class="w-full">
    <table
      class="table responsive-table w-full"
      :style="{ borderColor: 'var(--color-border)' }"
    >
      <thead
        class="sticky top-0"
        :style="{
          backgroundColor: 'var(--color-card-bg)',
          color: 'var(--color-text)',
        }"
      >
        <tr>
          <th class="text-center">開始</th>
          <th class="text-center">結束</th>
          <th class="text-center">計畫</th>
          <th class="text-center">教練</th>
          <th class="text-center">額度</th>
          <th class="text-center">已用</th>
          <th class="text-center">編輯</th>
          <th class="text-center">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="trainingPlan in trainingPlans"
          :key="trainingPlan.id"
          :style="{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-text)',
          }"
        >
          <td class="text-center" :data-label="'開始'">
            {{ formatDateTime(trainingPlan.planStartedAt) }}
          </td>
          <td class="text-center" :data-label="'結束'">
            {{ formatDateTime(trainingPlan.planEndedAt) }}
          </td>
          <td class="text-center" :data-label="'計畫'">
            {{ plan(trainingPlan.planType) }}
          </td>
          <td class="text-center" :data-label="'教練'">
            {{ trainingPlan.coach.name }}
          </td>
          <td class="text-center" :data-label="'額度'">
            {{ trainingPlan.planQuota }}
          </td>
          <td class="text-center" :data-label="'已用'">
            {{ trainingPlan.usedQuota }}
          </td>
          <td class="text-center" :data-label="'編輯'">
            {{ trainingPlan.editor.name }}
          </td>
          <td class="text-center" :data-label="'操作'">
            <div class="flex justify-center gap-2">
              <button
                class="btn btn-sm"
                :style="{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderColor: 'var(--color-primary)',
                }"
                @click="handleEdit(trainingPlan)"
                :disabled="trainingPlan.planStartedAt != undefined"
              >
                編輯
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="trainingPlans.length == 0">
          <td colspan="8" class="text-center py-4">尚無訓練計畫</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TrainingPlan } from "../services/trainingPlan";

dayjs.extend(utc);
dayjs.extend(timezone);

const props = defineProps<{
  trainingPlans: TrainingPlan[];
}>();

const emit = defineEmits<{
  (e: "edit", trainingPlan: TrainingPlan): void;
}>();

const formatDateTime = (timestamp: string | undefined): string => {
  return timestamp
    ? dayjs(timestamp).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss")
    : "";
};

const plan = (planType: string): string => {
  switch (planType) {
    case "private":
      return "個人教練";
    case "group":
      return "團體";
    default:
      return "";
  }
};

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
